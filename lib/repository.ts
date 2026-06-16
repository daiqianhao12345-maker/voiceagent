import { randomUUID } from "crypto";
import { hasDatabase, sql } from "@/lib/db";
import { demoActivity, demoCalls, demoCustomers, demoMeetings, demoScrapedData } from "@/lib/mock-data";
import type { ActivityLog, Call, Customer, CustomerStatus, DashboardStats, Meeting, ScrapedData } from "@/types/crm";

type Store = {
  customers: Customer[];
  calls: Call[];
  meetings: Meeting[];
  activity: ActivityLog[];
  scrapedData: ScrapedData[];
};

const globalStore = globalThis as typeof globalThis & { crmStore?: Store };
let schemaReady = false;

async function ensureCrmSchema() {
  if (!hasDatabase || !sql || schemaReady) return;
  await sql`alter table customers add column if not exists title text`;
  await sql`alter table customers add column if not exists background_summary text`;
  await sql`alter table customers add column if not exists company_summary text`;
  await sql`alter table customers add column if not exists role_summary text`;
  await sql`alter table customers add column if not exists pain_points text`;
  await sql`alter table customers add column if not exists needs text`;
  await sql`alter table customers add column if not exists budget text`;
  await sql`alter table customers add column if not exists decision_authority text`;
  await sql`alter table customers add column if not exists intelligence_status text default 'pending'`;
  await sql`alter table calls add column if not exists vapi_call_id text`;
  await sql`alter table calls add column if not exists interest_level text`;
  await sql`alter table calls add column if not exists meeting_recommended boolean`;
  await sql`alter table calls add column if not exists lead_score integer`;
  await sql`alter table calls add column if not exists call_started_at timestamp`;
  await sql`alter table calls add column if not exists call_ended_at timestamp`;
  await sql`alter table meetings add column if not exists source_call_id uuid references calls(id) on delete set null`;
  await sql`alter table meetings add column if not exists meeting_title text`;
  await sql`alter table meetings add column if not exists meeting_reason text`;
  await sql`alter table meetings add column if not exists customer_intent text`;
  await sql`alter table meetings add column if not exists confirmation_status text`;
  await sql`alter table meetings add column if not exists calendar_event_url text`;
  await sql`alter table meetings add column if not exists follow_up_action text`;
  await sql`alter table scraped_data add column if not exists customer_id uuid references customers(id) on delete set null`;
  await sql`alter table scraped_data add column if not exists call_id uuid references calls(id) on delete set null`;
  await sql`alter table scraped_data add column if not exists contact_name text`;
  await sql`alter table scraped_data add column if not exists title text`;
  await sql`alter table scraped_data add column if not exists role_summary text`;
  await sql`alter table scraped_data add column if not exists source_notes text`;
  schemaReady = true;
}

function store(): Store {
  if (!globalStore.crmStore) {
    globalStore.crmStore = {
      customers: [...demoCustomers],
      calls: [...demoCalls],
      meetings: [...demoMeetings],
      activity: [...demoActivity],
      scrapedData: [...demoScrapedData]
    };
  }
  return globalStore.crmStore;
}

export async function listCustomers(): Promise<Customer[]> {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    return (await sql`select * from customers order by created_at desc`) as Customer[];
  }
  return store().customers.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function getCustomer(id: string) {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
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
    title: input.title || null,
    source: input.source || "Manual",
    status: (input.status || "new") as CustomerStatus,
    notes: input.notes || null,
    background_summary: input.background_summary || null,
    company_summary: input.company_summary || null,
    role_summary: input.role_summary || null,
    pain_points: input.pain_points || null,
    needs: input.needs || null,
    budget: input.budget || null,
    decision_authority: input.decision_authority || null,
    intelligence_status: input.intelligence_status || "pending",
    lead_score: Number(input.lead_score || 35),
    revenue: Number(input.revenue || 0)
  };

  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const rows = (await sql`
      insert into customers (
        name, email, phone, company, title, source, status, notes,
        background_summary, company_summary, role_summary, pain_points, needs, budget, decision_authority, intelligence_status,
        lead_score, revenue
      )
      values (
        ${payload.name}, ${payload.email}, ${payload.phone}, ${payload.company}, ${payload.title}, ${payload.source}, ${payload.status}, ${payload.notes},
        ${payload.background_summary}, ${payload.company_summary}, ${payload.role_summary}, ${payload.pain_points}, ${payload.needs}, ${payload.budget}, ${payload.decision_authority}, ${payload.intelligence_status},
        ${payload.lead_score}, ${payload.revenue}
      )
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

export async function upsertCustomerByEmail(input: Partial<Customer>) {
  const email = input.email?.trim().toLowerCase();
  if (!email) return createCustomer(input);

  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const existing = (await sql`select * from customers where lower(email) = ${email} limit 1`) as Customer[];
    if (existing[0]) {
      return updateCustomer(existing[0].id, input);
    }
    return createCustomer({ ...input, email });
  }

  const data = store();
  const existing = data.customers.find((customer) => customer.email?.toLowerCase() === email);
  if (existing) {
    return updateCustomer(existing.id, input);
  }
  return createCustomer({ ...input, email });
}

export async function updateCustomer(id: string, input: Partial<Customer>) {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const rows = (await sql`
      update customers
      set name = coalesce(${input.name}, name),
          email = coalesce(${input.email}, email),
          phone = coalesce(${input.phone}, phone),
          company = coalesce(${input.company}, company),
          title = coalesce(${input.title}, title),
          source = coalesce(${input.source}, source),
          status = coalesce(${input.status}, status),
          notes = coalesce(${input.notes}, notes),
          background_summary = coalesce(${input.background_summary}, background_summary),
          company_summary = coalesce(${input.company_summary}, company_summary),
          role_summary = coalesce(${input.role_summary}, role_summary),
          pain_points = coalesce(${input.pain_points}, pain_points),
          needs = coalesce(${input.needs}, needs),
          budget = coalesce(${input.budget}, budget),
          decision_authority = coalesce(${input.decision_authority}, decision_authority),
          intelligence_status = coalesce(${input.intelligence_status}, intelligence_status),
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
    await ensureCrmSchema();
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
    await ensureCrmSchema();
    const rows = (await sql`
      insert into calls (
        customer_id, vapi_call_id, call_status, transcript, ai_summary, sentiment,
        interest_level, meeting_recommended, next_action, lead_score, duration, recording_url, call_started_at, call_ended_at
      )
      values (
        ${input.customer_id}, ${input.vapi_call_id ?? null}, ${status}, ${input.transcript ?? null}, ${input.ai_summary ?? null}, ${input.sentiment ?? null},
        ${input.interest_level ?? null}, ${input.meeting_recommended ?? null}, ${input.next_action ?? null}, ${input.lead_score ?? null}, ${input.duration ?? null}, ${input.recording_url ?? null}, ${input.call_started_at ?? null}, ${input.call_ended_at ?? null}
      )
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
    vapi_call_id: input.vapi_call_id ?? null,
    call_status: status,
    transcript: input.transcript ?? null,
    ai_summary: input.ai_summary ?? null,
    sentiment: input.sentiment ?? null,
    interest_level: input.interest_level ?? null,
    meeting_recommended: input.meeting_recommended ?? null,
    next_action: input.next_action ?? null,
    lead_score: input.lead_score ?? null,
    duration: input.duration ?? null,
    recording_url: input.recording_url ?? null,
    call_started_at: input.call_started_at ?? null,
    call_ended_at: input.call_ended_at ?? null,
    created_at: new Date().toISOString()
  };
  store().calls.unshift(call);
  await createActivity(call.customer_id, "call_created", `Call marked ${status}.`);
  return call;
}

export async function getCall(id: string) {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const rows = (await sql`
      select calls.*, customers.name as customer_name
      from calls left join customers on customers.id = calls.customer_id
      where calls.id = ${id}
      limit 1
    `) as Call[];
    return rows[0] ?? null;
  }
  return store().calls.find((call) => call.id === id) ?? null;
}

export async function listMeetings(customerId?: string): Promise<Meeting[]> {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
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
    await ensureCrmSchema();
    const rows = (await sql`
      insert into meetings (
        customer_id, source_call_id, meeting_title, meeting_time, meeting_status, meeting_notes,
        meeting_reason, customer_intent, confirmation_status, calendar_event_url, follow_up_action
      )
      values (
        ${input.customer_id}, ${input.source_call_id ?? null}, ${input.meeting_title ?? null}, ${input.meeting_time ?? null}, ${input.meeting_status ?? "booked"}, ${input.meeting_notes ?? null},
        ${input.meeting_reason ?? null}, ${input.customer_intent ?? null}, ${input.confirmation_status ?? null}, ${input.calendar_event_url ?? null}, ${input.follow_up_action ?? null}
      )
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
    source_call_id: input.source_call_id ?? null,
    meeting_title: input.meeting_title ?? null,
    meeting_time: input.meeting_time ?? null,
    meeting_status: input.meeting_status ?? "booked",
    meeting_notes: input.meeting_notes ?? null,
    meeting_reason: input.meeting_reason ?? null,
    customer_intent: input.customer_intent ?? null,
    confirmation_status: input.confirmation_status ?? null,
    calendar_event_url: input.calendar_event_url ?? null,
    follow_up_action: input.follow_up_action ?? null,
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

export async function listScrapedData(): Promise<ScrapedData[]> {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    return (await sql`select * from scraped_data order by created_at desc`) as ScrapedData[];
  }
  return store().scrapedData.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function getScrapedData(id: string) {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const rows = (await sql`select * from scraped_data where id = ${id} limit 1`) as ScrapedData[];
    return rows[0] ?? null;
  }
  return store().scrapedData.find((item) => item.id === id) ?? null;
}

export async function createScrapedData(input: Partial<ScrapedData>) {
  const payload = {
    customer_id: input.customer_id || null,
    call_id: input.call_id || null,
    business_name: input.business_name || null,
    contact_name: input.contact_name || null,
    title: input.title || null,
    phone: input.phone || null,
    email: input.email || null,
    website: input.website || null,
    source_url: input.source_url || null,
    summary: input.summary || null,
    role_summary: input.role_summary || null,
    source_notes: input.source_notes || null,
    status: input.status || "new"
  };

  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const rows = (await sql`
      insert into scraped_data (
        customer_id, call_id, business_name, contact_name, title, phone, email, website,
        source_url, summary, role_summary, source_notes, status
      )
      values (
        ${payload.customer_id}, ${payload.call_id}, ${payload.business_name}, ${payload.contact_name}, ${payload.title}, ${payload.phone}, ${payload.email}, ${payload.website},
        ${payload.source_url}, ${payload.summary}, ${payload.role_summary}, ${payload.source_notes}, ${payload.status}
      )
      returning *
    `) as ScrapedData[];
    await createActivity(null, "scraped_data_created", `${payload.business_name || "A scraped lead"} was stored.`);
    return rows[0];
  }

  const item: ScrapedData = {
    id: randomUUID(),
    ...payload,
    created_at: new Date().toISOString()
  };
  store().scrapedData.unshift(item);
  await createActivity(null, "scraped_data_created", `${payload.business_name || "A scraped lead"} was stored.`);
  return item;
}

export async function updateScrapedData(id: string, input: Partial<ScrapedData>) {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    const rows = (await sql`
      update scraped_data
      set customer_id = coalesce(${input.customer_id}, customer_id),
          call_id = coalesce(${input.call_id}, call_id),
          business_name = coalesce(${input.business_name}, business_name),
          contact_name = coalesce(${input.contact_name}, contact_name),
          title = coalesce(${input.title}, title),
          phone = coalesce(${input.phone}, phone),
          email = coalesce(${input.email}, email),
          website = coalesce(${input.website}, website),
          source_url = coalesce(${input.source_url}, source_url),
          summary = coalesce(${input.summary}, summary),
          role_summary = coalesce(${input.role_summary}, role_summary),
          source_notes = coalesce(${input.source_notes}, source_notes),
          status = coalesce(${input.status}, status)
      where id = ${id}
      returning *
    `) as ScrapedData[];
    if (rows[0]) await createActivity(null, "scraped_data_updated", `${rows[0].business_name || "A scraped lead"} was updated.`);
    return rows[0] ?? null;
  }

  const data = store();
  const index = data.scrapedData.findIndex((item) => item.id === id);
  if (index === -1) return null;
  data.scrapedData[index] = { ...data.scrapedData[index], ...input };
  await createActivity(null, "scraped_data_updated", `${data.scrapedData[index].business_name || "A scraped lead"} was updated.`);
  return data.scrapedData[index];
}

export async function deleteScrapedData(id: string) {
  if (hasDatabase && sql) {
    await ensureCrmSchema();
    await sql`delete from scraped_data where id = ${id}`;
    return true;
  }
  const data = store();
  data.scrapedData = data.scrapedData.filter((item) => item.id !== id);
  return true;
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
