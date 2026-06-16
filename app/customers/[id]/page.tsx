import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, CalendarPlus, FileText, PhoneCall, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getCustomer, listCalls, listMeetings } from "@/lib/repository";
import { dateTime, money, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, calls, meetings] = await Promise.all([getCustomer(id), listCalls(id), listMeetings(id)]);
  if (!customer) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Customer Detail"
        title={customer.name}
        description={`${customer.company || "Independent lead"} has a lead score of ${customer.lead_score} and ${money(Number(customer.revenue || 0))} in potential revenue.`}
        action={<StatusBadge value={customer.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-5">
          <section className="panel rounded-lg p-4">
            <h3 className="mb-4 text-lg font-bold">Profile Information</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="font-semibold text-ink/55">Email</dt><dd>{customer.email || "Not provided"}</dd></div>
              <div><dt className="font-semibold text-ink/55">Phone</dt><dd>{customer.phone || "Not provided"}</dd></div>
              <div><dt className="font-semibold text-ink/55">Title / Role</dt><dd>{customer.title || "Unknown"}</dd></div>
              <div><dt className="font-semibold text-ink/55">Company</dt><dd>{customer.company || "Independent"}</dd></div>
              <div><dt className="font-semibold text-ink/55">Source</dt><dd>{customer.source || "Manual"}</dd></div>
              <div><dt className="font-semibold text-ink/55">Created</dt><dd>{shortDate(customer.created_at)}</dd></div>
            </dl>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/customers" className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-line text-sm font-semibold">Back</Link>
              <Link href="/calls" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand text-sm font-bold text-white"><PhoneCall size={16} />Call</Link>
            </div>
          </section>

          <section className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><Sparkles size={18} />AI Summary</h3>
            <p className="text-sm leading-6 text-ink/70">
              {calls[0]?.ai_summary || customer.background_summary || customer.notes || "No AI summary yet. Start a call to generate transcript analysis and next actions."}
            </p>
          </section>

          <section className="panel rounded-lg p-4">
            <h3 className="mb-3 text-lg font-bold">Workflow Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md bg-field px-3 py-2"><span>W2 call</span><StatusBadge value={calls[0]?.call_status || customer.status} /></div>
              <div className="flex items-center justify-between rounded-md bg-field px-3 py-2"><span>W1 conversation log</span><StatusBadge value={calls.length ? "completed" : "pending"} /></div>
              <div className="flex items-center justify-between rounded-md bg-field px-3 py-2"><span>W3 meeting extraction</span><StatusBadge value={meetings.length ? "booked" : "pending"} /></div>
              <div className="flex items-center justify-between rounded-md bg-field px-3 py-2"><span>W4 intelligence</span><StatusBadge value={customer.intelligence_status || "pending"} /></div>
            </div>
          </section>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><BriefcaseBusiness size={18} />Background Intelligence</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Company Summary", customer.company_summary],
                ["Role Summary", customer.role_summary],
                ["Pain Points", customer.pain_points],
                ["Needs", customer.needs],
                ["Budget", customer.budget],
                ["Decision Authority", customer.decision_authority]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{value || "Waiting for W4 intelligence."}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><PhoneCall size={18} />Conversation Records</h3>
            <div>
              <div className="space-y-3">
                {calls.length ? calls.map((call) => (
                  <div key={call.id} className="rounded-md border border-line p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StatusBadge value={call.call_status} />
                      <span className="text-xs text-ink/50">{shortDate(call.created_at)}</span>
                    </div>
                    <div className="grid gap-3 xl:grid-cols-[1fr_220px]">
                      <div>
                        <p className="text-sm font-semibold">{call.ai_summary || "No summary yet"}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/65">{call.transcript || "Waiting for callback transcript."}</p>
                      </div>
                      <dl className="space-y-2 rounded-md bg-field p-3 text-xs">
                        <div><dt className="font-semibold text-ink/50">Interest</dt><dd>{call.interest_level || "Unknown"}</dd></div>
                        <div><dt className="font-semibold text-ink/50">Sentiment</dt><dd>{call.sentiment || "Unknown"}</dd></div>
                        <div><dt className="font-semibold text-ink/50">Meeting</dt><dd>{call.meeting_recommended ? "Recommended" : "Not recommended"}</dd></div>
                        <div><dt className="font-semibold text-ink/50">Next Action</dt><dd>{call.next_action || "None"}</dd></div>
                        {call.recording_url ? <a className="inline-block font-semibold text-brand" href={call.recording_url}>Recording</a> : null}
                      </dl>
                    </div>
                  </div>
                )) : <p className="rounded-md bg-field p-3 text-sm text-ink/65">No calls yet.</p>}
              </div>
            </div>
          </div>

          <div className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><CalendarPlus size={18} />Meeting History</h3>
            <div>
              <div className="space-y-3">
                {meetings.length ? meetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-md border border-line p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StatusBadge value={meeting.meeting_status} />
                      <span className="text-xs text-ink/50">{dateTime(meeting.meeting_time)}</span>
                    </div>
                    <p className="font-semibold">{meeting.meeting_title || "Meeting"}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{meeting.meeting_notes || meeting.meeting_reason || "No notes added."}</p>
                    <p className="mt-2 text-xs text-ink/55">{meeting.customer_intent || meeting.follow_up_action || "No extracted intent yet."}</p>
                  </div>
                )) : <p className="rounded-md bg-field p-3 text-sm text-ink/65">No meetings yet.</p>}
              </div>
            </div>
          </div>

          <div className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><FileText size={18} />Notes</h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink/70">{customer.notes || "No manual notes yet."}</p>
          </div>
        </section>
      </div>
    </>
  );
}
