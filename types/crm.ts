export type CustomerStatus =
  | "new"
  | "contacted"
  | "calling"
  | "interested"
  | "not_interested"
  | "no_answer"
  | "meeting_booked"
  | "closed"
  | "lost";

export type CallStatus =
  | "pending"
  | "calling"
  | "completed"
  | "no_answer"
  | "voicemail"
  | "failed";

export type MeetingStatus = "booked" | "confirmed" | "completed" | "cancelled";

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  source: string | null;
  status: CustomerStatus;
  notes: string | null;
  background_summary: string | null;
  company_summary: string | null;
  role_summary: string | null;
  pain_points: string | null;
  needs: string | null;
  budget: string | null;
  decision_authority: string | null;
  intelligence_status: string | null;
  lead_score: number;
  revenue: number;
  created_at: string;
};

export type Call = {
  id: string;
  customer_id: string;
  customer_name?: string;
  vapi_call_id: string | null;
  call_status: CallStatus;
  transcript: string | null;
  ai_summary: string | null;
  sentiment: string | null;
  interest_level: string | null;
  meeting_recommended: boolean | null;
  next_action: string | null;
  lead_score: number | null;
  duration: number | null;
  recording_url: string | null;
  call_started_at: string | null;
  call_ended_at: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  customer_id: string;
  customer_name?: string;
  source_call_id: string | null;
  meeting_title: string | null;
  meeting_time: string | null;
  meeting_status: MeetingStatus;
  meeting_notes: string | null;
  meeting_reason: string | null;
  customer_intent: string | null;
  confirmation_status: string | null;
  calendar_event_url: string | null;
  follow_up_action: string | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  customer_id: string | null;
  activity_type: string;
  description: string;
  created_at: string;
};

export type ScrapedData = {
  id: string;
  customer_id: string | null;
  call_id: string | null;
  business_name: string | null;
  contact_name: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source_url: string | null;
  summary: string | null;
  role_summary: string | null;
  source_notes: string | null;
  status: string | null;
  created_at: string;
};

export type DashboardStats = {
  totalCustomers: number;
  totalCalls: number;
  totalMeetings: number;
  interestedLeads: number;
  closedDeals: number;
  revenue: number;
  conversionRate: number;
};
