import { randomUUID } from "crypto";
import { hasDatabase, sql } from "@/lib/db";
import { demoActivity, demoCalls, demoCustomers, demoMeetings } from "@/lib/mock-data";
import type { ActivityLog, Call, Customer, CustomerStatus, DashboardStats, Meeting } from "@/types/crm";

type Store = {
  customers: Customer[];
  calls: Call[];
  meetings: Meeting[];
  activity: ActivityLog[];
};

const globalStore = globalThis as typeof globalThis & { crmStore?: Store };

function store(): Store {
  if (!globalStore.crmStore) {
    globalStore.crmStore = {
      customers: [...demoCustomers],
      calls: [...demoCalls],
      meetings: [...demoMeetings],
      activity: [...demoActivity]
    };
  }
  return globalStore.crmStore;
}

export async function listCustomers(): Promise<Customer[]> {
  if (hasDatabase && sql) {
    return (await sql`select * from customers order by created_at desc`) as Customer[];
  }
  return store().customers.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function getCustomer(id: string) {
  if (hasDatabase && sql) {
    const rows = (await sql`select * from customers where id = ${id} limit 1`) as Customer[];
    return rows[0] ?? null;
  }
  return store().customers.find((customer) => customer.id === id) ?? null;
}

export async function createCustomer(input: Partial<Customer>) {
  const payload = {
    name: String(input.name || "Untitled Lead"),
    email: input.email || null,
    phone: input.phone || null,
    company: input.company || null,
    source: input.source || "Manual",
    status: (input.status || "new") as CustomerStatus,
    notes: input.notes || null,
    lead_score: Number(input.lead_score || 35),
    revenue: Number(input.revenue || 0)
  };

  if (hasDatabase && sql) {
    const rows = (await sql`
      insert into customers (name, email, phone, company, source, status, notes, lead_score, revenue)
      values (${payload.name}, ${payload.email}, ${payload.phone}, ${payload.company}, ${payload.source}, ${payload.status}, ${payload.notes}, ${payload.lead_score}, ${payload.revenue})
      returning *
    `) as Customer[];
    await createActivity(rows[0].id, "customer_created", `${rows[0].name} was added to the CRM.`);
    return rows[0];
  }

  const customer: Customer = {
    id: randomUUID(),
    ...payload,
    created_at: new Date().toISOString()
  };
  store().customers.unshift(customer);
  await createActivity(customer.id, "customer_created", `${customer.name} was added to the CRM.`);
  return customer;
}

export async function updateCustomer(id: string, input: Partial<Customer>) {
  if (hasDatabase && sql) {
    const rows = (await sql`
      update customers
      set name = coalesce(${input.name}, name),
          email = ${input.email ?? null},
          phone = ${input.phone ?? null},
          company = ${input.company ?? null},
          source = ${input.source ?? null},
          status = coalesce(${input.status}, status),
          notes = ${input.notes ?? null},
          lead_score = coalesce(${input.lead_score}, lead_score),
          revenue = coalesce(${input.revenue}, revenue)
      where id = ${id}
      returning *
    `) as Customer[];
    if (rows[0]) await createActivity(id, "customer_updated", `${rows[0].name} was updated.`);
    return rows[0] ?? null;
  }

  const data = store();
  const index = data.customers.findIndex((customer) => customer.id === id);
  if (index === -1) return null;
  data.customers[index] = { ...data.customers[index], ...input };
  await createActivity(id, "customer_updated", `${data.customers[index].name} was updated.`);
  return data.customers[index];
}

export async function deleteCustomer(id: string) {
  if (hasDatabase && sql) {
    await sql`delete from customers where id = ${id}`;
    return true;
  }
  const data = store();
  data.customers = data.customers.filter((customer) => customer.id !== id);
  data.calls = data.calls.filter((call) => call.customer_id !== id);
  data.meetings = data.meetings.filter((meeting) => meeting.customer_id !== id);
  return true;
}

export async function listCalls(customerId?: string): Promise<Call[]> {
  if (hasDatabase && sql) {
    const rows = customerId
      ? await sql`
          select calls.*, customers.name as customer_name
          from calls left join customers on customers.id = calls.customer_id
          where customer_id = ${customerId}
          order by calls.created_at desc
        `
      : await sql`
          select calls.*, customers.name as customer_name
          from calls left join customers on customers.id = calls.customer_id
          order by calls.created_at desc
        `;
    return rows as Call[];
  }
  return store().calls
    .filter((call) => !customerId || call.customer_id === customerId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function createCall(input: Partial<Call>) {
  const status = input.call_status || "pending";
  if (hasDatabase && sql) {
    const rows = (await sql`
      insert into calls (customer_id, call_status, transcript, ai_summary, sentiment, next_action, duration, recording_url)
      values (${input.customer_id}, ${status}, ${input.transcript ?? null}, ${input.ai_summary ?? null}, ${input.sentiment ?? null}, ${input.next_action ?? null}, ${input.duration ?? null}, ${input.recording_url ?? null})
      returning *
    `) as Call[];
    await createActivity(String(input.customer_id), "call_created", `Call marked ${status}.`);
    return rows[0];
  }

  const customer = store().customers.find((item) => item.id === input.customer_id);
  const call: Call = {
    id: randomUUID(),
    customer_id: String(input.customer_id),
    customer_name: customer?.name,
    call_status: status,
    transcript: input.transcript ?? null,
    ai_summary: input.ai_summary ?? null,
    sentiment: input.sentiment ?? null,
    next_action: input.next_action ?? null,
    duration: input.duration ?? null,
    recording_url: input.recording_url ?? null,
    created_at: new Date().toISOString()
  };
  store().calls.unshift(call);
  await createActivity(call.customer_id, "call_created", `Call marked ${status}.`);
  return call;
}

export async function listMeetings(customerId?: string): Promise<Meeting[]> {
  if (hasDatabase && sql) {
    const rows = customerId
      ? await sql`
          select meetings.*, customers.name as customer_name
          from meetings left join customers on customers.id = meetings.customer_id
          where customer_id = ${customerId}
          order by meeting_time asc nulls last
        `
      : await sql`
          select meetings.*, customers.name as customer_name
          from meetings left join customers on customers.id = meetings.customer_id
          order by meeting_time asc nulls last
        `;
    return rows as Meeting[];
  }
  return store().meetings.filter((meeting) => !customerId || meeting.customer_id === customerId);
}

export async function createMeeting(input: Partial<Meeting>) {
  if (hasDatabase && sql) {
    const rows = (await sql`
      insert into meetings (customer_id, meeting_time, meeting_status, meeting_notes)
      values (${input.customer_id}, ${input.meeting_time ?? null}, ${input.meeting_status ?? "booked"}, ${input.meeting_notes ?? null})
      returning *
    `) as Meeting[];
    await createActivity(String(input.customer_id), "meeting_created", "Meeting was added.");
    return rows[0];
  }

  const customer = store().customers.find((item) => item.id === input.customer_id);
  const meeting: Meeting = {
    id: randomUUID(),
    customer_id: String(input.customer_id),
    customer_name: customer?.name,
    meeting_time: input.meeting_time ?? null,
    meeting_status: input.meeting_status ?? "booked",
    meeting_notes: input.meeting_notes ?? null,
    created_at: new Date().toISOString()
  };
  store().meetings.unshift(meeting);
  await createActivity(meeting.customer_id, "meeting_created", "Meeting was added.");
  return meeting;
}

export async function createActivity(customerId: string | null, activityType: string, description: string) {
  if (hasDatabase && sql) {
    await sql`
      insert into activity_logs (customer_id, activity_type, description)
      values (${customerId}, ${activityType}, ${description})
    `;
    return;
  }

  store().activity.unshift({
    id: randomUUID(),
    customer_id: customerId,
    activity_type: activityType,
    description,
    created_at: new Date().toISOString()
  });
}

export async function listActivity(limit = 8): Promise<ActivityLog[]> {
  if (hasDatabase && sql) {
    return (await sql`select * from activity_logs order by created_at desc limit ${limit}`) as ActivityLog[];
  }
  return store().activity.slice(0, limit);
}

export async function dashboardStats(): Promise<DashboardStats> {
  const customers = await listCustomers();
  const calls = await listCalls();
  const meetings = await listMeetings();
  const closedDeals = customers.filter((customer) => customer.status === "closed").length;
  const interestedLeads = customers.filter((customer) =>
    ["interested", "meeting_booked", "closed"].includes(customer.status)
  ).length;
  const revenue = customers.reduce((total, customer) => total + Number(customer.revenue || 0), 0);

  return {
    totalCustomers: customers.length,
    totalCalls: calls.length,
    totalMeetings: meetings.length,
    interestedLeads,
    closedDeals,
    revenue,
    conversionRate: customers.length ? Math.round((closedDeals / customers.length) * 100) : 0
  };
}
