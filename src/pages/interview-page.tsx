import { useState, useRef, useMemo, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLearningRecords } from "@/hooks/use-learning-records";
import { useInterviewSettings } from "@/hooks/use-interview-settings";
import {
  items,
  itemMap,
  interviewQuestionBank,
  interviewQuestions
} from "@/lib/content";
import { ItemDetailSheet } from "@/components/item-detail-sheet";
import { SelectionHighlightMenu } from "@/components/selection-highlight-menu";
import { cn } from "@/lib/utils";
import type { LearningStatus, LanguageItem } from "@/types";

export function InterviewPage() {
  const { records, getRecord, toggleStar, replaceRecords, toggleHighlight } =
    useLearningRecords();
  const { defaultBlurStandardAnswer } = useInterviewSettings();

  // Selected Category (default to the first stage)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    interviewQuestionBank.categories[0]?.id || ""
  );

  // Active Category Object
  const currentCategory = useMemo(() => {
    return interviewQuestionBank.categories.find(
      (cat) => cat.id === selectedCategoryId
    );
  }, [selectedCategoryId]);

  // Selected Question ID (default to first question in selected category)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");

  useEffect(() => {
    if (currentCategory && currentCategory.questions.length > 0) {
      // Find if we already have a selected question in this category
      const exists = currentCategory.questions.some(
        (q) => q.id === selectedQuestionId
      );
      if (!exists) {
        setSelectedQuestionId(currentCategory.questions[0].id);
      }
    }
  }, [currentCategory, selectedQuestionId]);

  // Active Question Object
  const currentQuestion = useMemo(() => {
    return interviewQuestions.find((q) => q.id === selectedQuestionId);
  }, [selectedQuestionId]);

  // Flat list of every question across all stages, for cross-stage prev/next navigation
  const flatQuestions = useMemo(() => {
    return interviewQuestionBank.categories.flatMap((cat) =>
      cat.questions.map((q) => ({ categoryId: cat.id, question: q }))
    );
  }, []);

  const currentQuestionIndex = useMemo(() => {
    return flatQuestions.findIndex((entry) => entry.question.id === selectedQuestionId);
  }, [flatQuestions, selectedQuestionId]);

  const goToQuestionAt = (index: number) => {
    const entry = flatQuestions[index];
    if (!entry) return;
    setSelectedCategoryId(entry.categoryId);
    setSelectedQuestionId(entry.question.id);
  };

  const hasPreviousQuestion = currentQuestionIndex > 0;
  const hasNextQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < flatQuestions.length - 1;

  // Blur/Rehearsal mode state
  const [isBlurred, setIsBlurred] = useState<boolean>(defaultBlurStandardAnswer);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);

  // When selected question changes, reset the answer visibility to the default
  useEffect(() => {
    setIsBlurred(defaultBlurStandardAnswer);
  }, [selectedQuestionId]);

  // Selection Highlight Menu Container ref
  const answerContainerRef = useRef<HTMLDivElement | null>(null);

  // Detailed sheet state for vocabulary keyword lookups
  const [selectedVocabItem, setSelectedVocabItem] = useState<LanguageItem | null>(null);

  // Update Status & Progress helper
  const handleStatusChange = (status: LearningStatus) => {
    if (!currentQuestion) return;
    const record = getRecord(currentQuestion.id);
    const nextRecords = {
      ...records,
      [currentQuestion.id]: {
        ...record,
        status,
        progress: status === "mastered" ? 100 : status === "in_progress" ? 50 : 0
      }
    };
    replaceRecords(nextRecords);
  };


  // Helper to escape regex special characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Regex lookup to match words in standard answer to language items
  const vocabMatches = useMemo(() => {
    const text = currentQuestion?.standardAnswer || "";
    const matches: Array<{ start: number; end: number; itemId: string }> = [];

    if (!text) return matches;

    // Scan vocab items
    for (const item of items) {
      if (item.english.length < 3) continue;

      const terms = [item.english, ...(item.highlightOverrides || [])];
      for (const term of terms) {
        if (term.length < 3) continue;
        try {
          const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
          let match;
          while ((match = regex.exec(text)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              itemId: item.id
            });
          }
        } catch (e) {
          // Ignore invalid regex issues
        }
      }
    }

    // Resolve overlaps (greedy choice of longer matches first)
    matches.sort((a, b) => (b.end - b.start) - (a.end - a.start));

    const nonOverlapping: typeof matches = [];
    const usedIndices = new Set<number>();

    for (const match of matches) {
      let overlap = false;
      for (let j = match.start; j < match.end; j++) {
        if (usedIndices.has(j)) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        nonOverlapping.push(match);
        for (let j = match.start; j < match.end; j++) {
          usedIndices.add(j);
        }
      }
    }

    return nonOverlapping;
  }, [currentQuestion?.standardAnswer]);

  // Combined renderer for text segments with overlapping highlights (vocab + manual)
  const renderedAnswerSegments = useMemo(() => {
    const text = currentQuestion?.standardAnswer || "";
    const qId = currentQuestion?.id || "";

    if (!text) return null;

    const manualHighlights = getRecord(qId).manualHighlights || [];
    const boundaries = new Set<number>([0, text.length]);

    for (const m of vocabMatches) {
      boundaries.add(m.start);
      boundaries.add(m.end);
    }

    for (const h of manualHighlights) {
      if (h.start < text.length) {
        boundaries.add(Math.max(0, h.start));
      }
      if (h.end <= text.length) {
        boundaries.add(Math.min(text.length, h.end));
      }
    }

    const points = [...boundaries]
      .filter((p) => p >= 0 && p <= text.length)
      .sort((a, b) => a - b);

    const nodes: React.ReactNode[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      if (end <= start) continue;

      const segment = text.slice(start, end);
      const vocab = vocabMatches.find((m) => start >= m.start && end <= m.end);
      const inManual = manualHighlights.some(
        (h) => start >= h.start && end <= h.end
      );

      let node: React.ReactNode = segment;

      if (vocab) {
        const item = itemMap.get(vocab.itemId);
        if (item) {
          node = (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isBlurred) return;
                setSelectedVocabItem(item);
              }}
              className={cn(
                "text-primary font-semibold border-none inline align-baseline p-0 bg-transparent",
                isBlurred
                  ? "cursor-default"
                  : "hover:underline cursor-pointer"
              )}
            >
              {segment}
            </button>
          );
        }
      }

      if (inManual) {
        node = (
          <mark className="bg-yellow-200/80 text-inherit px-0.5 rounded-sm">
            {node}
          </mark>
        );
      }

      nodes.push(<span key={`${start}-${end}`}>{node}</span>);
    }

    return nodes;
  }, [currentQuestion?.standardAnswer, currentQuestion?.id, vocabMatches, records, isBlurred]);

  return (
    <AppShell
      title=""
      contentWidth="wide"
      showHeaderDivider={false}
    >
      <div className="-mx-4 -mt-8 -mb-8 sm:-mx-6 lg:-mx-8 xl:-mx-10 min-h-[calc(100vh-3.5rem)]">
        <button
          type="button"
          aria-label="Close interview navigation"
          onClick={() => setIsSidebarExpanded(false)}
          className={cn(
            "fixed inset-x-0 top-14 bottom-0 z-20 bg-slate-950/5 transition-opacity lg:hidden",
            isSidebarExpanded
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          )}
        />
        
        {/* Left Sidebar */}
        <div
          className={cn(
            "fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-white border-r border-slate-200 overflow-hidden z-30 transition-[width,box-shadow] duration-200 lg:z-10 lg:w-80 lg:shadow-none",
            isSidebarExpanded ? "w-80 shadow-xl" : "w-12"
          )}
        >
          <div className={cn("h-full lg:hidden", isSidebarExpanded && "hidden")}>
            <button
              type="button"
              aria-label="Open interview navigation"
              onClick={() => setIsSidebarExpanded(true)}
              className="flex h-12 w-full items-center justify-center border-b border-slate-100 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="flex h-[calc(100%-3rem)] items-center justify-center">
              <span className="rotate-180 [writing-mode:vertical-rl] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Interview
              </span>
            </div>
          </div>

          <div className={cn("h-full", !isSidebarExpanded && "hidden lg:block")}>
            {/* Stage Selector */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Interview Stage
                </label>
                <button
                  type="button"
                  aria-label="Collapse interview navigation"
                  onClick={() => setIsSidebarExpanded(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-full border-slate-200 h-8 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 shadow-xs font-medium [&_svg]:text-slate-500 [&_svg]:data-[state=open]:text-slate-900">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="p-1">
                  {interviewQuestionBank.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">
                      {cat.categoryNum}. {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question List */}
            <div className="h-[calc(100vh-3.5rem-5.5rem)] overflow-y-auto">
              <nav className="divide-y divide-slate-100">
                {currentCategory?.questions.map((q) => {
                  const record = getRecord(q.id);
                  const isSelected = q.id === selectedQuestionId;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setIsSidebarExpanded(false);
                      }}
                      className={cn(
                        "w-full text-left p-3.5 flex gap-2.5 transition-colors items-start hover:bg-slate-50 cursor-pointer",
                        isSelected
                          ? "bg-slate-50/80 border-l-4 border-l-primary text-slate-900"
                          : "border-l-4 border-l-transparent text-slate-600"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] line-clamp-2 leading-snug">{q.question}</p>
                      </div>
                      <div className="flex items-center gap-1 self-center shrink-0">
                        {record.status === "mastered" && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                        {record.status === "in_progress" && (
                          <Sparkles className="h-3 w-3 text-sky-500 shrink-0" />
                        )}
                        {record.starred ? (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="ml-12 lg:ml-80 px-4 pt-0 pb-8 sm:px-6 lg:px-8 xl:px-10">
          {currentQuestion ? (
            <div className="max-w-4xl mx-auto">

              {/* Sticky Action Toolbar */}
              <div className="sticky top-14 z-10 flex items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-100 py-3">
                <div className="flex items-center gap-2">
                  {/* Bookmark Star */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleStar(currentQuestion.id)}
                    className="h-9 w-9 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs cursor-pointer transition-colors"
                  >
                    <Star
                      className={cn(
                        "h-4.5 w-4.5 transition-colors",
                        getRecord(currentQuestion.id).starred
                          ? "fill-yellow-400 text-yellow-500"
                          : "text-slate-500"
                      )}
                    />
                  </Button>

                  {/* Rehearsal Status Dropdown */}
                  <Select
                    value={getRecord(currentQuestion.id).status || "not_started"}
                    onValueChange={(val) => handleStatusChange(val as LearningStatus)}
                  >
                    <SelectTrigger className="w-32 h-9 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 shadow-xs font-medium [&_svg]:text-slate-500 [&_svg]:data-[state=open]:text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-1">
                      <SelectItem value="not_started" className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">Not Started</SelectItem>
                      <SelectItem value="in_progress" className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">Learning</SelectItem>
                      <SelectItem value="mastered" className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">Mastered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cross-stage Previous / Next Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous question"
                    disabled={!hasPreviousQuestion}
                    onClick={() => goToQuestionAt(currentQuestionIndex - 1)}
                    className="h-9 w-9 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next question"
                    disabled={!hasNextQuestion}
                    onClick={() => goToQuestionAt(currentQuestionIndex + 1)}
                    className="h-9 w-9 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Question Title */}
              <div className="mt-6 space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 leading-snug">
                  {currentQuestion.question}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">{currentQuestion.id}</p>
              </div>

              {/* Standard Answer Section */}
              <div className="mt-12 space-y-3">
                <div className="flex flex-row items-center justify-between pb-2 border-b border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-800">
                    Standard Answer
                  </h3>
                  
                  {/* Rehearsal Blur Toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsBlurred((prev) => !prev)}
                    aria-label={isBlurred ? "Reveal answer" : "Blur answer"}
                    title={isBlurred ? "Reveal answer" : "Blur answer"}
                    className="h-7 w-7 cursor-pointer border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs [&_svg]:size-3"
                  >
                    {isBlurred ? (
                      <Eye className="size-3" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                  </Button>
                </div>

                <div className="py-2 relative select-text">
                  {/* Custom Selection Highlight Menu */}
                  {!isBlurred ? (
                    <SelectionHighlightMenu
                      containerRef={answerContainerRef}
                      english={currentQuestion.standardAnswer}
                      manualHighlights={getRecord(currentQuestion.id).manualHighlights || []}
                      onToggle={(range) => toggleHighlight(currentQuestion.id, range)}
                    />
                  ) : null}

                  {/* Text Container */}
                  <div
                    ref={answerContainerRef}
                    className={cn(
                      "text-slate-800 text-base leading-loose whitespace-pre-wrap transition-all duration-300 font-sans tracking-wide",
                      isBlurred
                        ? "blur-[5px] select-none cursor-default"
                        : "cursor-text"
                    )}
                  >
                    {renderedAnswerSegments}
                  </div>
                  {isBlurred ? (
                    <button
                      type="button"
                      aria-label="Reveal answer"
                      onClick={() => setIsBlurred(false)}
                      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
                    />
                  ) : null}
                </div>
              </div>

              {/* Include (要点包含) */}
              <div className="mt-12 space-y-3">
                <h3 className="text-sm font-bold text-emerald-800 pb-2 border-b border-slate-200/60">
                  Include
                </h3>
                <ul className="space-y-2.5 pl-4 list-disc marker:text-emerald-500">
                  {currentQuestion.include.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avoid (避坑指南) */}
              <div className="mt-12 space-y-3">
                <h3 className="text-sm font-bold text-rose-800 pb-2 border-b border-slate-200/60">
                  Avoid
                </h3>
                <ul className="space-y-2.5 pl-4 list-disc marker:text-rose-400">
                  {currentQuestion.avoid.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>


            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select a question to get started.
            </div>
          )}
        </div>

      </div>

      {/* Vocabulary Keyword Lookups Sheet */}
      {selectedVocabItem && (
        <ItemDetailSheet
          item={selectedVocabItem}
          record={getRecord(selectedVocabItem.id)}
          open={!!selectedVocabItem}
          onOpenChange={(open) => {
            if (!open) setSelectedVocabItem(null);
          }}
        />
      )}
    </AppShell>
  );
}
