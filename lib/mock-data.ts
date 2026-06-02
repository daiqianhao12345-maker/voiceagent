import type { ActivityLog, Call, Customer, Meeting } from "@/types/crm";

const now = new Date();
const day = 24 * 60 * 60 * 1000;

export const demoCustomers: Customer[] = [
  {
    id: "4f1f4c78-6112-4c93-9e8f-9309969a1111",
    name: "Maya Chen",
    email: "maya@northstarclinic.com",
    phone: "+14165550182",
    company: "Northstar Clinic",
    source: "Google Sheet",
    status: "interested",
    notes: "Asked for implementation timeline and pricing.",
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
    source: "Website",
    status: "meeting_booked",
    notes: "Wants AI receptionist and lead qualification.",
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
    source: "Lead Scraper",
    status: "contacted",
    notes: "No decision maker on first call.",
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
    source: "Referral",
    status: "closed",
    notes: "Closed pilot for student consultation workflow.",
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
    call_status: "completed",
    transcript: "Customer asked how the AI voice agent handles missed calls and calendar booking.",
    ai_summary: "Strong fit. Wants pricing and an implementation plan.",
    sentiment: "positive",
    next_action: "Send proposal and book technical walkthrough.",
    duration: 418,
    recording_url: null,
    created_at: new Date(now.getTime() - day * 1).toISOString()
  },
  {
    id: "call-2",
    customer_id: demoCustomers[2].id,
    customer_name: demoCustomers[2].name,
    call_status: "no_answer",
    transcript: null,
    ai_summary: "No answer on first attempt.",
    sentiment: "neutral",
    next_action: "Retry tomorrow morning.",
    duration: 0,
    recording_url: null,
    created_at: new Date(now.getTime() - day * 2).toISOString()
  }
];

export const demoMeetings: Meeting[] = [
  {
    id: "meeting-1",
    customer_id: demoCustomers[1].id,
    customer_name: demoCustomers[1].name,
    meeting_time: new Date(now.getTime() + day * 2).toISOString(),
    meeting_status: "confirmed",
    meeting_notes: "Review voice agent setup and n8n workflow mapping.",
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
