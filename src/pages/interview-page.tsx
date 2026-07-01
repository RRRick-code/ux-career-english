import { useState, useRef, useMemo, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLearningRecords } from "@/hooks/use-learning-records";
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

  // Blur/Rehearsal mode state
  const [isBlurred, setIsBlurred] = useState<boolean>(false);

  // When selected question changes, reset blur state to prevent confusion
  useEffect(() => {
    setIsBlurred(false);
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
                setSelectedVocabItem(item);
              }}
              className="text-primary hover:underline font-semibold cursor-pointer border-none inline align-baseline p-0 bg-transparent"
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
  }, [currentQuestion?.standardAnswer, currentQuestion?.id, vocabMatches, records]);

  return (
    <AppShell
      title=""
      contentWidth="wide"
      showHeaderDivider={false}
    >
      <div className="-mx-4 -mt-8 -mb-8 sm:-mx-6 lg:-mx-8 xl:-mx-10 min-h-[calc(100vh-3.5rem)]">
        
        {/* Left Sidebar */}
        <div className="w-full lg:fixed lg:top-14 lg:left-0 lg:w-80 lg:h-[calc(100vh-3.5rem)] bg-white lg:border-r border-slate-200 overflow-hidden lg:z-10">
          {/* Stage Selector */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase block mb-1.5">
              Interview Stage
            </label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-full border-slate-200 h-8 bg-white text-xs">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {interviewQuestionBank.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.categoryNum}. {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question List */}
          <div className="overflow-y-auto lg:h-[calc(100vh-3.5rem-5.5rem)]">
            <nav className="divide-y divide-slate-100">
              {currentCategory?.questions.map((q) => {
                const record = getRecord(q.id);
                const isSelected = q.id === selectedQuestionId;

                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={cn(
                      "w-full text-left p-3.5 flex gap-2.5 transition-colors items-start hover:bg-slate-50 cursor-pointer",
                      isSelected
                        ? "bg-slate-50/80 border-l-4 border-l-primary text-slate-900"
                        : "border-l-4 border-l-transparent text-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-1 mt-0.5 shrink-0">
                      {record.starred && (
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400 shrink-0" />
                      )}
                      {record.status === "mastered" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                      {record.status === "in_progress" && (
                        <Sparkles className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] line-clamp-2 leading-snug">{q.question}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 self-center shrink-0" />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:ml-80 px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          {currentQuestion ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              
              {/* Question Header */}
              <div className="pb-6 border-b border-slate-200/80 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 leading-snug">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reusable Evidence Anchors Trigger */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 cursor-pointer border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                      >
                        Resume Anchors
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-6 shadow-xl">
                      <SheetHeader className="mb-6 border-b border-slate-100 pb-4">
                        <SheetTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Resume Evidence Anchors
                        </SheetTitle>
                      </SheetHeader>
                      <div className="space-y-5">
                        {interviewQuestionBank.evidenceAnchors.map((anchor) => (
                          <div
                            key={anchor.title}
                            className="space-y-1.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                          >
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {anchor.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed pl-3">
                              {anchor.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>

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
                    <SelectContent>
                      <SelectItem value="not_started" className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">Not Started</SelectItem>
                      <SelectItem value="in_progress" className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">Learning</SelectItem>
                      <SelectItem value="mastered" className="text-slate-600 font-medium focus:text-slate-900 focus:bg-slate-50 cursor-pointer">Mastered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Standard Answer Section */}
              <div className="space-y-3">
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
                  <SelectionHighlightMenu
                    containerRef={answerContainerRef}
                    english={currentQuestion.standardAnswer}
                    manualHighlights={getRecord(currentQuestion.id).manualHighlights || []}
                    onToggle={(range) => toggleHighlight(currentQuestion.id, range)}
                  />

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
                </div>
              </div>

              {/* Include (要点包含) */}
              <div className="space-y-3">
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
              <div className="space-y-3">
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

              <div className="mt-8 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-mono">{currentQuestion.id}</p>
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
