import { NextResponse } from "next/server";
import { createMeeting, listMeetings } from "@/lib/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetings = await listMeetings(searchParams.get("customerId") || undefined);
  return NextResponse.json({ meetings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const meeting = await createMeeting(body);
  return NextResponse.json({ meeting }, { status: 201 });
}
