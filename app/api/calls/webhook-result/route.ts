import { NextResponse } from "next/server";
import { createActivity, createCall, updateCustomer } from "@/lib/repository";
import type { CustomerStatus } from "@/types/crm";

const customerStatuses = new Set([
  "new",
  "contacted",
  "calling",
  "interested",
  "not_interested",
  "no_answer",
  "meeting_booked",
  "closed",
  "lost"
]);

export async function POST(request: Request) {
  const body = await request.json();
  const customerId = body.customerId || body.customer_id;
  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const callStatus = body.call_status || body.callStatus || "completed";
  const customerStatus =
    body.customer_status ||
    body.customerStatus ||
    body.crmStatus ||
    (customerStatuses.has(body.status) ? body.status : null);
  const interestLevel = body.interest_level || body.interestLevel || body.interest || null;
  const sentiment = body.sentiment || null;
  const meetingRecommended =
    typeof body.meeting_recommended === "boolean"
      ? body.meeting_recommended
      : typeof body.meetingRecommended === "boolean"
        ? body.meetingRecommended
        : String(body.meeting_recommended || body.meetingRecommended || "").toLowerCase() === "yes";

  const call = await createCall({
    customer_id: customerId,
    vapi_call_id: body.vapi_call_id || body.vapiCallId || body.callId || null,
    call_status: callStatus,
    transcript: body.transcript || null,
    ai_summary: body.summary || body.ai_summary || null,
    sentiment,
    interest_level: interestLevel,
    meeting_recommended: meetingRecommended,
    next_action: body.next_action || body.nextAction || null,
    lead_score: body.lead_score || body.leadScore || null,
    duration: body.duration || null,
    recording_url: body.recording_url || body.recordingUrl || null,
    call_started_at: body.call_started_at || body.callStartedAt || null,
    call_ended_at: body.call_ended_at || body.callEndedAt || null
  });

  if (customerStatus) {
    await updateCustomer(customerId, {
      status: customerStatus as CustomerStatus,
      lead_score: body.lead_score || body.leadScore || undefined,
      notes: body.customer_notes || body.customerNotes || undefined
    });
  } else if (sentiment === "positive" || String(interestLevel).toLowerCase() === "high") {
    await updateCustomer(customerId, { status: "interested", lead_score: body.lead_score || body.leadScore || 80 });
  } else if (callStatus === "no_answer") {
    await updateCustomer(customerId, { status: "no_answer" });
  }

  await createActivity(customerId, "call_result_received", "Voice agent call result was received.");
  return NextResponse.json({ call });
}
