# AGENTS.md

## Project Overview

This project helps a UX/UI/Product Designer prepare English for North American job search, interviews, and workplace communication.

Its core output is a structured, reusable English content library, including vocabulary, phrases, sentence patterns, mock answers, and communication scripts.

The same content should also support a simple GitHub Pages web app for reading, search, and practice.

## User Profile

The user is a staff-level UX/UI designer with 12 years of experience at top Chinese tech companies, combining management, design, and technical depth. The profile is especially strong in consumer product design, platform-scale work, leadership, and business impact.

Use `USER_PROFILE.md` as the detailed source of truth whenever output should reflect the user's real background.

## Tech Stack

- Frontend: React + TypeScript
- Build tool: Vite
- Routing: React Router with HashRouter
- Data flow: app-ready JSON content files consumed directly by React
- Local state: browser localStorage
- Deployment: GitHub Actions + GitHub Pages

## UI Rules

- Follow the current shadcn preset-based setup in the repo instead of reintroducing legacy hand-maintained theme/config patterns.
- Use the local shadcn components in `src/components/ui` as the default UI layer, and add new shadcn components via the `shadcn` CLI so they stay aligned with the repo setup.
- Treat `components.json`, `src/index.css`, and `package.json` as the source of truth for shadcn setup details.
- Use light mode only; do not design or implement dark mode.
- Keep the interface simple and clear; avoid over-design.

## Working Rules

- Use North American workplace English as the default reference scope; keep Vancouver/Canada as the user's job target context, not the only source boundary.
- Prioritize spoken, interview-ready, and workplace-usable English over academic or overly formal language.
- Follow `DATA_ARCHITECTURE.md` for direct-consumption content storage and file organization.

## Content Editing Protocol

- Before changing `data/language_items.json`, first read `DATA_ARCHITECTURE.md` and `data/id_counters.json`.
- Classify every data mutation as exactly one of: `ADD`, `EDIT_KEEP_ID`, `DELETE`, `REPLACE`.
- `ADD`:
  - Allocate the new `id` from `data/id_counters.json`.
  - Treat `data/id_counters.json` as the source of truth for the next assignable number.
  - Update the counter in the same change as the new item.
- `EDIT_KEEP_ID`:
  - Keep the existing `id` when the learning unit is still the same.
  - Wording cleanup, translation refinement, and taxonomy updates do not justify a new `id`.
- `DELETE`:
  - Remove the item from `data/language_items.json`.
  - Do not reuse its `id`, and do not decrement counters.
- `REPLACE`:
  - Use this when the old and new content are not the same learning unit.
  - Remove the old item and create a new item with a newly allocated `id`.
- Never generate new IDs by scanning only active items in `data/language_items.json`.
- Run `npm run validate:content` after data changes that touch content, taxonomy, or counters.
