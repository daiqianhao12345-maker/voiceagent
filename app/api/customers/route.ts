import { NextResponse } from "next/server";
import { createCustomer, listCustomers } from "@/lib/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const q = searchParams.get("q")?.toLowerCase();
  const limit = Number(searchParams.get("limit") || 0);

  let customers = await listCustomers();
  if (status) customers = customers.filter((customer) => customer.status === status);
  if (source) customers = customers.filter((customer) => customer.source === source);
  if (q) {
    customers = customers.filter((customer) =>
      [customer.name, customer.email, customer.phone, customer.company, customer.source, customer.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }
  if (limit > 0) customers = customers.slice(0, limit);

  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const body = await request.json();
  const customer = await createCustomer(body);
  return NextResponse.json({ customer }, { status: 201 });
}
