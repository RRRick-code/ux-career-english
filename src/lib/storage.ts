import type {
  FeedbackRating,
  HighlightRange,
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

  const manualHighlights = normalizeHighlightRanges(value.manualHighlights);

  return {
    progress: clampProgress(progress),
    status:
      typeof value.status === "string"
        ? normalizeStatus(value.status)
        : DEFAULT_RECORD.status,
    ...(value.starred ? { starred: true } : {}),
    ...(manualHighlights.length > 0 ? { manualHighlights } : {}),
  };
}

export function isMeaningfulLearningRecord(record: LearningRecord) {
  return (
    record.progress > 0 ||
    record.status !== DEFAULT_RECORD.status ||
    Boolean(record.starred) ||
    (record.manualHighlights?.length ?? 0) > 0
  );
}

/**
 * Cleans an arbitrary value into a sorted, merged list of valid highlight
 * ranges. Invalid entries (non-integer, negative, or zero-length) are dropped.
 * Overlapping or touching ranges are merged so storage stays canonical.
 */
export function normalizeHighlightRanges(value: unknown): HighlightRange[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const valid: HighlightRange[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }

    const { start, end } = entry;
    if (
      typeof start !== "number" ||
      typeof end !== "number" ||
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end <= start
    ) {
      continue;
    }

    valid.push({ start, end });
  }

  return mergeHighlightRanges(valid);
}

function mergeHighlightRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: HighlightRange[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // Merge when overlapping or directly touching (end === start).
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/** Adds a range to an existing list, merging overlaps. Returns a new array. */
export function addHighlightRange(
  ranges: HighlightRange[],
  range: HighlightRange,
): HighlightRange[] {
  return normalizeHighlightRanges([...ranges, range]);
}

/**
 * Removes the span covered by `range` from the existing list. A range fully
 * containing `range` is split into the leading/trailing remainder. Returns a
 * new array.
 */
export function removeHighlightRange(
  ranges: HighlightRange[],
  range: HighlightRange,
): HighlightRange[] {
  const result: HighlightRange[] = [];

  for (const existing of ranges) {
    // No overlap: keep as-is.
    if (existing.end <= range.start || existing.start >= range.end) {
      result.push(existing);
      continue;
    }

    // Leading remainder before the removed span.
    if (existing.start < range.start) {
      result.push({ start: existing.start, end: range.start });
    }

    // Trailing remainder after the removed span.
    if (existing.end > range.end) {
      result.push({ start: range.end, end: existing.end });
    }
  }

  return normalizeHighlightRanges(result);
}

/** True when `range` is fully covered by the existing highlight ranges. */
export function isRangeHighlighted(
  ranges: HighlightRange[],
  range: HighlightRange,
): boolean {
  return ranges.some(
    (existing) => existing.start <= range.start && existing.end >= range.end,
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

        removed = true;
        const nextRecord: LearningRecord = {
          progress: 0,
          status: "not_started",
          ...(record.starred ? { starred: true } : {}),
          ...((record.manualHighlights?.length ?? 0) > 0
            ? { manualHighlights: record.manualHighlights }
            : {}),
        };

        return isMeaningfulLearningRecord(nextRecord)
          ? ([id, nextRecord] as const)
          : ([id, null] as const);
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
    ...((record.manualHighlights?.length ?? 0) > 0
      ? { manualHighlights: record.manualHighlights }
      : {}),
  };
}
