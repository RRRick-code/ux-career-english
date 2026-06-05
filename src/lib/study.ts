import type {
  FeedbackRating,
  LanguageItem,
  LearningRecordMap,
  StudyPool,
  StudyScope,
  StudyMode,
} from "@/types";
import { getLearningRecord } from "./storage.ts";

const ROUND_SIZE_BY_SCOPE: Record<StudyScope, number> = {
  term_phrase: 20,
  pattern: 10,
};

export function shuffleItems<T>(input: T[]): T[] {
  const array = [...input];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[nextIndex]] = [array[nextIndex], array[index]];
  }
  return array;
}

export function buildStudyRound(
  allItems: LanguageItem[],
  records: LearningRecordMap,
  scope: StudyScope,
  pool: StudyPool,
  mode: StudyMode,
) {
  const scopeItems = allItems.filter((item) =>
    scope === "pattern" ? item.kind === "pattern" : item.kind !== "pattern",
  );

  const poolItems =
    pool === "starred"
      ? scopeItems.filter((item) => getLearningRecord(records, item.id).starred)
      : scopeItems;

  const candidates =
    mode === "random"
      ? poolItems
      : poolItems.filter((item) => {
          const record = getLearningRecord(records, item.id);
          return (
            record.status === "not_started" || record.status === "in_progress"
          );
        });

  const selected = shuffleItems(candidates).slice(
    0,
    ROUND_SIZE_BY_SCOPE[scope],
  );

  return {
    candidates,
    selected,
    isEmpty: selected.length === 0,
  };
}

export function summarizeFeedback(feedback: FeedbackRating[]) {
  return feedback.reduce(
    (summary, item) => {
      summary[item] += 1;
      return summary;
    },
    { hard: 0, uncertain: 0, easy: 0 },
  );
}
