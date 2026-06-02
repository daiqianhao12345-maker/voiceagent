"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Headphones,
  LayoutDashboard,
  Settings,
  Users,
  Workflow
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/calls", label: "Calls", icon: Headphones },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-white/88 backdrop-blur lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 px-5 lg:h-20">
          <div className="grid size-10 place-items-center rounded-lg bg-brand text-white">
            <Workflow size={21} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Voice CRM</p>
            <h1 className="text-lg font-bold text-ink">Agent Pipeline</h1>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex min-w-fit items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-field hover:text-ink",
                  active && "bg-brand text-white hover:bg-brand hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden px-5 py-6 lg:block">
          <div className="rounded-md border border-line bg-field p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <BarChart3 size={16} />
              MVP Stack
            </div>
            <p className="text-sm leading-6 text-ink/65">
              Next.js API routes, Neon PostgreSQL, n8n webhooks, Vapi-ready calls, and OpenAI-ready analysis.
            </p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
