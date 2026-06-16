import { NextResponse } from "next/server";
import { createMeeting, listMeetings } from "@/lib/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetings = await listMeetings(searchParams.get("customerId") || undefined);
  return NextResponse.json({ meetings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const meeting = await createMeeting({
    ...body,
    customer_id: body.customer_id || body.customerId,
    source_call_id: body.source_call_id || body.sourceCallId || body.callId || null,
    meeting_title: body.meeting_title || body.meetingTitle || body.title || null,
    meeting_status: body.meeting_status || body.meetingStatus || body.status || "booked",
    meeting_notes: body.meeting_notes || body.meetingNotes || body.notes || null,
    meeting_reason: body.meeting_reason || body.meetingReason || body.reason || null,
    customer_intent: body.customer_intent || body.customerIntent || body.intent || null,
    confirmation_status: body.confirmation_status || body.confirmationStatus || null,
    calendar_event_url: body.calendar_event_url || body.calendarEventUrl || null,
    follow_up_action: body.follow_up_action || body.followUpAction || null
  });
  return NextResponse.json({ meeting }, { status: 201 });
}
