import { Activity, CalendarCheck, CheckCircle2, Headphones, Inbox, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { dashboardStats, listActivity, listCustomers, listCalls } from "@/lib/repository";
import { money, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, activity, customers, calls] = await Promise.all([
    dashboardStats(),
    listActivity(6),
    listCustomers(),
    listCalls()
  ]);

  const statusCounts = customers.reduce<Record<string, number>>((acc, customer) => {
    acc[customer.status] = (acc[customer.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="CRM Command Center"
        title="AI calling pipeline"
        description="Track customers, launch voice-agent calls, capture outcomes, and move qualified leads into meetings from one focused workspace."
        action={
          <Link href="/customers" className="focus-ring inline-flex h-11 items-center rounded-md bg-brand px-4 text-sm font-bold text-white hover:bg-brand/90">
            Manage Customers
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Customers" value={stats.totalCustomers} detail="Stored in Neon when DATABASE_URL is set" icon={Users} />
        <MetricCard label="Calls" value={stats.totalCalls} detail="Vapi or n8n-triggered attempts" icon={Headphones} />
        <MetricCard label="Meetings" value={stats.totalMeetings} detail="Booked, confirmed, and completed" icon={CalendarCheck} />
        <MetricCard label="Interested Leads" value={stats.interestedLeads} detail="Qualified by call sentiment" icon={TrendingUp} />
        <MetricCard label="Closed Deals" value={stats.closedDeals} detail={`${stats.conversionRate}% conversion rate`} icon={CheckCircle2} />
        <MetricCard label="Revenue" value={money(stats.revenue)} detail="Expected and closed pipeline value" icon={Activity} />
      </section>

      <section className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel rounded-lg p-4">
          <h3 className="mb-4 text-lg font-bold">Recent Activity</h3>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <div className="flex flex-col items-center rounded-md bg-field px-4 py-10 text-center">
                <Inbox className="text-brand" size={24} />
                <p className="mt-3 font-bold">No activity yet</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-ink/60">
                  Add a customer or trigger a call to start building your timeline.
                </p>
              </div>
            ) : activity.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-md bg-field p-3">
                <div>
                  <p className="text-sm font-semibold capitalize">{item.activity_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-ink/65">{item.description}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink/50">{shortDate(item.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel rounded-lg p-4">
            <h3 className="mb-4 text-lg font-bold">Lead Status Overview</h3>
            <div className="space-y-3">
              {customers.length === 0 ? (
                <p className="rounded-md bg-field p-4 text-sm leading-6 text-ink/60">
                  Status counts will appear after customers are added.
                </p>
              ) : Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-3">
                  <StatusBadge value={status} />
                  <div className="h-2 flex-1 rounded-full bg-field">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(12, (count / customers.length) * 100)}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-lg p-4">
            <h3 className="mb-4 text-lg font-bold">Latest Calls</h3>
            <div className="space-y-3">
              {calls.length === 0 ? (
                <p className="rounded-md bg-field p-4 text-sm leading-6 text-ink/60">
                  Voice-agent results will appear here after the first call.
                </p>
              ) : calls.slice(0, 4).map((call) => (
                <div key={call.id} className="rounded-md border border-line p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{call.customer_name || "Customer"}</p>
                    <StatusBadge value={call.call_status} />
                  </div>
                  <p className="text-sm text-ink/65">{call.ai_summary || "Waiting for transcript."}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
