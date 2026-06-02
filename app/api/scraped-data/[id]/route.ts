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
    business_name: body.business_name || body.businessName,
    phone: body.phone,
    email: body.email,
    website: body.website || body.website_url || body.websiteUrl,
    source_url: body.source_url || body.sourceUrl,
    summary: body.summary || body.description,
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
