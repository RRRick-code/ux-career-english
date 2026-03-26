# PRD v0.1

## Product Summary

This product is a lightweight React learning app for a senior UX/UI/Product Designer preparing English for North American job search, interviews, portfolio walkthroughs, and workplace communication.

The app focuses on three user tasks:

- browse structured language items
- review item details quickly
- complete one-round card-based learning sessions

This version is a minimum MVP and should stay intentionally small.

## Target User

- A staff-level UX/UI designer with strong design, leadership, and technical background
- Main need: stronger spoken professional English for interviews, portfolio presentation, and workplace communication
- Learning style: practical, repeated, low-friction review rather than heavy course structure

## Product Goals

- Make the structured language content easy to browse and review
- Turn the content into a repeatable round-based learning workflow
- Keep interaction simple enough for daily use
- Support desktop and mobile with the same core experience

## Non-Goals

- No search in MVP
- No favorites
- No login or cloud sync
- No saved round history
- No AI conversation or scoring
- No dark mode

## Information Architecture

The MVP contains three main pages and one shared detail layer:

- `Home`
- `Library`
- `Study`
- `Item Detail Sheet`

## Page Design

## 1. Home

### Purpose

Give the user a clear next step instead of acting as a large navigation hub.

### Modules

- learning overview
- primary action: reinforcement study
- secondary action: random study
- entry to the content library

### Functional Details

- Show three counts:
  - `Not Started`
  - `In Progress`
  - `Mastered`
- `Reinforcement Study`:
  - enters the Study page
  - starts a reinforcement round directly
- `Random Study`:
  - enters the Study page
  - starts a random round directly
- `Open Library`:
  - opens the Library page

### Notes

- Home should remain lightweight.
- Do not add extra entry clusters, dashboards, or secondary shortcuts in MVP.

## 2. Library

### Purpose

Let the user browse all content in a structured way.

### Modules

- filter bar
- item list
- item status display
- item progress display
- item detail sheet

### Functional Details

- Display all language items from `data/language_items.json`
- Support filtering by:
  - `scene`
  - `module`
  - `intent`
  - `kind`
  - `status`
- Support three display modes:
  - bilingual
  - English only
  - Chinese only
- Each item shows:
  - english
  - chinese
  - kind
  - scene
  - module
  - intent
  - status
  - progress number

### Interaction Rules

- Status cannot be edited in Library.
- Progress cannot be edited in Library.
- Clicking an item opens the detail sheet.

## 3. Item Detail Sheet

### Purpose

Provide a focused detail view without leaving the current page context.

### Interaction Pattern

- Desktop: right-side sheet
- Mobile: bottom sheet

### Content

- english
- chinese
- kind
- scene
- module
- intent
- status
- progress number

### Interaction Rules

- The detail sheet is read-only in MVP.
- No learning button is shown here.
- No status editing is allowed here.

## 4. Study

### Purpose

Provide a card-based learning workflow organized by rounds.

### Entry Modes

The Study page has two explicit entry modes:

- `Random Study`
- `Reinforcement Study`

Both modes use the same interaction pattern. The only difference is how the app selects items.

### Selection Rules

#### Random Study

- randomly select up to 20 items from the full content set
- if the content set contains fewer than 20 items, use all available items in that round
- each session is exactly one round

#### Reinforcement Study

- randomly select up to 20 items from items that are not yet mastered
- in MVP, "not yet mastered" means:
  - `Not Started`
  - `In Progress`
- if the eligible set contains fewer than 20 items, use all eligible items in that round
- if there are no eligible items, show an empty state and do not start a round
- each session is exactly one round

### Round Rules

- One round contains up to 20 items.
- The target round size is 20 items when enough items are available.
- One item is shown at a time.
- The user can exit the round at any time with a close button.
- Progress already written before exit must remain saved.
- Exiting a round does not save round history.
- Entering Study again always starts a fresh new round based on the chosen mode.

### Card Flow

For each item in a round:

1. Show Chinese first
2. User recalls the English expression mentally
3. User taps the card to reveal English
4. User chooses one of three feedback buttons:
   - `Hard`
   - `Uncertain`
   - `Easy`
5. The app updates progress and status
6. The app automatically moves to the next item

### Card Screen Modules

- round mode label
- current position indicator
- close button
- Chinese prompt card
- reveal English interaction
- three feedback buttons

### End of Round

After all items in the round are completed:

- show a settlement page
- show this round's basic results
- provide one main action: `Finish`
- clicking `Finish` returns the user to Home

No round record needs to be stored in MVP.

## Learning State Model

Each item needs both a learning status and a numeric progress field stored in local state.

### Status Values

- `Not Started`
- `In Progress`
- `Mastered`

### Progress Field

- field name recommendation: `progress`
- integer range: `0-100`
- minimum: `0`
- maximum: `100`

### Default State

For a new item:

- status = `Not Started`
- progress = `0`

## Progress Update Rules

Progress updates only happen in the Study page.

### Button Effects

- `Hard`
  - progress decreases by `20`
  - floor at `0`
- `Uncertain`
  - progress does not change
- `Easy`
  - progress increases by `20`
  - cap at `100`

### Status Transition Rules

- If an item has never been touched before:
  - initial state is `Not Started`
- After the user clicks any feedback button for the first time:
  - if progress is below `100`, status becomes `In Progress`
- If progress reaches `100`:
  - status becomes `Mastered`
- If a `Mastered` item later receives `Hard` or `Uncertain` and progress is no longer `100`:
  - status falls back to `In Progress`
- `Not Started` is only the initial untouched state

### Important Clarification

`Uncertain` does not change the numeric progress, but it still counts as a completed interaction for the current round.

If the item was previously untouched, clicking `Uncertain` should move its status from `Not Started` to `In Progress`.

## Settlement Page

### Purpose

Provide a light summary at the end of one round.

### Content

- round mode
- total items completed
- count of items by feedback type:
  - `Hard`
  - `Uncertain`
  - `Easy`
- count of items newly reaching `Mastered`
- main action: `Finish`

### Interaction Rule

- `Finish` returns to Home

## Local State

The MVP uses browser `localStorage`.

Recommended locally stored data:

- per-item `status`
- per-item `progress`

Round history should not be persisted in MVP.

## UI Constraints

- Use only shadcn/ui components with `style: "new-york"` and `baseColor: "neutral"`
- Light mode only
- Keep the interface simple and clear
- Avoid decorative or overdesigned interactions

## MVP Acceptance Checklist

- Home has only the necessary entry points
- Library can browse and filter content without editing status
- Item details open in a sheet on desktop and a bottom sheet on mobile
- Study supports exactly two entry modes:
  - `Random Study`
  - `Reinforcement Study`
- Each study round contains up to 20 items, depending on the available pool
- Each item is completed with one feedback action
- Progress is updated and saved immediately after each action
- A round can be exited midway without losing already saved progress
- A settlement page appears at the end of each round
- Completing the settlement page returns the user to Home
