import { NextResponse } from "next/server";
import { deleteScrapedData, getScrapedData, updateScrapedData } from "@/lib/repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scrapedData = await getScrapedData(id);
  if (!scrapedData) return NextResponse.json({ error: "Scraped data not found" }, { status: 404 });
  return NextResponse.json({ scrapedData });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const scrapedData = await updateScrapedData(id, {
    customer_id: body.customer_id || body.customerId,
    call_id: body.call_id || body.callId,
    business_name: body.business_name || body.businessName,
    contact_name: body.contact_name || body.contactName,
    title: body.title || body.role || body.job_title || body.jobTitle,
    phone: body.phone,
    email: body.email,
    website: body.website || body.website_url || body.websiteUrl,
    source_url: body.source_url || body.sourceUrl,
    summary: body.summary || body.description,
    role_summary: body.role_summary || body.roleSummary,
    source_notes: body.source_notes || body.sourceNotes,
    status: body.status
  });
  if (!scrapedData) return NextResponse.json({ error: "Scraped data not found" }, { status: 404 });
  return NextResponse.json({ scrapedData });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteScrapedData(id);
  return NextResponse.json({ ok: true });
}
