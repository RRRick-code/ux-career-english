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
} from "@/types";
import {
  applyFeedback,
  getLearningRecord,
  loadLearningRecords,
  saveLearningRecords,
} from "@/lib/storage";

type LearningRecordsContextValue = {
  records: LearningRecordMap;
  getRecord: (itemId: string) => LearningRecord;
  updateWithFeedback: (
    itemId: string,
    feedback: FeedbackRating,
  ) => { previous: LearningRecord; next: LearningRecord };
};

const LearningRecordsContext =
  createContext<LearningRecordsContextValue | null>(null);

export function LearningRecordsProvider({ children }: PropsWithChildren) {
  const [records, setRecords] = useState<LearningRecordMap>(() =>
    loadLearningRecords(),
  );

  const value = useMemo<LearningRecordsContextValue>(
    () => ({
      records,
      getRecord: (itemId) => getLearningRecord(records, itemId),
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
