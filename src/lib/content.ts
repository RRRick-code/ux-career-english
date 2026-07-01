import { Fragment, createElement, type ReactNode } from "react";
import languageItems from "../../data/language_items.json";
import taxonomyData from "../../data/taxonomy.json";
import interviewQuestionsData from "../../data/interview_questions.json";
import {
  buildHighlightCandidates,
  findHighlightMatch,
} from "../../shared/highlight-match.js";
import type {
  HighlightRange,
  LanguageItem,
  StudyScope,
  TaxonomyEntry,
  TaxonomyMap,
  InterviewQuestionBank,
  InterviewQuestion,
} from "@/types";
import { sentenceCase } from "@/lib/utils";

export const items = languageItems as LanguageItem[];
export const taxonomy = taxonomyData as TaxonomyMap;
export const interviewQuestionBank = interviewQuestionsData as InterviewQuestionBank;
export const interviewQuestions = interviewQuestionBank.categories.flatMap(
  (cat) => cat.questions
);

export const allValidItemIds = [
  ...items.map((item) => item.id),
  ...interviewQuestions.map((q) => q.id),
];

export const itemMap = new Map(items.map((item) => [item.id, item]));
const patternUsageMap = new Map<string, LanguageItem[]>();

for (const item of items) {
  if (!item.examplePatternId) {
    continue;
  }

  const nextItems = patternUsageMap.get(item.examplePatternId) ?? [];
  nextItems.push(item);
  patternUsageMap.set(item.examplePatternId, nextItems);
}

function entryMap(entries: TaxonomyEntry[]) {
  return new Map(entries.map((entry) => [entry.key, entry]));
}

export const taxonomyIndex = {
  kind: entryMap(taxonomy.kind),
  scene: entryMap(taxonomy.scene),
  module: entryMap(taxonomy.module),
  intent: entryMap(taxonomy.intent),
};

export function getTaxonomyLabel(
  group: keyof TaxonomyMap,
  key: string,
): string {
  return taxonomyIndex[group].get(key)?.label ?? sentenceCase(key);
}

export function getStudyItems(scope: StudyScope) {
  return items.filter((item) =>
    scope === "pattern" ? item.kind === "pattern" : item.kind !== "pattern",
  );
}

export function getExamplePatternForItem(item: LanguageItem) {
  if (!item.examplePatternId) {
    return null;
  }

  return itemMap.get(item.examplePatternId) ?? null;
}

export function getPatternUsageItems(patternId: string) {
  return patternUsageMap.get(patternId) ?? [];
}

export function renderHighlightedText(
  text: string,
  item: LanguageItem,
  className = "bg-transparent px-0 py-0 font-medium text-primary",
): ReactNode {
  const match = findHighlightMatch(
    text,
    buildHighlightCandidates(item.english, item.highlightOverrides),
  );
  if (!match) {
    return text;
  }

  const before = text.slice(0, match.index);
  const highlighted = text.slice(match.index, match.index + match.length);
  const after = text.slice(match.index + match.length);

  return createElement(
    Fragment,
    null,
    before,
    createElement("mark", { className }, highlighted),
    after,
  );
}

export const MANUAL_HIGHLIGHT_CLASS_NAME =
  "rounded-[3px] bg-yellow-100 px-0 py-0";

/**
 * Renders `text` with two independent highlight layers:
 * - the content-driven pattern/term match (text color / weight), and
 * - the user's manual highlights (light-yellow background).
 *
 * The two layers are stored and computed separately so they never mix. Where
 * they overlap, the content layer is nested inside the manual layer so the
 * yellow background shows through its transparent background.
 */
export function renderHighlightedTextWithManual(
  text: string,
  item: LanguageItem,
  manualHighlights: HighlightRange[] = [],
  contentClassName = "bg-transparent px-0 py-0 font-medium text-primary",
): ReactNode {
  const contentMatch = findHighlightMatch(
    text,
    buildHighlightCandidates(item.english, item.highlightOverrides),
  );
  const contentRange = contentMatch
    ? { start: contentMatch.index, end: contentMatch.index + contentMatch.length }
    : null;

  // Collect every segment boundary, clamped to the text bounds.
  const boundaries = new Set<number>([0, text.length]);
  if (contentRange) {
    boundaries.add(contentRange.start);
    boundaries.add(contentRange.end);
  }
  for (const range of manualHighlights) {
    if (range.start < text.length) {
      boundaries.add(Math.max(0, range.start));
    }
    if (range.end <= text.length) {
      boundaries.add(Math.min(text.length, range.end));
    }
  }

  const points = [...boundaries].filter((p) => p >= 0 && p <= text.length).sort(
    (a, b) => a - b,
  );

  const nodes: ReactNode[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (end <= start) {
      continue;
    }

    const segment = text.slice(start, end);
    const inContent = contentRange
      ? start >= contentRange.start && end <= contentRange.end
      : false;
    const inManual = manualHighlights.some(
      (range) => start >= range.start && end <= range.end,
    );

    if (!inContent && !inManual) {
      nodes.push(segment);
      continue;
    }

    let node: ReactNode = segment;
    if (inContent) {
      node = createElement("mark", { className: contentClassName }, node);
    }
    if (inManual) {
      node = createElement(
        "mark",
        { className: MANUAL_HIGHLIGHT_CLASS_NAME },
        node,
      );
    }

    nodes.push(createElement(Fragment, { key: `${start}-${end}` }, node));
  }

  return createElement(Fragment, null, ...nodes);
}
