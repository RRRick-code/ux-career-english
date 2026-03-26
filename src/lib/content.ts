import languageItems from "../../data/language_items.json";
import taxonomyData from "../../data/taxonomy.json";
import type { LanguageItem, TaxonomyEntry, TaxonomyMap } from "@/types";
import { sentenceCase } from "@/lib/utils";

export const items = languageItems as LanguageItem[];
export const taxonomy = taxonomyData as TaxonomyMap;

export const itemMap = new Map(items.map((item) => [item.id, item]));

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
