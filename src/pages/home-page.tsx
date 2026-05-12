import { useMemo, useState } from "react";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { items } from "@/lib/content";
import { countStatuses, getStatusLabel } from "@/lib/learning";
import { getLearningRecord } from "@/lib/storage";
import { useLearningRecords } from "@/hooks/use-learning-records";
import type {
  LanguageItem,
  LearningRecordMap,
  StudyMode,
  StudyPool,
  StudyScope,
} from "@/types";

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
    () => buildOverviewStats(termPhraseItems, records),
    [records, termPhraseItems],
  );
  const patternStats = useMemo(
    () => buildOverviewStats(patternItems, records),
    [patternItems, records],
  );
  const termPhraseHasProgress =
    termPhraseStats.total.statuses.in_progress > 0 ||
    termPhraseStats.total.statuses.mastered > 0;
  const patternHasProgress =
    patternStats.total.statuses.in_progress > 0 ||
    patternStats.total.statuses.mastered > 0;

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
              footer={
                termPhraseHasProgress ? (
                  <ClearProgressDialog
                    onClear={() => resetProgress("term_phrase")}
                    preservedScopeLabel="Patterns"
                    scopeLabel="Terms & Phrases"
                  />
                ) : null
              }
              scope="term_phrase"
              stats={termPhraseStats}
            />
          </TabsContent>

          <TabsContent value="patterns">
            <OverviewPanel
              footer={
                patternHasProgress ? (
                  <ClearProgressDialog
                    onClear={() => resetProgress("pattern")}
                    preservedScopeLabel="Terms & Phrases"
                    scopeLabel="Patterns"
                  />
                ) : null
              }
              scope="pattern"
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
  scope,
  footer,
}: {
  stats: OverviewStats;
  scope: StudyScope;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <StudyPoolCard
        pool="total"
        scope={scope}
        stats={stats.total}
        title="Total"
      />
      {stats.starred.total > 0 ? (
        <StudyPoolCard
          pool="starred"
          scope={scope}
          stats={stats.starred}
          title="Starred"
        />
      ) : null}
      {footer ? <div className="flex justify-center">{footer}</div> : null}
    </div>
  );
}

type PoolStats = {
  total: number;
  statuses: ReturnType<typeof countStatuses>;
};

type OverviewStats = {
  total: PoolStats;
  starred: PoolStats;
};

function buildOverviewStats(
  scopeItems: LanguageItem[],
  records: LearningRecordMap,
): OverviewStats {
  const starredItems = scopeItems.filter(
    (item) => getLearningRecord(records, item.id).starred,
  );

  return {
    total: buildPoolStats(scopeItems, records),
    starred: buildPoolStats(starredItems, records),
  };
}

function buildPoolStats(
  poolItems: LanguageItem[],
  records: LearningRecordMap,
): PoolStats {
  return {
    total: poolItems.length,
    statuses: countStatuses(poolItems, records),
  };
}

function StudyPoolCard({
  title,
  stats,
  scope,
  pool,
}: {
  title: "Total" | "Starred";
  stats: PoolStats;
  scope: StudyScope;
  pool: StudyPool;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <StatMetric label={title} count={stats.total} />
          <StatMetric
            label={getStatusLabel("in_progress")}
            count={stats.statuses.in_progress}
          />
          <StatMetric
            label={getStatusLabel("mastered")}
            count={stats.statuses.mastered}
          />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-3">
        <Button asChild className="h-auto rounded-xl px-3 py-3">
          <Link to={buildStudyPath(scope, pool, "reinforcement")}>
            Study Unmastered
          </Link>
        </Button>
        <Button
          asChild
          className="h-auto rounded-xl px-3 py-3"
          variant="secondary"
        >
          <Link to={buildStudyPath(scope, pool, "random")}>Study Random</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function buildStudyPath(scope: StudyScope, pool: StudyPool, mode: StudyMode) {
  const routeScope = scope === "pattern" ? "pattern" : "term-phrase";
  return `/study/${routeScope}/${pool}/${mode}`;
}

function StatMetric({ label, count }: { label: string; count: number }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-xs text-muted-foreground sm:text-sm">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        {count}
      </div>
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
