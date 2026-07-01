import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  FeedbackRating,
  HighlightRange,
  LearningRecord,
  LearningRecordMap,
  StudyScope,
} from "@/types";
import { items, allValidItemIds } from "@/lib/content";
import {
  addHighlightRange,
  applyFeedback,
  clearLearningRecords,
  getLearningRecord,
  isRangeHighlighted,
  loadLearningRecords,
  pruneLearningRecords,
  removeHighlightRange,
  removeLearningRecords,
  saveLearningRecords,
} from "@/lib/storage";

type LearningRecordsContextValue = {
  records: LearningRecordMap;
  getRecord: (itemId: string) => LearningRecord;
  resetProgress: (scope: StudyScope) => void;
  replaceRecords: (records: LearningRecordMap) => void;
  updateWithFeedback: (
    itemId: string,
    feedback: FeedbackRating,
  ) => { previous: LearningRecord; next: LearningRecord };
  toggleStar: (itemId: string) => void;
  toggleHighlight: (itemId: string, range: HighlightRange) => void;
};

const LearningRecordsContext =
  createContext<LearningRecordsContextValue | null>(null);

const scopeItemIds: Record<StudyScope, string[]> = {
  term_phrase: items
    .filter((item) => item.kind !== "pattern")
    .map((item) => item.id),
  pattern: items
    .filter((item) => item.kind === "pattern")
    .map((item) => item.id),
};

export function LearningRecordsProvider({ children }: PropsWithChildren) {
  const [records, setRecords] = useState<LearningRecordMap>(() => {
    const loadedRecords = loadLearningRecords();
    const { records: cleanedRecords, removed } = pruneLearningRecords(
      loadedRecords,
      allValidItemIds,
    );

    if (removed) {
      saveLearningRecords(cleanedRecords);
    }

    return cleanedRecords;
  });

  const value = useMemo<LearningRecordsContextValue>(
    () => ({
      records,
      getRecord: (itemId) => getLearningRecord(records, itemId),
      resetProgress: (scope) => {
        const { records: nextRecords, removed } = removeLearningRecords(
          records,
          scopeItemIds[scope],
        );

        if (!removed) {
          return;
        }

        setRecords(nextRecords);

        if (Object.keys(nextRecords).length === 0) {
          clearLearningRecords();
          return;
        }

        saveLearningRecords(nextRecords);
      },
      replaceRecords: (nextRecords) => {
        setRecords(nextRecords);

        if (Object.keys(nextRecords).length === 0) {
          clearLearningRecords();
          return;
        }

        saveLearningRecords(nextRecords);
      },
      updateWithFeedback: (itemId, feedback) => {
        const previous = getLearningRecord(records, itemId);
        const next = applyFeedback(previous, feedback);
        const nextRecords = {
          ...records,
          [itemId]: next,
        };

        setRecords(nextRecords);
        saveLearningRecords(nextRecords);

        return { previous, next };
      },
      toggleStar: (itemId) => {
        const previous = getLearningRecord(records, itemId);
        const next: LearningRecord = {
          ...previous,
          starred: !previous.starred,
        };

        const nextRecords = {
          ...records,
          [itemId]: next,
        };

        setRecords(nextRecords);
        saveLearningRecords(nextRecords);
      },
      toggleHighlight: (itemId, range) => {
        const previous = getLearningRecord(records, itemId);
        const current = previous.manualHighlights ?? [];
        const nextHighlights = isRangeHighlighted(current, range)
          ? removeHighlightRange(current, range)
          : addHighlightRange(current, range);

        const next: LearningRecord = {
          ...previous,
          ...(nextHighlights.length > 0
            ? { manualHighlights: nextHighlights }
            : {}),
        };
        if (nextHighlights.length === 0) {
          delete next.manualHighlights;
        }

        const nextRecords = {
          ...records,
          [itemId]: next,
        };

        setRecords(nextRecords);
        saveLearningRecords(nextRecords);
      },
    }),
    [records],
  );

  return (
    <LearningRecordsContext.Provider value={value}>
      {children}
    </LearningRecordsContext.Provider>
  );
}

export function useLearningRecords() {
  const context = useContext(LearningRecordsContext);
  if (!context) {
    throw new Error(
      "useLearningRecords must be used within LearningRecordsProvider",
    );
  }

  return context;
}
