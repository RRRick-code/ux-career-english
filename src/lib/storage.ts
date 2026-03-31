import type {
  FeedbackRating,
  LearningRecord,
  LearningRecordMap,
  LearningStatus,
} from "@/types";

export const STORAGE_KEY = "ux-english2.learning-records";

export const DEFAULT_RECORD: LearningRecord = {
  progress: 0,
  status: "not_started",
};

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function loadLearningRecords(): LearningRecordMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as LearningRecordMap;
    return Object.fromEntries(
      Object.entries(parsed).map(([id, record]) => [
        id,
        {
          progress: clampProgress(record.progress ?? 0),
          status: normalizeStatus(record.status),
        },
      ]),
    );
  } catch {
    return {};
  }
}

export function pruneLearningRecords(
  records: LearningRecordMap,
  validItemIds: Iterable<string>,
) {
  const validIds = new Set(validItemIds);
  let removed = false;

  const nextRecords = Object.fromEntries(
    Object.entries(records).filter(([id]) => {
      const keep = validIds.has(id);
      removed ||= !keep;
      return keep;
    }),
  );

  return {
    records: nextRecords,
    removed,
  };
}

export function saveLearningRecords(records: LearningRecordMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearLearningRecords() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getLearningRecord(
  records: LearningRecordMap,
  itemId: string,
): LearningRecord {
  return records[itemId] ?? DEFAULT_RECORD;
}

function normalizeStatus(status: string | undefined): LearningStatus {
  if (
    status === "not_started" ||
    status === "in_progress" ||
    status === "mastered"
  ) {
    return status;
  }

  return "not_started";
}

export function applyFeedback(
  record: LearningRecord,
  rating: FeedbackRating,
): LearningRecord {
  let nextProgress = record.progress;

  if (rating === "hard") {
    nextProgress = clampProgress(record.progress - 20);
  }

  if (rating === "easy") {
    nextProgress = clampProgress(record.progress + 20);
  }

  let nextStatus: LearningStatus;
  if (nextProgress >= 100) {
    nextStatus = "mastered";
  } else {
    nextStatus = "in_progress";
  }

  return {
    progress: nextProgress,
    status: nextStatus,
  };
}
