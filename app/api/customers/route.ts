import { NextResponse } from "next/server";
import { createCustomer, listCustomers } from "@/lib/repository";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const body = await request.json();
  const customer = await createCustomer(body);
  return NextResponse.json({ customer }, { status: 201 });
}
