import { useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { items } from "@/lib/content";
import { countStatuses, getStatusLabel } from "@/lib/learning";
import { useLearningRecords } from "@/hooks/use-learning-records";

export function HomePage() {
  const { records, resetProgress } = useLearningRecords();
  const hasProgress = Object.keys(records).length > 0;
  const termPhraseItems = useMemo(
    () => items.filter((item) => item.kind !== "pattern"),
    [],
  );
  const patternItems = useMemo(
    () => items.filter((item) => item.kind === "pattern"),
    [],
  );
  const termPhraseStats = useMemo(
    () => ({
      total: termPhraseItems.length,
      statuses: countStatuses(termPhraseItems, records),
    }),
    [records, termPhraseItems],
  );
  const patternStats = useMemo(
    () => ({
      total: patternItems.length,
      statuses: countStatuses(patternItems, records),
    }),
    [patternItems, records],
  );

  return (
    <AppShell
      title="Daily learning, without extra friction"
      description="Review your current learning state and jump directly into a focused round."
    >
      <section className="space-y-5">
        <Tabs className="space-y-4" defaultValue="terms">
          <TabsList className="h-11 w-full rounded-full bg-slate-200 p-1">
            <TabsTrigger className="h-full rounded-full px-4" value="terms">
              Terms &amp; Phrases
            </TabsTrigger>
            <TabsTrigger className="h-full rounded-full px-4" value="patterns">
              Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms">
            <OverviewPanel
              actions={
                <>
                  <Button asChild className="h-auto w-full rounded-xl px-4 py-4">
                    <Link to="/study/term-phrase/reinforcement">
                      Reinforcement Study
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-auto w-full rounded-xl border-0 bg-emerald-600 px-4 py-4 text-white hover:bg-emerald-500"
                  >
                    <Link to="/study/term-phrase/random">Random Study</Link>
                  </Button>
                </>
              }
              stats={termPhraseStats}
            />
          </TabsContent>

          <TabsContent value="patterns">
            <OverviewPanel
              actions={
                <Button asChild className="h-auto w-full rounded-xl px-4 py-4">
                  <Link to="/study/pattern">Pattern Practice</Link>
                </Button>
              }
              stats={patternStats}
            />
          </TabsContent>
        </Tabs>

        <Button asChild className="h-auto w-full rounded-xl px-4 py-4" variant="outline">
          <Link to="/library">Open Library</Link>
        </Button>

        {hasProgress ? (
          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="link"
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
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function OverviewPanel({
  stats,
  actions,
}: {
  stats: {
    total: number;
    statuses: ReturnType<typeof countStatuses>;
  };
  actions: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="total" count={stats.total} />
        <StatCard label="not_started" count={stats.statuses.not_started} />
        <StatCard label="in_progress" count={stats.statuses.in_progress} />
        <StatCard label="mastered" count={stats.statuses.mastered} />
      </div>
      <div className="space-y-3">{actions}</div>
    </div>
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
