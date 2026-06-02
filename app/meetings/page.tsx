import { CalendarDays } from "lucide-react";
import { MeetingForm } from "@/components/meeting-form";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listCustomers, listMeetings } from "@/lib/repository";
import { dateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const [meetings, customers] = await Promise.all([listMeetings(), listCustomers()]);

  return (
    <>
      <PageHeader
        eyebrow="Meeting Management"
        title="Bookings and follow-ups"
        description="Book, track, and review meetings created by your team or downstream n8n automations."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="panel min-w-0 overflow-hidden rounded-lg">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <CalendarDays size={18} />
            <h3 className="font-bold">Meeting Schedule</h3>
          </div>
          <div className="divide-y divide-line">
            {meetings.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-14 text-center">
                <div className="grid size-12 place-items-center rounded-lg bg-field text-brand">
                  <CalendarDays size={22} />
                </div>
                <p className="mt-4 font-bold">No meetings booked</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
                  Book a meeting manually after adding a customer, or let n8n create meetings from interested leads.
                </p>
              </div>
            ) : meetings.map((meeting) => (
              <article key={meeting.id} className="grid gap-3 p-4 md:grid-cols-[200px_1fr_130px]">
                <div>
                  <p className="font-semibold">{meeting.customer_name || "Customer"}</p>
                  <p className="mt-1 text-sm text-ink/60">{dateTime(meeting.meeting_time)}</p>
                </div>
                <p className="text-sm leading-6 text-ink/65">{meeting.meeting_notes || "No meeting notes yet."}</p>
                <div className="md:text-right"><StatusBadge value={meeting.meeting_status} /></div>
              </article>
            ))}
          </div>
        </section>
        <MeetingForm customers={customers} />
      </div>
    </>
  );
}
