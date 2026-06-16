import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  calling: "bg-amber-100 text-amber-800",
  interested: "bg-emerald-100 text-emerald-700",
  not_interested: "bg-stone-100 text-stone-700",
  meeting_booked: "bg-amber-100 text-amber-800",
  closed: "bg-brand/10 text-brand",
  lost: "bg-rose-100 text-rose-700",
  pending: "bg-slate-100 text-slate-700",
  completed: "bg-emerald-100 text-emerald-700",
  no_answer: "bg-orange-100 text-orange-700",
  voicemail: "bg-purple-100 text-purple-700",
  failed: "bg-rose-100 text-rose-700",
  booked: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
};

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const label = String(value || "unknown");
  return (
    <span
      className={cn(
        "inline-flex min-w-20 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        styles[label] || "bg-field text-ink/70"
      )}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
