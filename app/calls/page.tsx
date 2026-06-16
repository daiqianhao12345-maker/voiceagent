import { Headphones, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listCalls } from "@/lib/repository";
import { workflowTemplates } from "@/lib/workflows";
import { shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const calls = await listCalls();

  return (
    <>
      <PageHeader
        eyebrow="Call Management"
        title="Voice-agent results"
        description="Monitor pending calls, completed transcripts, sentiment, summaries, recordings, and next actions from Vapi or n8n callbacks."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="panel min-w-0 overflow-hidden rounded-lg">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <Headphones size={18} />
            <h3 className="font-bold">Call History</h3>
          </div>
          <div className="divide-y divide-line">
            {calls.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-14 text-center">
                <div className="grid size-12 place-items-center rounded-lg bg-field text-brand">
                  <Headphones size={22} />
                </div>
                <p className="mt-4 font-bold">No calls yet</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
                  Start a call from the customer table. Completed transcripts, sentiment, and next actions will appear here.
                </p>
              </div>
            ) : calls.map((call) => (
              <article key={call.id} className="grid gap-4 p-4 md:grid-cols-[180px_1fr_180px]">
                <div>
                  <p className="font-semibold">{call.customer_name || "Customer"}</p>
                  <p className="mt-1 text-xs text-ink/50">{shortDate(call.created_at)}</p>
                  {call.vapi_call_id ? <p className="mt-2 break-all text-xs text-ink/45">Vapi: {call.vapi_call_id}</p> : null}
                </div>
                <div>
                  <p className="text-sm font-semibold">{call.ai_summary || "Waiting for AI summary"}</p>
                  <p className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap rounded-md bg-field p-3 text-sm leading-6 text-ink/65">
                    {call.transcript || call.next_action || "Transcript will appear after W1 posts back to /api/calls/webhook-result."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-field px-3 py-1">Interest: {call.interest_level || "unknown"}</span>
                    <span className="rounded-full bg-field px-3 py-1">Meeting: {call.meeting_recommended ? "yes" : "no"}</span>
                    <span className="rounded-full bg-field px-3 py-1">Lead score: {call.lead_score ?? "n/a"}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2 md:block md:text-right">
                  <StatusBadge value={call.call_status} />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">{call.sentiment || "No sentiment"}</p>
                  <p className="mt-2 text-sm text-ink/60">{call.duration ? `${Math.round(call.duration / 60)} min` : "No duration"}</p>
                  {call.recording_url ? <a className="mt-2 inline-block text-sm font-semibold text-brand" href={call.recording_url}>Recording</a> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="min-w-0 space-y-5">
          <section className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold"><PlayCircle size={18} />n8n Workflows</h3>
            <div className="space-y-3">
              {workflowTemplates.map((workflow) => (
                <div key={workflow.name} className="rounded-md border border-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{workflow.name}</p>
                    <span className="rounded-full bg-field px-2 py-1 text-[11px] font-bold text-ink/55">{workflow.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{workflow.description}</p>
                  <p className="mt-2 text-xs font-semibold text-brand">{workflow.source}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
