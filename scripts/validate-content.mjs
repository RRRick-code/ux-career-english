import { readFileSync } from "node:fs";

const languageItems = readJson("../data/language_items.json");
const taxonomy = readJson("../data/taxonomy.json");
const idCounters = readJson("../data/id_counters.json");

const errors = [];
const seenIds = new Set();
const maxSuffixByNamespace = new Map();
const taxonomyGroups = ["kind", "scene", "module", "intent"];
const taxonomyKeySets = Object.fromEntries(
  taxonomyGroups.map((group) => [
    group,
    new Set((taxonomy[group] ?? []).map((entry) => entry.key)),
  ]),
);

for (const [index, item] of languageItems.entries()) {
  const location = `language_items[${index}]`;
  const match = /^([^.]+)\.(\d+)$/.exec(item.id);

  if (!match) {
    errors.push(`${location}: invalid id format "${item.id}"`);
    continue;
  }

  const [, namespace, suffix] = match;
  const suffixNumber = Number(suffix);

  if (seenIds.has(item.id)) {
    errors.push(`${location}: duplicate id "${item.id}"`);
  }
  seenIds.add(item.id);

  maxSuffixByNamespace.set(
    namespace,
    Math.max(maxSuffixByNamespace.get(namespace) ?? 0, suffixNumber),
  );

  for (const group of taxonomyGroups) {
    if (!taxonomyKeySets[group].has(item[group])) {
      errors.push(
        `${location}: ${group}="${item[group]}" is not defined in taxonomy.json`,
      );
    }
  }
}

for (const [namespace, maxSuffix] of maxSuffixByNamespace.entries()) {
  const counterValue = idCounters[namespace];

  if (!Number.isInteger(counterValue)) {
    errors.push(`id_counters.${namespace} is missing or not an integer`);
    continue;
  }

  if (counterValue <= maxSuffix) {
    errors.push(
      `id_counters.${namespace} must be greater than ${maxSuffix}, got ${counterValue}`,
    );
  }
}

for (const [namespace, counterValue] of Object.entries(idCounters)) {
  if (!Number.isInteger(counterValue) || counterValue < 1) {
    errors.push(`id_counters.${namespace} must be a positive integer`);
  }
}

if (errors.length > 0) {
  console.error("Content validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Content validation passed for ${languageItems.length} items across ${maxSuffixByNamespace.size} namespaces.`,
);

function readJson(relativePath) {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  );
}
