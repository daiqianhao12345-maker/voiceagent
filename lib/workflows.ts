import { createActivity, getCustomer, updateCustomer } from "@/lib/repository";

const DEFAULT_LEAD_CALLING_WEBHOOK_URL = "https://daiqianhao30.app.n8n.cloud/webhook/crm-start-interest-call";

function resolveWebhookUrl(workflow: string) {
  const configuredUrl =
    workflow === "voice-calling"
      ? process.env.N8N_LEAD_CALLING_WEBHOOK_URL
      : process.env.N8N_WORKFLOW_WEBHOOK_URL;

  const fallbackUrl = workflow === "voice-calling" ? DEFAULT_LEAD_CALLING_WEBHOOK_URL : "";
  const rawUrl = (configuredUrl || fallbackUrl).trim();
  if (!rawUrl) return "";

  return rawUrl
    .replace("https://daidarren12345.app.n8n.cloud", "https://daiqianhao30.app.n8n.cloud")
    .replace("/webhook-test/", "/webhook/");
}

export const workflowTemplates = [
  {
    name: "W1 Conversation Recorder",
    source: "My workflow 4.json",
    description: "Receives completed call payloads and records transcript, summary, sentiment, recording, score, and next action in CRM.",
    status: "CRM webhook"
  },
  {
    name: "W2 Interest Calling",
    source: "My workflow 3.json",
    description: "Triggered from CRM customer records, sends the lead into Vapi, and asks whether the customer is interested.",
    status: "Vapi configured"
  },
  {
    name: "W3 Meeting Extractor",
    source: "My workflow 2.json",
    description: "Reads call transcript and creates structured CRM meetings when the customer asks to book or follow up.",
    status: "CRM meeting API"
  },
  {
    name: "W4 Customer Intelligence",
    source: "My workflow (2).json",
    description: "Uses call context plus company/contact research to enrich the customer profile with background, role, needs, and pain points.",
    status: "Research API"
  }
];

export async function triggerN8nWorkflow(customerId: string, workflow = "voice-calling") {
  const customer = await getCustomer(customerId);
  if (!customer) throw new Error("Customer not found");

  const webhookUrl = resolveWebhookUrl(workflow);

  const payload = {
    customerId: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    company: customer.company,
    title: customer.title,
    workflow
  };

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const shortDetail = detail ? `: ${detail.slice(0, 240)}` : "";
      throw new Error(`n8n returned ${response.status}${shortDetail}`);
    }
  }

  if (webhookUrl) {
    await updateCustomer(customer.id, { status: "calling" });
    await createActivity(customer.id, "workflow_triggered", `${workflow} workflow started for ${customer.name}.`);
  } else {
    await createActivity(customer.id, "workflow_missing", `${workflow} webhook is not configured for ${customer.name}.`);
  }

  return {
    ok: true,
    demoMode: !webhookUrl,
    payload,
    webhook: webhookUrl
      ? {
          host: new URL(webhookUrl).host,
          path: new URL(webhookUrl).pathname
        }
      : null
  };
}
