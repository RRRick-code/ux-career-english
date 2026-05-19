import type {
  FeedbackRating,
  LearningRecord,
  LearningRecordMap,
  LearningStatus,
} from "@/types";

export const STORAGE_KEY = "ux-english2.learning-records";
export const LEARNING_RECORDS_EXPORT_APP = "ux-english2";
export const LEARNING_RECORDS_EXPORT_TYPE = "learning-records";
export const LEARNING_RECORDS_SCHEMA_VERSION = 1;

export type LearningRecordsExportFile = {
  app: typeof LEARNING_RECORDS_EXPORT_APP;
  type: typeof LEARNING_RECORDS_EXPORT_TYPE;
  schemaVersion: typeof LEARNING_RECORDS_SCHEMA_VERSION;
  exportedAt: string;
  records: LearningRecordMap;
};

export type LearningRecordsImportResult = {
  records: LearningRecordMap;
  importedCount: number;
  ignoredCount: number;
  totalCount: number;
};

export const DEFAULT_RECORD: LearningRecord = {
  progress: 0,
  status: "not_started",
};

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeLearningRecord(value: unknown): LearningRecord {
  if (!isRecord(value)) {
    return DEFAULT_RECORD;
  }

  const progress =
    typeof value.progress === "number" && Number.isFinite(value.progress)
      ? value.progress
      : 0;

  return {
    progress: clampProgress(progress),
    status:
      typeof value.status === "string"
        ? normalizeStatus(value.status)
        : DEFAULT_RECORD.status,
    ...(value.starred ? { starred: true } : {}),
  };
}

export function isMeaningfulLearningRecord(record: LearningRecord) {
  return (
    record.progress > 0 ||
    record.status !== DEFAULT_RECORD.status ||
    Boolean(record.starred)
  );
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
        normalizeLearningRecord(record),
      ]),
    );
  } catch {
    return {};
  }
}

export function buildLearningRecordsExport(
  records: LearningRecordMap,
  exportedAt = new Date(),
): LearningRecordsExportFile {
  return {
    app: LEARNING_RECORDS_EXPORT_APP,
    type: LEARNING_RECORDS_EXPORT_TYPE,
    schemaVersion: LEARNING_RECORDS_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    records: Object.fromEntries(
      Object.entries(records)
        .map(([id, record]) => [id, normalizeLearningRecord(record)] as const)
        .filter(([, record]) => isMeaningfulLearningRecord(record)),
    ),
  };
}

export function parseLearningRecordsImport(
  raw: string,
  validItemIds: Iterable<string>,
): LearningRecordsImportResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Invalid learning records backup file.");
  }

  if (
    parsed.app !== LEARNING_RECORDS_EXPORT_APP ||
    parsed.type !== LEARNING_RECORDS_EXPORT_TYPE ||
    parsed.schemaVersion !== LEARNING_RECORDS_SCHEMA_VERSION ||
    !isRecord(parsed.records)
  ) {
    throw new Error("Invalid learning records backup file.");
  }

  const validIds = new Set(validItemIds);
  const entries = Object.entries(parsed.records);
  const records = Object.fromEntries(
    entries
      .filter(([id]) => validIds.has(id))
      .map(([id, record]) => [id, normalizeLearningRecord(record)]),
  );

  const importedCount = Object.keys(records).length;

  return {
    records,
    importedCount,
    ignoredCount: entries.length - importedCount,
    totalCount: entries.length,
  };
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

export function removeLearningRecords(
  records: LearningRecordMap,
  itemIdsToRemove: Iterable<string>,
) {
  const idsToRemove = new Set(itemIdsToRemove);
  let removed = false;

  const nextRecords = Object.fromEntries(
    Object.entries(records)
      .map(([id, record]) => {
        if (!idsToRemove.has(id)) {
          return [id, record] as const;
        }

        if (record.starred) {
          removed = true; // Indicates we "changed" the record collection by clearing progress
          return [
            id,
            { ...record, progress: 0, status: "not_started" },
          ] as const;
        }

        removed = true;
        return [id, null] as const;
      })
      .filter((entry): entry is [string, LearningRecord] => entry[1] !== null),
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
    ...(record.starred ? { starred: true } : {}),
  };
}
