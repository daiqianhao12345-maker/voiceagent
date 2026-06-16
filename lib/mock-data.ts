import type { ActivityLog, Call, Customer, Meeting, ScrapedData } from "@/types/crm";

const now = new Date();
const day = 24 * 60 * 60 * 1000;

export const demoCustomers: Customer[] = [
  {
    id: "4f1f4c78-6112-4c93-9e8f-9309969a1111",
    name: "Maya Chen",
    email: "maya@northstarclinic.com",
    phone: "+14165550182",
    company: "Northstar Clinic",
    title: "Operations Manager",
    source: "Google Sheet",
    status: "interested",
    notes: "Asked for implementation timeline and pricing.",
    background_summary: "Clinic operations lead evaluating AI reception coverage for missed calls and lead qualification.",
    company_summary: "Northstar Clinic is a local healthcare provider focused on patient intake and appointment workflows.",
    role_summary: "Owns operational process improvements and vendor evaluation.",
    pain_points: "Missed calls, delayed follow-up, and manual appointment coordination.",
    needs: "AI receptionist, call routing, and calendar booking.",
    budget: "Pilot budget available after technical review.",
    decision_authority: "Influencer with access to practice owner.",
    intelligence_status: "completed",
    lead_score: 88,
    revenue: 12400,
    created_at: new Date(now.getTime() - day * 8).toISOString()
  },
  {
    id: "9a0af26a-2ea2-4d22-ae28-9309969a2222",
    name: "Daniel Brooks",
    email: "daniel@brightspark.io",
    phone: "+16475550129",
    company: "BrightSpark",
    title: "Founder",
    source: "Website",
    status: "meeting_booked",
    notes: "Wants AI receptionist and lead qualification.",
    background_summary: "Founder interested in automating inbound lead capture and qualification.",
    company_summary: "BrightSpark is a small services business exploring AI-assisted intake.",
    role_summary: "Primary decision maker for sales operations tools.",
    pain_points: "Slow lead response and inconsistent qualification.",
    needs: "Voice agent, CRM sync, meeting booking, and call summaries.",
    budget: "Open for professional plan if pilot works.",
    decision_authority: "Decision maker.",
    intelligence_status: "completed",
    lead_score: 76,
    revenue: 8200,
    created_at: new Date(now.getTime() - day * 5).toISOString()
  },
  {
    id: "b73d295c-12b4-4e88-a33c-9309969a3333",
    name: "Priya Shah",
    email: "priya@urbanroof.ca",
    phone: "+14165550103",
    company: "Urban Roof",
    title: "Office Coordinator",
    source: "Lead Scraper",
    status: "contacted",
    notes: "No decision maker on first call.",
    background_summary: "Coordinator answered initial outreach and requested follow-up with owner.",
    company_summary: "Urban Roof handles roofing inquiries and service scheduling.",
    role_summary: "Coordinates office calls and routes customer requests.",
    pain_points: "High call volume during peak season.",
    needs: "After-hours call capture and booking support.",
    budget: "Unknown.",
    decision_authority: "Not decision maker.",
    intelligence_status: "partial",
    lead_score: 52,
    revenue: 0,
    created_at: new Date(now.getTime() - day * 3).toISOString()
  },
  {
    id: "d2e46a40-1a27-4c70-b68e-9309969a4444",
    name: "Owen Miller",
    email: "owen@meritcollege.ca",
    phone: "+19055550199",
    company: "Merit College",
    title: "Admissions Director",
    source: "Referral",
    status: "closed",
    notes: "Closed pilot for student consultation workflow.",
    background_summary: "Admissions leader using AI voice workflows for student consultation intake.",
    company_summary: "Merit College supports international high school students with OSSD and university preparation.",
    role_summary: "Leads admissions and student consultation workflows.",
    pain_points: "Manual follow-up and meeting scheduling across prospective students.",
    needs: "Email outreach, AI call qualification, meeting booking, and CRM tracking.",
    budget: "Pilot closed.",
    decision_authority: "Decision maker.",
    intelligence_status: "completed",
    lead_score: 93,
    revenue: 18500,
    created_at: new Date(now.getTime() - day * 14).toISOString()
  }
];

export const demoCalls: Call[] = [
  {
    id: "call-1",
    customer_id: demoCustomers[0].id,
    customer_name: demoCustomers[0].name,
    vapi_call_id: "demo-vapi-call-1",
    call_status: "completed",
    transcript: "Customer asked how the AI voice agent handles missed calls and calendar booking.",
    ai_summary: "Strong fit. Wants pricing and an implementation plan.",
    sentiment: "positive",
    interest_level: "high",
    meeting_recommended: true,
    next_action: "Send proposal and book technical walkthrough.",
    lead_score: 88,
    duration: 418,
    recording_url: null,
    call_started_at: new Date(now.getTime() - day * 1 - 1000 * 60 * 8).toISOString(),
    call_ended_at: new Date(now.getTime() - day * 1).toISOString(),
    created_at: new Date(now.getTime() - day * 1).toISOString()
  },
  {
    id: "call-2",
    customer_id: demoCustomers[2].id,
    customer_name: demoCustomers[2].name,
    vapi_call_id: "demo-vapi-call-2",
    call_status: "no_answer",
    transcript: null,
    ai_summary: "No answer on first attempt.",
    sentiment: "neutral",
    interest_level: "unknown",
    meeting_recommended: false,
    next_action: "Retry tomorrow morning.",
    lead_score: 52,
    duration: 0,
    recording_url: null,
    call_started_at: new Date(now.getTime() - day * 2 - 1000 * 60 * 2).toISOString(),
    call_ended_at: new Date(now.getTime() - day * 2).toISOString(),
    created_at: new Date(now.getTime() - day * 2).toISOString()
  }
];

export const demoMeetings: Meeting[] = [
  {
    id: "meeting-1",
    customer_id: demoCustomers[1].id,
    customer_name: demoCustomers[1].name,
    source_call_id: null,
    meeting_title: "BrightSpark AI Intake Pilot",
    meeting_time: new Date(now.getTime() + day * 2).toISOString(),
    meeting_status: "confirmed",
    meeting_notes: "Review voice agent setup and n8n workflow mapping.",
    meeting_reason: "Customer asked for a technical walkthrough after qualification.",
    customer_intent: "Evaluate AI receptionist pilot.",
    confirmation_status: "sent",
    calendar_event_url: null,
    follow_up_action: "Prepare pilot scope and onboarding checklist.",
    created_at: new Date(now.getTime() - day).toISOString()
  }
];

export const demoActivity: ActivityLog[] = [
  {
    id: "activity-1",
    customer_id: demoCustomers[0].id,
    activity_type: "call_completed",
    description: "Vapi call completed and AI summary stored.",
    created_at: new Date(now.getTime() - 1000 * 60 * 24).toISOString()
  },
  {
    id: "activity-2",
    customer_id: demoCustomers[1].id,
    activity_type: "meeting_booked",
    description: "Meeting booked from positive call outcome.",
    created_at: new Date(now.getTime() - 1000 * 60 * 80).toISOString()
  },
  {
    id: "activity-3",
    customer_id: null,
    activity_type: "workflow_triggered",
    description: "Lead scraping workflow imported 12 businesses.",
    created_at: new Date(now.getTime() - 1000 * 60 * 180).toISOString()
  }
];

export const demoScrapedData: ScrapedData[] = [];
