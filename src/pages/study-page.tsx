import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getTaxonomyLabel, items } from "@/lib/content";
import { EmptyState } from "@/components/empty-state";
import { getStatusLabel } from "@/lib/learning";
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
  }, [mode, navigate, records]);

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
              <Button asChild variant="link" className="h-auto w-fit px-0">
                <Link to="/">Back Home</Link>
              </Button>
              <Button
                asChild
                className="h-12 w-full rounded-xl border border-border bg-white text-foreground hover:border-foreground/20 hover:bg-slate-50 hover:shadow-sm"
              >
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
        <section className="space-y-5 rounded-3xl border bg-white px-6 py-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              You completed {feedbackHistory.length} item
              {feedbackHistory.length === 1 ? "" : "s"} in this round.
            </p>
          </div>
          <div className="divide-y">
            <SummaryRow label="Hard" value={summary.hard} />
            <SummaryRow label="Uncertain" value={summary.uncertain} />
            <SummaryRow label="Easy" value={summary.easy} />
            <SummaryRow label="Newly Mastered" value={newlyMasteredCount} />
          </div>
          <Button className="w-full rounded-xl" onClick={() => navigate("/")}>
            Finish
          </Button>
        </section>
      </StudyShell>
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <StudyShell title={title} subtitle="One item at a time">
      <div className="space-y-6">
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Progress {progressText}</div>
            <div className="text-sm text-muted-foreground">
              Current status {getStatusLabel(getRecord(currentItem.id).status)}
            </div>
            <div className="text-sm text-muted-foreground">
              Current progress {getRecord(currentItem.id).progress}/100
            </div>
          </div>
          <button
            className="min-h-[24rem] w-full rounded-3xl border bg-white px-6 py-8 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm sm:min-h-[28rem]"
            onClick={() => setRevealed(true)}
            type="button"
          >
            <div className="space-y-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Chinese prompt
              </div>
              <div className="text-2xl font-semibold leading-10">
                {currentItem.chinese}
              </div>
              {revealed ? (
                <div className="space-y-3 border-t pt-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    English answer
                  </div>
                  <div className="text-xl font-medium leading-9">
                    {currentItem.english}
                  </div>
                </div>
              ) : (
                <div className="pt-2 text-sm text-muted-foreground">
                  Tap the card to reveal the English expression.
                </div>
              )}
            </div>
          </button>
        </section>
        <div className="grid grid-cols-3 gap-3">
          <Button
            className="h-12 w-full rounded-xl border border-border bg-white text-foreground hover:border-foreground/20 hover:bg-slate-50 hover:shadow-sm"
            onClick={() => handleFeedback("hard")}
          >
            Hard
          </Button>
          <Button
            className="h-12 w-full rounded-xl border border-border bg-white text-foreground hover:border-foreground/20 hover:bg-slate-50 hover:shadow-sm"
            onClick={() => handleFeedback("uncertain")}
          >
            Uncertain
          </Button>
          <Button
            className="h-12 w-full rounded-xl border-0 bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={() => handleFeedback("easy")}
          >
            Easy
          </Button>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Scene: {getTaxonomyLabel("scene", currentItem.scene)}</div>
          <div>Module: {getTaxonomyLabel("module", currentItem.module)}</div>
          <div>Intent: {getTaxonomyLabel("intent", currentItem.intent)}</div>
        </div>
      </div>
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
    <AppShell
      title={title}
      description={subtitle}
      actions={
        <Button asChild className="h-auto w-fit px-0" variant="link">
          <Link to="/">Back Home</Link>
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
