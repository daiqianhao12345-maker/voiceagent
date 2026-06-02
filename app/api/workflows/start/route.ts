import { NextResponse } from "next/server";
import { triggerN8nWorkflow } from "@/lib/workflows";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await triggerN8nWorkflow(body.customerId, body.workflow || "voice-calling");
  return NextResponse.json(result);
}
