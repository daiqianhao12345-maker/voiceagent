import { CheckCircle2, Database, Globe, KeyRound, ServerCog, Workflow } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WebhookDirectory } from "@/components/webhook-directory";
import { hasDatabase } from "@/lib/db";

const settings = [
  { key: "NEXT_PUBLIC_APP_URL", label: "Production App URL", icon: Globe },
  { key: "DATABASE_URL", label: "Neon PostgreSQL", icon: Database },
  { key: "N8N_LEAD_CALLING_WEBHOOK_URL", label: "n8n Lead Calling Webhook", icon: Workflow },
  { key: "N8N_WORKFLOW_WEBHOOK_URL", label: "n8n General Workflow Webhook", icon: Workflow },
  { key: "VAPI_API_KEY", label: "Vapi API Key", icon: KeyRound },
  { key: "OPENAI_API_KEY", label: "OpenAI API Key", icon: ServerCog }
];

export default function SettingsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://voiceagent-gamma-lovat.vercel.app");

  const webhookGroups = [
    {
      title: "n8n should call CRM",
      description: "Use these as n8n HTTP Request or webhook callback destinations.",
      items: [
        {
          label: "Call Result Callback",
          method: "POST" as const,
          url: `${baseUrl}/api/calls/webhook-result`,
          description: "Send voice-agent transcript, sentiment, summary, status, duration, and recording URL back to the CRM.",
          payload: `{
  "customerId": "customer uuid",
  "status": "interested",
  "transcript": "Full call transcript",
  "summary": "Customer wants a meeting.",
  "sentiment": "positive",
  "next_action": "Book meeting",
  "duration": 420,
  "recording_url": "https://..."
}`
        },
        {
          label: "Create Customer",
          method: "POST" as const,
          url: `${baseUrl}/api/customers`,
          description: "Create CRM leads from n8n lead scraping, Google Sheets, website forms, or enrichment workflows.",
          payload: `{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+14161234567",
  "company": "Example Inc",
  "source": "n8n",
  "status": "new",
  "notes": "Imported from workflow"
}`
        },
        {
          label: "Create Meeting",
          method: "POST" as const,
          url: `${baseUrl}/api/meetings`,
          description: "Create a CRM meeting after n8n confirms calendar availability or detects an interested lead.",
          payload: `{
  "customer_id": "customer uuid",
  "meeting_time": "2026-06-05T15:00:00.000Z",
  "meeting_status": "booked",
  "meeting_notes": "Booked by n8n"
}`
        },
        {
          label: "Store Scraped Lead",
          method: "POST" as const,
          url: `${baseUrl}/api/scraped-data`,
          description: "Store scraped company data in the CRM instead of appending rows to Google Sheets.",
          payload: `{
  "business_name": "Example Clinic",
  "phone": "+14161234567",
  "email": "info@example.com",
  "website": "https://example.com",
  "source_url": "https://search-result-or-directory-url",
  "summary": "Short company summary",
  "status": "new"
}`
        }
      ]
    },
    {
      title: "CRM triggers n8n",
      description: "Add these n8n webhook URLs to Vercel environment variables. The CRM will call them when users start workflows.",
      items: [
        {
          label: "Lead Calling Workflow",
          url: "N8N_LEAD_CALLING_WEBHOOK_URL",
          description: "Set this env var to your n8n production webhook for voice calling. Used by Start Call buttons.",
          payload: `{
  "customerId": "customer uuid",
  "name": "John Doe",
  "phone": "+14161234567",
  "email": "john@example.com",
  "company": "Example Inc",
  "workflow": "voice-calling"
}`
        },
        {
          label: "General Workflow",
          url: "N8N_WORKFLOW_WEBHOOK_URL",
          description: "Set this env var to a generic n8n production webhook for non-calling workflow triggers."
        }
      ]
    },
    {
      title: "CRM API references",
      description: "Useful endpoints for testing, dashboards, and HTTP Request nodes.",
      items: [
        {
          label: "List Customers",
          method: "GET" as const,
          url: `${baseUrl}/api/customers`,
          description: "Fetch all CRM customers. Supports status, source, q, and limit query params.",
          payload: `${baseUrl}/api/customers?status=new&limit=10`
        },
        {
          label: "Get Customer Detail",
          method: "GET" as const,
          url: `${baseUrl}/api/customers/{customerId}`,
          description: "Fetch one customer record by CRM UUID."
        },
        {
          label: "List Calls",
          method: "GET" as const,
          url: `${baseUrl}/api/calls`,
          description: "Fetch all stored call records."
        },
        {
          label: "List Meetings",
          method: "GET" as const,
          url: `${baseUrl}/api/meetings`,
          description: "Fetch all stored meetings."
        },
        {
          label: "List Scraped Leads",
          method: "GET" as const,
          url: `${baseUrl}/api/scraped-data`,
          description: "Fetch scraped lead records stored in CRM. Supports status, q, and limit query params.",
          payload: `${baseUrl}/api/scraped-data?status=new&limit=25`
        },
        {
          label: "Trigger Workflow",
          method: "POST" as const,
          url: `${baseUrl}/api/workflows/start`,
          description: "Programmatically trigger a CRM workflow for a customer.",
          payload: `{
  "customerId": "customer uuid",
  "workflow": "voice-calling"
}`
        }
      ]
    },
    {
      title: "Replace Google Sheets nodes",
      description: "Use these swaps in the n8n canvas shown in your screenshot.",
      items: [
        {
          label: "Google Sheets Trigger: Customer Rows",
          method: "GET" as const,
          url: `${baseUrl}/api/customers?status=new&limit=1`,
          description: "Replace sheet polling with CRM customer fetching. For event-based calling, use the CRM Start Call button instead."
        },
        {
          label: "Google Sheets Append/Update: Customers",
          method: "POST" as const,
          url: `${baseUrl}/api/customers`,
          description: "Replace customer row append/update with CRM customer creation. Use PUT /api/customers/{customerId} for updates."
        },
        {
          label: "Google Sheets Update: Sentiment/Call Result",
          method: "POST" as const,
          url: `${baseUrl}/api/calls/webhook-result`,
          description: "Replace sentiment sheet updates with call-result storage in CRM."
        },
        {
          label: "Google Sheets Append: Scraped Companies",
          method: "POST" as const,
          url: `${baseUrl}/api/scraped-data`,
          description: "Replace scraped company row append with CRM scraped-data storage."
        },
        {
          label: "Google Sheets Update: Meeting Rows",
          method: "POST" as const,
          url: `${baseUrl}/api/meetings`,
          description: "Replace meeting row append/update with CRM meeting records."
        }
      ]
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Integrations"
        description="Add these values in Vercel or .env.local. The CRM runs in demo mode until Neon and webhook credentials are present."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => {
          const Icon = item.icon;
          const present = Boolean(process.env[item.key]);
          return (
            <div key={item.key} className="panel rounded-lg p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-md bg-field text-brand"><Icon size={19} /></div>
                  <div>
                    <h3 className="font-bold">{item.label}</h3>
                    <p className="text-sm text-ink/55">{item.key}</p>
                  </div>
                </div>
                <span className={present ? "text-brand" : "text-ink/35"}><CheckCircle2 size={20} /></span>
              </div>
              <p className="text-sm leading-6 text-ink/65">
                {present ? "Configured for this runtime." : "Not configured yet. Add it to .env.local locally and to Vercel environment variables for deployment."}
              </p>
            </div>
          );
        })}
      </section>

      <section className="panel mt-5 rounded-lg p-4">
        <h3 className="mb-3 text-lg font-bold">Neon Setup</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm leading-6 text-ink/70">
          <li>Create a Neon project and copy the pooled PostgreSQL connection string.</li>
          <li>Add it as <code className="rounded bg-field px-1.5 py-0.5">DATABASE_URL</code>.</li>
          <li>Run <code className="rounded bg-field px-1.5 py-0.5">database/schema.sql</code> in the Neon SQL editor.</li>
          <li>Deploy to Vercel with the same environment variables.</li>
        </ol>
        <p className="mt-4 text-sm font-semibold text-brand">{hasDatabase ? "Database mode is active." : "Demo mode is active."}</p>
      </section>

      <WebhookDirectory groups={webhookGroups} />
    </>
  );
}
