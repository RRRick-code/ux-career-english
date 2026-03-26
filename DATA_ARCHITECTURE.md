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

## Editing Workflow

1. Edit `data/language_items.json` when adding or refining learning content.
2. Edit `data/taxonomy.json` when changing labels, descriptions, or category ordering.
3. Keep the two files aligned so every content item uses valid taxonomy keys.

## React Consumption

- React can import these JSON files directly or fetch them as static assets.
- No generated Markdown, JSONL conversion, or schema build output is required.
- Any validation should happen in app code or lightweight tooling, not through a separate content compilation layer.
