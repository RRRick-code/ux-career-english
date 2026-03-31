import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTaxonomyLabel, items } from "@/lib/content";
import { EmptyState } from "@/components/empty-state";
import { getStatusLabel } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { summarizeFeedback, buildStudyRound } from "@/lib/study";
import { useLearningRecords } from "@/hooks/use-learning-records";
import type { FeedbackRating, LanguageItem, StudyMode } from "@/types";

gsap.registerPlugin(useGSAP);

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
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const chineseTextRef = useRef<HTMLDivElement | null>(null);
  const englishTextRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== "random" && mode !== "reinforcement") {
      navigate("/", { replace: true });
      return;
    }

    // Current round is fixed for the session; record updates must not rebuild it.
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

  useGSAP(
    () => {
      if (!revealed || !chineseTextRef.current || !englishTextRef.current) {
        return;
      }

      const timeline = gsap.timeline({
        defaults: { duration: 0.42, ease: "power2.out" },
      });

      timeline
        .to(
          chineseTextRef.current,
          {
            y: -18,
            fontSize: "1rem",
            lineHeight: "1.75rem",
            fontWeight: 400,
            color: "var(--muted-foreground)",
          },
          0,
        )
        .fromTo(
          englishTextRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4 },
          0.08,
        );
    },
    {
      scope: cardRef,
      dependencies: [revealed, currentItem?.id],
      revertOnUpdate: true,
    },
  );

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
      <StudyShell title={title}>
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
      <StudyShell title={`${title} complete`}>
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
        </section>
        <Button className="h-12 w-full rounded-xl" onClick={() => navigate("/")}>
          Finish
        </Button>
      </StudyShell>
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <StudyShell title={title}>
      <div className="-mt-2 space-y-6">
        <section className="space-y-3">
          <div className="space-y-8">
            <div className="space-y-2">
              <Progress
                className="h-2 bg-slate-200"
                value={total > 0 ? ((currentIndex + 1) / total) * 100 : 0}
              />
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <div>{currentItem.id}</div>
              <div>
                {getTaxonomyLabel("scene", currentItem.scene)} /{" "}
                {getTaxonomyLabel("intent", currentItem.intent)}
              </div>
            </div>
          </div>
          <button
            ref={cardRef}
            className="relative min-h-[24rem] w-full rounded-3xl border bg-white px-6 py-8 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm sm:min-h-[28rem]"
            onClick={() => setRevealed(true)}
            type="button"
          >
            <div
              className={cn(
                "absolute top-6 right-6 text-xs",
                getStatusTone(getRecord(currentItem.id).status),
              )}
            >
              {getStatusLabel(getRecord(currentItem.id).status)}
            </div>
            <div
              className="flex min-h-full flex-col items-center justify-center space-y-6 text-center -translate-y-5"
            >
              <div
                ref={chineseTextRef}
                className="text-2xl font-semibold leading-10 text-foreground"
              >
                {currentItem.chinese}
              </div>
              {revealed ? (
                <div className="w-full space-y-3 pt-6">
                  <div
                    ref={englishTextRef}
                    className="text-2xl font-medium leading-10"
                  >
                    {currentItem.english}
                  </div>
                </div>
              ) : null}
            </div>
            {!revealed ? (
              <div className="absolute right-0 bottom-8 left-0 text-center text-base text-muted-foreground">
                Tap to reveal
              </div>
            ) : null}
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
            className="h-12 w-full rounded-xl"
            onClick={() => handleFeedback("easy")}
          >
            Easy
          </Button>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Module: {getTaxonomyLabel("module", currentItem.module)}</div>
        </div>
      </div>
    </StudyShell>
  );
}

function StudyShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell
      title={title}
      actionsPlacement="top-right"
      showHeaderDivider={false}
      actions={
        <Button
          asChild
          size="icon"
          className="border border-border bg-white text-foreground hover:border-foreground/20 hover:bg-slate-50 hover:shadow-sm"
        >
          <Link aria-label="Close study page" to="/">
            <X className="h-4 w-4" />
          </Link>
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

function getStatusTone(status: "not_started" | "in_progress" | "mastered") {
  switch (status) {
    case "in_progress":
      return "text-emerald-400";
    case "not_started":
      return "text-orange-300";
    case "mastered":
      return "text-emerald-600";
  }
}
