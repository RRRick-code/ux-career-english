import { Link } from "react-router-dom";
import { ArrowRight, Brain, Shuffle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Learning overview</CardTitle>
            <CardDescription>
              Your progress is derived from local study activity and updates after each card.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <StatCard label="not_started" count={statusCounts.not_started} />
            <StatCard label="in_progress" count={statusCounts.in_progress} />
            <StatCard label="mastered" count={statusCounts.mastered} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Start a round</CardTitle>
            <CardDescription>
              Choose the mode that best matches what you want to review next.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link to="/study/reinforcement">
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Reinforcement Study
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="secondary">
              <Link to="/study/random">
                <span className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4" />
                  Random Study
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/library">Open Library</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ label, count }: { label: "not_started" | "in_progress" | "mastered"; count: number }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="text-sm text-muted-foreground">{getStatusLabel(label)}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{count}</div>
    </div>
  );
}
