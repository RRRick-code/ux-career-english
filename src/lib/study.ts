import type {
  FeedbackRating,
  LanguageItem,
  LearningRecordMap,
  StudyMode,
} from "@/types";
import { getLearningRecord } from "@/lib/storage";

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
  mode: StudyMode,
) {
  const candidates =
    mode === "random"
      ? allItems
      : allItems.filter((item) => {
          const record = getLearningRecord(records, item.id);
          return (
            record.status === "not_started" || record.status === "in_progress"
          );
        });

  const selected = shuffleItems(candidates).slice(0, 20);

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
