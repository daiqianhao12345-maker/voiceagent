import { NextResponse } from "next/server";
import { listCalls } from "@/lib/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calls = await listCalls(searchParams.get("customerId") || undefined);
  return NextResponse.json({ calls });
}
