import { NextResponse } from "next/server";
import { createCall, listCalls } from "@/lib/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calls = await listCalls(searchParams.get("customerId") || undefined);
  return NextResponse.json({ calls });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customer_id && !body.customerId) {
    return NextResponse.json({ error: "customer_id is required" }, { status: 400 });
  }

  const call = await createCall({
    ...body,
    customer_id: body.customer_id || body.customerId,
    vapi_call_id: body.vapi_call_id || body.vapiCallId || body.callId || null,
    call_status: body.call_status || body.status || "pending",
    ai_summary: body.ai_summary || body.summary || null,
    interest_level: body.interest_level || body.interestLevel || body.interest || null,
    meeting_recommended: body.meeting_recommended ?? body.meetingRecommended ?? null,
    next_action: body.next_action || body.nextAction || null,
    lead_score: body.lead_score || body.leadScore || null,
    recording_url: body.recording_url || body.recordingUrl || null
  });

  return NextResponse.json({ call }, { status: 201 });
}
