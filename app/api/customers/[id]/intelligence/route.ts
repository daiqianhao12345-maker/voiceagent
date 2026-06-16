import { NextResponse } from "next/server";
import { createActivity, createScrapedData, updateCustomer } from "@/lib/repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const customer = await updateCustomer(id, {
    title: body.title || body.role || body.job_title || body.jobTitle || undefined,
    background_summary: body.background_summary || body.backgroundSummary || body.profile_summary || body.profileSummary || undefined,
    company_summary: body.company_summary || body.companySummary || body.company_description || body.companyDescription || undefined,
    role_summary: body.role_summary || body.roleSummary || body.role_description || body.roleDescription || undefined,
    pain_points: body.pain_points || body.painPoints || undefined,
    needs: body.needs || body.customer_needs || body.customerNeeds || undefined,
    budget: body.budget || undefined,
    decision_authority: body.decision_authority || body.decisionAuthority || undefined,
    intelligence_status: body.intelligence_status || body.intelligenceStatus || "completed",
    notes: body.notes || undefined
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  if (body.create_research_record || body.createResearchRecord) {
    await createScrapedData({
      customer_id: id,
      call_id: body.call_id || body.callId || null,
      business_name: body.business_name || body.businessName || customer.company || null,
      contact_name: customer.name,
      title: body.title || body.role || customer.title || null,
      phone: customer.phone,
      email: customer.email,
      website: body.website || body.website_url || body.websiteUrl || null,
      source_url: body.source_url || body.sourceUrl || null,
      summary: body.company_summary || body.companySummary || body.summary || null,
      role_summary: body.role_summary || body.roleSummary || null,
      source_notes: body.source_notes || body.sourceNotes || null,
      status: body.research_status || body.researchStatus || "completed"
    });
  }

  await createActivity(id, "customer_intelligence_updated", "Customer intelligence profile was updated.");
  return NextResponse.json({ customer });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  return POST(request, context);
}
