# Data Architecture

## Overview

This project stores English learning content in JSON that React can consume directly, without an extra content build step.

- `data/language_items.json` is the canonical content file.
- `data/taxonomy.json` is the canonical taxonomy file for labels, descriptions, and UI ordering.
- React can import these files directly or fetch them as static assets.
- No generated Markdown, JSONL conversion, or schema build output is required.
- Validation should happen in app code or lightweight tooling, not through a separate content compilation layer.

## Content Model

Each item in `data/language_items.json` is one atomic learning item. Do not store scripts or multi-part practice sets in this file.

Supported kinds:

- `term`
- `phrase`
- `pattern`

Every item contains:

- `id`
- `kind`
- `english`
- `chinese`
- `scene`
- `module`
- `intent`

Optional fields:

- `highlightOverrides`: an optional array of alternate English surface forms used for highlight matching when the linked example sentence needs a different tense, inflection, or part of speech.

Relationship rules:

- `term` and `phrase` items are the primary vocabulary learning units and must contain `examplePatternId`.
- `pattern` items do not contain `examplePatternId`.
- Every `term` and `phrase` must link to exactly one example sentence through `examplePatternId`.
- The linked example sentence must be stored as a real `pattern` item, not duplicated inline inside the `term` or `phrase`.
- A linked example `pattern` must contain the target `term` or `phrase` in its English text so the app can highlight it after reveal.
- Highlight matching already includes case-insensitive token matching and common inflection handling, including many regular verb forms and a small set of irregular forms.
- If the linked example sentence needs a different tense, inflection, or part of speech for highlighting, use `highlightOverrides` on the `term` or `phrase`.
- Example relationships should stay inside the same `module`.

`data/taxonomy.json` defines the controlled vocabulary for `kind`, `scene`, `module`, and `intent`. Each taxonomy entry must provide:

- `key`
- `label`
- `description`
- `order`

This keeps navigation, filters, and section titles out of React component hardcoding. `kind`, `scene`, `module`, and `intent` in content items must use values defined in `data/taxonomy.json`.

## IDs and Counters

- `id` is the learning identity of an item and becomes immutable once created.
- `id` format is `<namespace>.<NNN+>`.
- `namespace` is the item's `module` key at creation time.
- The numeric suffix is zero-padded to at least 3 digits. Values above `999` continue naturally as `1000`, `1001`, and so on.
- If an item's `module` changes later, its `id` does not change.
- Deleted IDs are permanently retired and must never be reused.
- Use stable `id` values so the app can rely on them for routing, bookmarks, and local storage.
- `data/id_counters.json` stores the next assignable integer for each namespace and is the source of truth for new ID allocation.
- Counter values only move forward. Deleting an item never decrements or reclaims a number.
- New namespaces should be added to `data/id_counters.json` in the same change that introduces the first item for that namespace.

## Content Operations

Every data mutation must be classified as exactly one of: `ADD`, `EDIT_KEEP_ID`, `DELETE`, `REPLACE`.

- `ADD`: Create a new item with a newly allocated `id` from `data/id_counters.json`. Never generate a new `id` by scanning only active items in `data/language_items.json`. Increment the namespace counter in the same change. Any new `term` or `phrase` must be created with a valid linked example `pattern`, unless an existing compatible pattern is explicitly reused.
- `EDIT_KEEP_ID`: Keep the same `id` when editing wording, translation, taxonomy, `examplePatternId`, or `highlightOverrides` for the same learning unit.
- `DELETE`: Remove the item from `data/language_items.json`. Do not modify historical IDs or roll counters back.
- `REPLACE`: Use this when the old and new content are not the same learning unit. Remove the old item and add a new one with a new `id`. The new `id` must come from `data/id_counters.json`; the retired `id` stays retired.

## Editing Workflow

1. Read `data/id_counters.json` before any `ADD` or `REPLACE` operation.
2. Edit `data/language_items.json` when adding, refining, deleting, or replacing learning content.
3. Edit `data/taxonomy.json` when changing labels, descriptions, or category ordering.
4. Update `data/id_counters.json` in the same change as any new ID allocation.
5. If you edit the English text of a `term`, `phrase`, linked `pattern`, or `highlightOverrides`, re-check that the example relationship still works for highlighting.
6. Keep the three files aligned so every content item uses valid taxonomy keys and every active namespace has a valid counter.
7. Run `npm run validate:content` after changing content, taxonomy, or counters.

## Validation Invariants

- Every active item `id` in `data/language_items.json` must be unique.
- Every active item `id` must match the `<namespace>.<NNN+>` format.
- `kind`, `scene`, `module`, and `intent` must reference keys that exist in `data/taxonomy.json`.
- Every active namespace must have a counter in `data/id_counters.json`.
- Each counter value must be a positive integer and strictly greater than the largest active suffix in the same namespace.
- Every `term` and `phrase` must have a non-empty `examplePatternId`.
- Every `examplePatternId` must reference an existing `pattern` item.
- The referenced `pattern` must be in the same `module` as the `term` or `phrase`.
- The referenced `pattern.english` must contain the linked `term.english` or `phrase.english`, or a declared `highlightOverrides` form, after case-insensitive token normalization and built-in inflection matching.
