import { createActivity, createCall, getCustomer, updateCustomer } from "@/lib/repository";

export const workflowTemplates = [
  {
    name: "Lead Collection",
    source: "My workflow 4.json",
    description: "Scrapes company websites from Google Sheets rows and creates CRM-ready leads.",
    status: "Ready to connect"
  },
  {
    name: "Voice Calling",
    source: "My workflow 3.json",
    description: "Sends leads into Vapi, captures transcript data, and prepares AI call analysis.",
    status: "Vapi configured"
  },
  {
    name: "Meeting Booking",
    source: "My workflow 2.json",
    description: "Reads meeting emails, creates calendar events, and sends confirmations.",
    status: "Needs calendar auth"
  },
  {
    name: "Email Outreach",
    source: "My workflow (2).json",
    description: "Generates friendly outreach emails and sends them through Gmail.",
    status: "Imported"
  }
];

export async function triggerN8nWorkflow(customerId: string, workflow = "voice-calling") {
  const customer = await getCustomer(customerId);
  if (!customer) throw new Error("Customer not found");

  const webhookUrl =
    workflow === "voice-calling"
      ? process.env.N8N_LEAD_CALLING_WEBHOOK_URL
      : process.env.N8N_WORKFLOW_WEBHOOK_URL;

  const payload = {
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    company: customer.company,
    workflow
  };

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }
  }

  await createCall({
    customer_id: customer.id,
    call_status: webhookUrl ? "calling" : "pending",
    ai_summary: webhookUrl ? "n8n workflow triggered." : "Demo mode: add N8N_LEAD_CALLING_WEBHOOK_URL to trigger calls.",
    next_action: "Wait for call result webhook."
  });

  await updateCustomer(customer.id, { status: "contacted" });
  await createActivity(customer.id, "workflow_triggered", `${workflow} workflow started for ${customer.name}.`);

  return { ok: true, demoMode: !webhookUrl, payload };
}
