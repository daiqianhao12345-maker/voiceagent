import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, PhoneCall } from "lucide-react";
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
              <div><dt className="font-semibold text-ink/55">Source</dt><dd>{customer.source || "Manual"}</dd></div>
              <div><dt className="font-semibold text-ink/55">Created</dt><dd>{shortDate(customer.created_at)}</dd></div>
            </dl>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/customers" className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-line text-sm font-semibold">Back</Link>
              <Link href="/calls" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand text-sm font-bold text-white"><PhoneCall size={16} />Call</Link>
            </div>
          </section>

          <section className="panel rounded-lg p-4">
            <h3 className="mb-3 text-lg font-bold">AI Summary</h3>
            <p className="text-sm leading-6 text-ink/70">{calls[0]?.ai_summary || customer.notes || "No AI summary yet. Start a call to generate transcript analysis and next actions."}</p>
          </section>
        </aside>

        <section className="panel rounded-lg">
          <div className="grid grid-cols-4 border-b border-line text-center text-sm font-bold">
            {["Overview", "Calls", "Meetings", "Notes"].map((tab) => (
              <div key={tab} className="border-r border-line px-3 py-3 last:border-r-0">{tab}</div>
            ))}
          </div>
          <div className="grid gap-5 p-4 xl:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-bold">Call History</h3>
              <div className="space-y-3">
                {calls.length ? calls.map((call) => (
                  <div key={call.id} className="rounded-md border border-line p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StatusBadge value={call.call_status} />
                      <span className="text-xs text-ink/50">{shortDate(call.created_at)}</span>
                    </div>
                    <p className="text-sm font-semibold">{call.ai_summary || "No summary yet"}</p>
                    <p className="mt-2 text-sm text-ink/65">{call.next_action || call.transcript || "Waiting for callback result."}</p>
                  </div>
                )) : <p className="rounded-md bg-field p-3 text-sm text-ink/65">No calls yet.</p>}
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><CalendarPlus size={18} />Meeting History</h3>
              <div className="space-y-3">
                {meetings.length ? meetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-md border border-line p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StatusBadge value={meeting.meeting_status} />
                      <span className="text-xs text-ink/50">{dateTime(meeting.meeting_time)}</span>
                    </div>
                    <p className="text-sm text-ink/65">{meeting.meeting_notes || "No notes added."}</p>
                  </div>
                )) : <p className="rounded-md bg-field p-3 text-sm text-ink/65">No meetings yet.</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
