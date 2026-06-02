export type CustomerStatus =
  | "new"
  | "contacted"
  | "interested"
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
  source: string | null;
  status: CustomerStatus;
  notes: string | null;
  lead_score: number;
  revenue: number;
  created_at: string;
};

export type Call = {
  id: string;
  customer_id: string;
  customer_name?: string;
  call_status: CallStatus;
  transcript: string | null;
  ai_summary: string | null;
  sentiment: string | null;
  next_action: string | null;
  duration: number | null;
  recording_url: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  customer_id: string;
  customer_name?: string;
  meeting_time: string | null;
  meeting_status: MeetingStatus;
  meeting_notes: string | null;
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
  business_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source_url: string | null;
  summary: string | null;
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
