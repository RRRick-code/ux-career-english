import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { items } from "@/lib/content";
import { EmptyState } from "@/components/empty-state";
import { summarizeFeedback, buildStudyRound } from "@/lib/study";
import { useLearningRecords } from "@/hooks/use-learning-records";
import type { FeedbackRating, LanguageItem, StudyMode } from "@/types";

export function StudyPage() {
  const { mode } = useParams<{ mode: StudyMode }>();
  const navigate = useNavigate();
  const { records, getRecord, updateWithFeedback } = useLearningRecords();
  const [roundItems, setRoundItems] = useState<LanguageItem[]>([]);
  const [roundReady, setRoundReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRating[]>([]);
  const [newlyMasteredCount, setNewlyMasteredCount] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);

  useEffect(() => {
    if (mode !== "random" && mode !== "reinforcement") {
      navigate("/", { replace: true });
      return;
    }

    const round = buildStudyRound(items, records, mode);
    setRoundItems(round.selected);
    setCurrentIndex(0);
    setRevealed(false);
    setFeedbackHistory([]);
    setNewlyMasteredCount(0);
    setRoundComplete(false);
    setRoundReady(true);
  }, [mode, navigate]);

  const currentItem = roundItems[currentIndex] ?? null;
  const isEmpty = roundReady && roundItems.length === 0;
  const total = roundItems.length;
  const summary = useMemo(
    () => summarizeFeedback(feedbackHistory),
    [feedbackHistory],
  );
  const title = mode === "reinforcement" ? "Reinforcement Study" : "Random Study";

  const progressText = useMemo(() => {
    if (!currentItem) {
      return "";
    }

    return `${currentIndex + 1} / ${total}`;
  }, [currentIndex, currentItem, total]);

  function handleFeedback(rating: FeedbackRating) {
    if (!currentItem) {
      return;
    }

    const { previous, next } = updateWithFeedback(currentItem.id, rating);
    setFeedbackHistory((current) => [...current, rating]);
    if (previous.status !== "mastered" && next.status === "mastered") {
      setNewlyMasteredCount((count) => count + 1);
    }

    if (currentIndex + 1 >= roundItems.length) {
      setRoundComplete(true);
      setRevealed(false);
      return;
    }

    setCurrentIndex((value) => value + 1);
    setRevealed(false);
  }

  if (mode !== "random" && mode !== "reinforcement") {
    return null;
  }

  if (isEmpty) {
    return (
      <StudyShell
        title={title}
        subtitle="There are no eligible items available for this round."
      >
        <EmptyState
          title="No items available"
          description={
            mode === "reinforcement"
              ? "All items are currently mastered. Return home or review the library."
              : "There are no language items in the content set yet."
          }
          actions={
            <>
              <Button asChild variant="outline">
                <Link to="/">Back Home</Link>
              </Button>
              <Button asChild>
                <Link to="/library">Open Library</Link>
              </Button>
            </>
          }
        />
      </StudyShell>
    );
  }

  if (roundComplete) {
    return (
      <StudyShell title={`${title} complete`} subtitle="Round summary">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              You completed {feedbackHistory.length} item
              {feedbackHistory.length === 1 ? "" : "s"} in this round.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <SummaryStat label="Hard" value={summary.hard} />
              <SummaryStat label="Uncertain" value={summary.uncertain} />
              <SummaryStat label="Easy" value={summary.easy} />
              <SummaryStat label="Newly Mastered" value={newlyMasteredCount} />
            </div>
            <Button className="w-full" onClick={() => navigate("/")}>
              Finish
            </Button>
          </CardContent>
        </Card>
      </StudyShell>
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <StudyShell title={title} subtitle="One item at a time">
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{progressText}</CardDescription>
            </div>
            <Button onClick={() => navigate("/")} size="icon" variant="ghost">
              <X className="h-4 w-4" />
              <span className="sr-only">Exit round</span>
            </Button>
          </div>
          <Separator />
        </CardHeader>
        <CardContent className="space-y-6">
          <button
            className="flex min-h-[24rem] w-full flex-col rounded-2xl border bg-muted/30 p-8 text-left transition-colors hover:bg-muted/50 sm:min-h-[28rem]"
            onClick={() => setRevealed(true)}
            type="button"
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Chinese prompt
            </div>
            <div className="mt-4 text-2xl font-semibold leading-10">
              {currentItem.chinese}
            </div>
            <div className="mt-6 min-h-40 rounded-xl bg-background p-5">
              {revealed ? (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    English answer
                  </div>
                  <div className="mt-3 text-xl font-medium leading-9">
                    {currentItem.english}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[7.5rem] items-center text-sm text-muted-foreground">
                  Tap the card to reveal the English expression.
                </div>
              )}
            </div>
          </button>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button onClick={() => handleFeedback("hard")} variant="outline">
              Hard
            </Button>
            <Button onClick={() => handleFeedback("uncertain")} variant="secondary">
              Uncertain
            </Button>
            <Button onClick={() => handleFeedback("easy")}>
              Easy
            </Button>
          </div>
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            Current progress: {getRecord(currentItem.id).progress}/100
          </div>
        </CardContent>
      </Card>
    </StudyShell>
  );
}

function StudyShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,245,245,0.85),_transparent_40%)] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-4xl">
        <Link className="text-sm text-muted-foreground hover:text-foreground" to="/">
          ← Back Home
        </Link>
        <div className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
