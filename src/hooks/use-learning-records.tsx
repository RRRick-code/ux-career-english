import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  FeedbackRating,
  LearningRecord,
  LearningRecordMap,
  StudyScope,
} from "@/types";
import { items } from "@/lib/content";
import {
  applyFeedback,
  clearLearningRecords,
  getLearningRecord,
  loadLearningRecords,
  pruneLearningRecords,
  removeLearningRecords,
  saveLearningRecords,
} from "@/lib/storage";

type LearningRecordsContextValue = {
  records: LearningRecordMap;
  getRecord: (itemId: string) => LearningRecord;
  resetProgress: (scope: StudyScope) => void;
  updateWithFeedback: (
    itemId: string,
    feedback: FeedbackRating,
  ) => { previous: LearningRecord; next: LearningRecord };
  toggleStar: (itemId: string) => void;
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
      items.map((item) => item.id),
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
