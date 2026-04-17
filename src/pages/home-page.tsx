import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("ux-english2.home-tab") || "terms";
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("ux-english2.home-tab", value);
  };

  const { records, resetProgress } = useLearningRecords();
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
  const termPhraseHasProgress =
    termPhraseStats.statuses.in_progress > 0 ||
    termPhraseStats.statuses.mastered > 0;
  const patternHasProgress =
    patternStats.statuses.in_progress > 0 ||
    patternStats.statuses.mastered > 0;

  const termPhraseStarredCount = useMemo(
    () => termPhraseItems.filter((item) => records[item.id]?.starred).length,
    [termPhraseItems, records],
  );
  const patternStarredCount = useMemo(
    () => patternItems.filter((item) => records[item.id]?.starred).length,
    [patternItems, records],
  );

  return (
    <AppShell
      title="Practice Hub"
      description="Build vocabulary, phrases, and patterns for interviews and work."
    >
      <section className="space-y-5">
        <Tabs
          className="space-y-4"
          value={activeTab}
          onValueChange={handleTabChange}
        >
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
                  {termPhraseStarredCount > 0 ? (
                    <Button
                      asChild
                      className="h-auto w-full rounded-xl border-0 bg-emerald-600 px-4 py-4 text-white hover:bg-emerald-500"
                    >
                      <Link to="/study/term-phrase/starred">
                        <Star className="size-3.5 fill-current" />
                        Study Starred
                      </Link>
                    </Button>
                  ) : null}
                </>
              }
              footer={
                termPhraseHasProgress ? (
                  <ClearProgressDialog
                    onClear={() => resetProgress("term_phrase")}
                    preservedScopeLabel="Patterns"
                    scopeLabel="Terms & Phrases"
                  />
                ) : null
              }
              stats={termPhraseStats}
            />
          </TabsContent>

          <TabsContent value="patterns">
            <OverviewPanel
              actions={
                <>
                  <Button asChild className="h-auto w-full rounded-xl px-4 py-4">
                    <Link to="/study/pattern/reinforcement">
                      Reinforcement Study
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-auto w-full rounded-xl border-0 bg-emerald-600 px-4 py-4 text-white hover:bg-emerald-500"
                  >
                    <Link to="/study/pattern/random">Random Study</Link>
                  </Button>
                  {patternStarredCount > 0 ? (
                    <Button
                      asChild
                      className="h-auto w-full rounded-xl border-0 bg-emerald-600 px-4 py-4 text-white hover:bg-emerald-500"
                    >
                      <Link to="/study/pattern/starred">
                        <Star className="size-3.5 fill-current" />
                        Study Starred
                      </Link>
                    </Button>
                  ) : null}
                </>
              }
              footer={
                patternHasProgress ? (
                  <ClearProgressDialog
                    onClear={() => resetProgress("pattern")}
                    preservedScopeLabel="Terms & Phrases"
                    scopeLabel="Patterns"
                  />
                ) : null
              }
              stats={patternStats}
            />
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}

function OverviewPanel({
  stats,
  actions,
  footer,
}: {
  stats: {
    total: number;
    statuses: ReturnType<typeof countStatuses>;
  };
  actions: React.ReactNode;
  footer?: React.ReactNode;
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
      {footer ? <div className="flex justify-center">{footer}</div> : null}
    </div>
  );
}

function ClearProgressDialog({
  onClear,
  scopeLabel,
  preservedScopeLabel,
}: {
  onClear: () => void;
  scopeLabel: string;
  preservedScopeLabel: string;
}) {
  return (
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
          <AlertDialogTitle>Clear {scopeLabel} progress?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove your local {scopeLabel} study progress
            for this browser. {preservedScopeLabel} progress and content data
            will stay unchanged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClear} variant="destructive">
            Clear Progress
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
