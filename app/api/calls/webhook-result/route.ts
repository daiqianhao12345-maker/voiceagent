import { NextResponse } from "next/server";
import { createActivity, createCall, updateCustomer } from "@/lib/repository";

export async function POST(request: Request) {
  const body = await request.json();
  const customerId = body.customerId || body.customer_id;
  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const call = await createCall({
    customer_id: customerId,
    call_status: body.call_status || body.status || "completed",
    transcript: body.transcript || null,
    ai_summary: body.summary || body.ai_summary || null,
    sentiment: body.sentiment || null,
    next_action: body.next_action || body.nextAction || null,
    duration: body.duration || null,
    recording_url: body.recording_url || body.recordingUrl || null
  });

  if (body.status === "interested" || body.sentiment === "positive") {
    await updateCustomer(customerId, { status: "interested", lead_score: body.lead_score || 80 });
  }

  await createActivity(customerId, "call_result_received", "Voice agent call result was received.");
  return NextResponse.json({ call });
}
