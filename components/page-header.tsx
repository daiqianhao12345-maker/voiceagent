export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h2 className="text-3xl font-bold tracking-normal text-ink md:text-4xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{description}</p>
      </div>
      {action}
    </div>
  );
}
