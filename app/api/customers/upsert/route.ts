import { NextResponse } from "next/server";
import { upsertCustomerByEmail } from "@/lib/repository";

export async function POST(request: Request) {
  const body = await request.json();
  const customer = await upsertCustomerByEmail(body);
  return NextResponse.json({ customer });
}
