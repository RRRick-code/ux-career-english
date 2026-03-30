import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-dashed bg-white px-6 py-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      {actions ? <div className="space-y-3">{actions}</div> : null}
    </section>
  );
}
