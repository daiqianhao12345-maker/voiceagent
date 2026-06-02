import { NextResponse } from "next/server";
import { createScrapedData, listScrapedData } from "@/lib/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();
  const limit = Number(searchParams.get("limit") || 0);

  let scrapedData = await listScrapedData();
  if (status) scrapedData = scrapedData.filter((item) => item.status === status);
  if (q) {
    scrapedData = scrapedData.filter((item) =>
      [item.business_name, item.phone, item.email, item.website, item.source_url, item.summary, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }
  if (limit > 0) scrapedData = scrapedData.slice(0, limit);

  return NextResponse.json({ scrapedData });
}

export async function POST(request: Request) {
  const body = await request.json();
  const scrapedData = await createScrapedData({
    business_name: body.business_name || body.businessName || body.company || body.name || null,
    phone: body.phone || null,
    email: body.email || null,
    website: body.website || body.website_url || body.websiteUrl || null,
    source_url: body.source_url || body.sourceUrl || null,
    summary: body.summary || body.description || null,
    status: body.status || "new"
  });

  return NextResponse.json({ scrapedData }, { status: 201 });
}
