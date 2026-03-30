import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { items } from "@/lib/content";
import { countStatuses, getStatusLabel } from "@/lib/learning";
import { useLearningRecords } from "@/hooks/use-learning-records";

export function HomePage() {
  const { records } = useLearningRecords();
  const statusCounts = countStatuses(items, records);
  const totalCount = items.length;

  return (
    <AppShell
      title="Daily learning, without extra friction"
      description="Review your current learning state and jump directly into a focused round."
    >
      <section className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">Learning overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="total" count={totalCount} />
          <StatCard label="not_started" count={statusCounts.not_started} />
          <StatCard label="in_progress" count={statusCounts.in_progress} />
          <StatCard label="mastered" count={statusCounts.mastered} />
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-3">
        <div className="space-y-3">
          <Button asChild className="h-auto w-full rounded-xl px-4 py-4">
            <Link to="/study/reinforcement">Reinforcement Study</Link>
          </Button>
          <Button
            asChild
            className="h-auto w-full rounded-xl border-0 bg-emerald-600 px-4 py-4 text-white hover:bg-emerald-500"
          >
            <Link to="/study/random">Random Study</Link>
          </Button>
          <Button
            asChild
            className="h-auto w-full rounded-xl border border-border bg-white px-4 py-4 text-foreground hover:border-foreground/20 hover:bg-slate-50 hover:shadow-sm"
          >
            <Link to="/library">Open Library</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  count,
}: {
  label: "total" | "not_started" | "in_progress" | "mastered";
  count: number;
}) {
  return (
    <div className="rounded-3xl border bg-white px-5 py-5">
      <div className="text-sm text-muted-foreground">
        {label === "total" ? "Total" : getStatusLabel(label)}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{count}</div>
    </div>
  );
}
