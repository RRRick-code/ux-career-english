import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { items } from "@/lib/content";
import { countStatuses, getStatusLabel } from "@/lib/learning";
import { useLearningRecords } from "@/hooks/use-learning-records";

export function HomePage() {
  const { records } = useLearningRecords();
  const statusCounts = countStatuses(items, records);

  return (
    <AppShell
      title="Daily learning, without extra friction"
      description="Review your current learning state and jump directly into a focused round."
    >
      <section className="space-y-5 rounded-3xl border bg-white px-6 py-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Learning overview</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Your progress is derived from local study activity and updates after each card.
          </p>
        </div>
        <div className="divide-y">
          <StatRow label="not_started" count={statusCounts.not_started} />
          <StatRow label="in_progress" count={statusCounts.in_progress} />
          <StatRow label="mastered" count={statusCounts.mastered} />
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Start a round</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Choose the mode that best matches what you want to review next.
          </p>
        </div>
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

function StatRow({
  label,
  count,
}: {
  label: "not_started" | "in_progress" | "mastered";
  count: number;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="text-sm text-muted-foreground">{getStatusLabel(label)}</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{count}</div>
    </div>
  );
}
