import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink/60">{label}</p>
          <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-md bg-field text-brand">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-ink/55">{detail}</p>
    </div>
  );
}
