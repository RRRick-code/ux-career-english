# Data Architecture

## Goal

This project stores English learning content in a format that the React app can consume directly, without an extra content build step.

## Source of Truth

- `data/language_items.json` is the canonical content file.
- `data/taxonomy.json` is the canonical taxonomy file for labels, descriptions, and UI ordering.

The app should read these files directly.

## Content Model

Each item in `data/language_items.json` is one atomic learning item.

Supported kinds:

- `term`
- `phrase`
- `pattern`

Each item contains these fields:

- `id`
- `kind`
- `english`
- `chinese`
- `scene`
- `module`
- `intent`

## Taxonomy Model

`data/taxonomy.json` defines the controlled vocabulary used by the app:

- `kind`
- `scene`
- `module`
- `intent`

Each taxonomy entry should provide:

- `key`
- `label`
- `description`
- `order`

This keeps navigation, filters, and section titles out of React component hardcoding.

## Modeling Rules

- Keep every learning item atomic. Do not store scripts or multi-part practice sets in this file.
- Use stable `id` values so the app can rely on them for routing, bookmarks, and local storage.
- `kind`, `scene`, `module`, and `intent` must use values defined in `data/taxonomy.json`.

## ID Lifecycle

- `id` is the learning identity of an item and becomes immutable once created.
- `id` format is `<namespace>.<NNN+>`.
- `namespace` is the item's `module` key at creation time.
- The numeric suffix is zero-padded to at least 3 digits. Values above `999` continue naturally as `1000`, `1001`, and so on.
- If an item's `module` changes later, its `id` does not change.
- Deleted IDs are permanently retired and must never be reused.

## Counter File

- `data/id_counters.json` stores the next assignable integer for each namespace.
- `data/id_counters.json` is the source of truth for new ID allocation.
- Counter values only move forward. Deleting an item never decrements or reclaims a number.
- New namespaces should be added to `data/id_counters.json` in the same change that introduces the first item for that namespace.

## Content Operations

- `ADD`:
  - Create a new item with a newly allocated `id` from `data/id_counters.json`.
  - Increment the namespace counter in the same change.
- `EDIT_KEEP_ID`:
  - Keep the same `id` when editing wording, translation, or taxonomy for the same learning unit.
- `DELETE`:
  - Remove the item from `data/language_items.json`.
  - Do not modify historical IDs or roll counters back.
- `REPLACE`:
  - Remove the old item and add a new one with a new `id`.
  - Use this when the learning target has materially changed and the old progress should not carry forward.

## Editing Workflow

1. Read `data/id_counters.json` before any `ADD` or `REPLACE` operation.
2. Edit `data/language_items.json` when adding, refining, deleting, or replacing learning content.
3. Edit `data/taxonomy.json` when changing labels, descriptions, or category ordering.
4. Update `data/id_counters.json` in the same change as any new ID allocation.
5. Keep the three files aligned so every content item uses valid taxonomy keys and every active namespace has a valid counter.
6. Run `npm run validate:content` after changing content, taxonomy, or counters.

## React Consumption

- React can import these JSON files directly or fetch them as static assets.
- No generated Markdown, JSONL conversion, or schema build output is required.
- Any validation should happen in app code or lightweight tooling, not through a separate content compilation layer.

## Validation Invariants

- Every active item `id` in `data/language_items.json` must be unique.
- Every active item `id` must match the `<namespace>.<NNN+>` format.
- `kind`, `scene`, `module`, and `intent` must reference keys that exist in `data/taxonomy.json`.
- Every active namespace must have a counter in `data/id_counters.json`.
- Each counter value must be a positive integer and strictly greater than the largest active suffix in the same namespace.
