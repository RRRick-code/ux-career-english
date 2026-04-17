import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Star, X } from "lucide-react";
import { HighlightedText } from "@/components/highlighted-text";
import { AppShell } from "@/components/app-shell";
import { ProgressDots } from "@/components/progress-dots";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getExamplePatternForItem,
  getTaxonomyLabel,
  items,
} from "@/lib/content";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { summarizeFeedback, buildStudyRound } from "@/lib/study";
import { useLearningRecords } from "@/hooks/use-learning-records";
import type {
  FeedbackRating,
  LanguageItem,
  StudyMode,
  StudyScope,
} from "@/types";

gsap.registerPlugin(useGSAP);

export function StudyPage() {
  const { scopeOrMode, mode: routeMode } = useParams<{
    scopeOrMode?: string;
    mode?: string;
  }>();
  const navigate = useNavigate();
  const { records, getRecord, updateWithFeedback, toggleStar } = useLearningRecords();
  const [roundItems, setRoundItems] = useState<LanguageItem[]>([]);
  const [roundReady, setRoundReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRating[]>([]);
  const [newlyMasteredCount, setNewlyMasteredCount] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const chineseTextWrapperRef = useRef<HTMLDivElement | null>(null);
  const chineseTextRef = useRef<HTMLDivElement | null>(null);
  const englishTextRef = useRef<HTMLDivElement | null>(null);
  const exampleTextRef = useRef<HTMLDivElement | null>(null);

  const routeState = useMemo(
    () => parseStudyRoute(scopeOrMode, routeMode),
    [scopeOrMode, routeMode],
  );

  useEffect(() => {
    if (!routeState) {
      navigate("/", { replace: true });
      return;
    }

    // Current round is fixed for the session; record updates must not rebuild it.
    const round = buildStudyRound(items, records, routeState.mode, routeState.scope);
    setRoundItems(round.selected);
    setCurrentIndex(0);
    setRevealed(false);
    setFeedbackHistory([]);
    setNewlyMasteredCount(0);
    setRoundComplete(false);
    setRoundReady(true);
  }, [navigate, routeState]);

  const currentItem = roundItems[currentIndex] ?? null;
  const currentRecord = currentItem ? getRecord(currentItem.id) : null;
  const isEmpty = roundReady && roundItems.length === 0;
  const total = roundItems.length;
  const summary = useMemo(
    () => summarizeFeedback(feedbackHistory),
    [feedbackHistory],
  );
  const title = routeState ? getStudyTitle(routeState) : "";
  const examplePattern = currentItem ? getExamplePatternForItem(currentItem) : null;

  useGSAP(
    () => {
      if (
        !revealed ||
        !chineseTextWrapperRef.current ||
        !chineseTextRef.current ||
        !englishTextRef.current
      ) {
        return;
      }

      const chineseWrapper = chineseTextWrapperRef.current;
      const chineseText = chineseTextRef.current;
      const englishText = englishTextRef.current;
      const exampleText = exampleTextRef.current;

      const timeline = gsap.timeline({
        defaults: { duration: 0.46, ease: "power2.out" },
      });

      gsap.set(chineseText, {
        transformOrigin: "center center",
      });
      gsap.set(englishText, {
        opacity: 0,
      });
      if (exampleText) {
        gsap.set(exampleText, {
          opacity: 0,
        });
      }

      timeline
        .to(
          chineseWrapper,
          {
            y: -42,
          },
          0,
        )
        .to(
          chineseText,
          {
            scale: 2 / 3,
            fontWeight: 400,
            color: "var(--muted-foreground)",
          },
          0,
        )
        .fromTo(
          englishText,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          0.08,
        );

      if (exampleText) {
        timeline.to(
          exampleText,
          {
            opacity: 1,
            duration: 0.38,
          },
          0.16,
        );
      }
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

  if (!routeState) {
    return null;
  }

  if (isEmpty) {
    return (
      <StudyShell title={title}>
        <EmptyState
          title="No items available"
          description={
            routeState.mode === "reinforcement"
              ? "All items are currently mastered. Return home or review the library."
              : "There are no language items in the content set yet."
          }
          actions={
            <>
              <Button asChild variant="link" className="h-auto w-fit px-0">
                <Link to="/">Back Home</Link>
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
        <div className="space-y-6">
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
        </div>
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
          <article
            ref={cardRef}
            className={cn(
              "relative min-h-[24rem] w-full rounded-3xl border bg-white text-left sm:min-h-[28rem]",
              revealed ? "cursor-default" : "group",
            )}
          >
            {!revealed ? (
              <button
                aria-label="Reveal study card"
                className="absolute inset-0 z-10 rounded-3xl cursor-pointer"
                onClick={() => setRevealed(true)}
                type="button"
              >
                <span className="sr-only">Reveal study card</span>
              </button>
            ) : null}
            <div className="absolute left-6 right-5 top-5 z-20 flex items-center justify-between">
              <div>
                {currentRecord ? (
                  <ProgressDots progress={currentRecord.progress} />
                ) : null}
              </div>
              <button
                type="button"
                className="-m-3 cursor-pointer p-3 text-slate-300 transition-colors hover:text-slate-400"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(currentItem.id);
                }}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    currentRecord?.starred
                      ? "fill-yellow-400 text-yellow-400"
                      : "",
                  )}
                />
              </button>
            </div>
            <div className="absolute inset-x-6 top-8 bottom-8 flex flex-col">
              <div
                className={cn(
                  "relative flex flex-1 items-center justify-center text-center",
                  revealed ? "-translate-y-2" : "-translate-y-5",
                )}
              >
                <div
                  ref={chineseTextWrapperRef}
                  className="absolute inset-x-0 top-1/2 flex max-w-full -translate-y-1/2 items-center justify-center"
                >
                  <div
                    ref={chineseTextRef}
                    className="text-2xl font-semibold leading-10 text-foreground"
                  >
                    {currentItem.chinese}
                  </div>
                </div>
                {revealed ? (
                  <div
                    ref={englishTextRef}
                    className="absolute inset-x-0 top-1/2 cursor-text select-text text-2xl font-medium leading-10"
                  >
                    {currentItem.english}
                  </div>
                ) : null}
              </div>
              {revealed && routeState.scope === "term_phrase" ? (
                <div
                  ref={exampleTextRef}
                  className="-mx-6 w-auto border-t border-border/70 px-6 pt-5 text-left"
                >
                  {examplePattern ? (
                    <p className="cursor-text select-text text-base leading-8 text-foreground/80">
                      <HighlightedText
                        item={currentItem}
                        text={examplePattern.english}
                      />
                    </p>
                  ) : (
                    <p className="text-sm leading-7 text-muted-foreground">
                      Example sentence pending.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            {!revealed ? (
              <div className="absolute right-0 bottom-8 left-0 text-center text-base text-muted-foreground transition-colors group-hover:text-primary">
                Tap to reveal
              </div>
            ) : null}
          </article>
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
      </div>
    </StudyShell>
  );
}

function parseStudyRoute(
  scopeOrMode?: string,
  mode?: string,
): { scope: StudyScope; mode: StudyMode } | null {
  if (!scopeOrMode) {
    return null;
  }

  const resolveMode = (m?: string): StudyMode => {
    if (m === "reinforcement") return "reinforcement";
    if (m === "starred") return "starred";
    return "random";
  };

  if (scopeOrMode === "pattern") {
    return {
      scope: "pattern",
      mode: resolveMode(mode),
    };
  }

  if (scopeOrMode === "term-phrase" || scopeOrMode === "term_phrase") {
    return {
      scope: "term_phrase",
      mode: resolveMode(mode),
    };
  }

  if (
    scopeOrMode === "random" ||
    scopeOrMode === "reinforcement" ||
    scopeOrMode === "starred"
  ) {
    return { scope: "term_phrase", mode: scopeOrMode as StudyMode };
  }

  return null;
}

function getStudyTitle(routeState: { scope: StudyScope; mode: StudyMode }) {
  if (routeState.mode === "starred") {
    return "Starred Items";
  }

  if (routeState.scope === "pattern") {
    return routeState.mode === "reinforcement"
      ? "Reinforcement Study"
      : "Random Study";
  }

  return routeState.mode === "reinforcement"
    ? "Reinforcement Study"
    : "Random Study";
}

function StudyShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!contentRef.current) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.fromTo(
        contentRef.current,
        {
          y: 18,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.28,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { scope: contentRef },
  );

  return (
    <AppShell
      title={title}
      actionsPlacement="top-right"
      showHeaderDivider={false}
      showBrandLink={false}
      reserveBrandSpace
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
      <div ref={contentRef}>{children}</div>
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
