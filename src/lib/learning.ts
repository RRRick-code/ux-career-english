import type {
  LanguageItem,
  LearningRecordMap,
  LearningStatus,
  TaxonomyMap,
} from "@/types";
import { getLearningRecord } from "@/lib/storage";

export const learningStatusLabels: Record<LearningStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  mastered: "Mastered",
};

export function getStatusLabel(status: LearningStatus) {
  return learningStatusLabels[status];
}

export function countStatuses(
  items: LanguageItem[],
  records: LearningRecordMap,
): Record<LearningStatus, number> {
  return items.reduce(
    (summary, item) => {
      const status = getLearningRecord(records, item.id).status;
      summary[status] += 1;
      return summary;
    },
    { not_started: 0, in_progress: 0, mastered: 0 },
  );
}

export function sortTaxonomyEntries<T extends keyof TaxonomyMap>(
  taxonomy: TaxonomyMap,
  group: T,
) {
  return [...taxonomy[group]].sort((left, right) => left.order - right.order);
}
