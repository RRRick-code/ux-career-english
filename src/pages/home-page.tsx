import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { items } from "@/lib/content";
import { countStatuses, getStatusLabel } from "@/lib/learning";
import { useLearningRecords } from "@/hooks/use-learning-records";

export function HomePage() {
  const { records, resetProgress } = useLearningRecords();
  const statusCounts = countStatuses(items, records);
  const totalCount = items.length;
  const hasProgress = Object.keys(records).length > 0;

  return (
    <AppShell
      title="Daily learning, without extra friction"
      description="Review your current learning state and jump directly into a focused round."
    >
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Learning overview</h2>
          {hasProgress ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-0 text-muted-foreground hover:text-foreground"
                >
                  Clear Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all learning progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your local study progress for this
                    browser. Content data will stay unchanged.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetProgress} variant="destructive">
                    Clear Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
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
