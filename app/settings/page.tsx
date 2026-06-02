import { CheckCircle2, Database, KeyRound, ServerCog, Workflow } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { hasDatabase } from "@/lib/db";

const settings = [
  { key: "DATABASE_URL", label: "Neon PostgreSQL", icon: Database },
  { key: "N8N_LEAD_CALLING_WEBHOOK_URL", label: "n8n Lead Calling Webhook", icon: Workflow },
  { key: "VAPI_API_KEY", label: "Vapi API Key", icon: KeyRound },
  { key: "OPENAI_API_KEY", label: "OpenAI API Key", icon: ServerCog }
];

export default function SettingsPage() {
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
    </>
  );
}
