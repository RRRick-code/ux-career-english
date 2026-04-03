import { Fragment, createElement, type ReactNode } from "react";
import languageItems from "../../data/language_items.json";
import taxonomyData from "../../data/taxonomy.json";
import {
  buildHighlightCandidates,
  findHighlightMatch,
} from "../../shared/highlight-match.js";
import type {
  LanguageItem,
  StudyScope,
  TaxonomyEntry,
  TaxonomyMap,
} from "@/types";
import { sentenceCase } from "@/lib/utils";

export const items = languageItems as LanguageItem[];
export const taxonomy = taxonomyData as TaxonomyMap;

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
