"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import type { Customer } from "@/types/crm";

export function MeetingForm({ customers }: { customers: Customer[] }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      setMessage("Add a customer before booking a meeting.");
      return;
    }
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        meeting_time: meetingTime ? new Date(meetingTime).toISOString() : null,
        meeting_status: "booked",
        meeting_notes: meetingNotes
      })
    });

    if (response.ok) {
      setMessage("Meeting booked. Refresh to see it in the schedule.");
      setMeetingNotes("");
      setMeetingTime("");
    }
  }

  return (
    <form className="panel min-w-0 rounded-lg p-4" onSubmit={submit}>
      <div className="mb-4 flex items-center gap-2">
        <CalendarPlus size={18} />
        <h3 className="font-bold">Book Meeting</h3>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Customer</span>
          <select className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {customers.length === 0 ? <option value="">No customers available</option> : null}
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Time</span>
          <input className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-field px-3 text-sm" type="datetime-local" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/55">Notes</span>
          <textarea className="focus-ring mt-1 min-h-24 w-full rounded-md border border-line bg-field px-3 py-2 text-sm" value={meetingNotes} onChange={(event) => setMeetingNotes(event.target.value)} />
        </label>
      </div>
      <button className="focus-ring mt-4 h-11 w-full rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-ink/25" disabled={customers.length === 0}>Book Meeting</button>
      {message ? <p className="mt-3 text-sm font-medium text-brand">{message}</p> : null}
    </form>
  );
}
