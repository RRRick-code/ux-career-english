# Study Flow Spec

## Purpose

Define the learning scopes and reveal behavior used by the app, separate from content storage rules.

## Scope Model

Study behavior is controlled by two dimensions:

- `scope`
- `mode`

Supported scopes:

- `term_phrase`
- `pattern`

Supported modes:

- `random`
- `reinforcement`

Current product rules:

- `term_phrase` supports both `random` and `reinforcement`
- `pattern` currently supports `random`

## Candidate Pools

- `term_phrase` rounds draw only from items whose `kind` is `term` or `phrase`
- `pattern` rounds draw only from items whose `kind` is `pattern`
- `random` and `reinforcement` keep their existing selection semantics within the chosen scope

## Reveal Behavior

### `term_phrase`

- Front side shows Chinese first
- Reveal shows the English answer
- Reveal also shows the linked example sentence from `examplePatternId`
- The linked `term` or `phrase` must be highlighted inside the example sentence

### `pattern`

- Front side shows Chinese first
- Reveal shows the English pattern
- No secondary example layer is shown

## Progress Ownership

- Progress is tracked per item id
- Studying a `term` or `phrase` only updates that `term` or `phrase`
- Studying a `pattern` only updates that `pattern`
- Linked example relationships do not auto-sync progress between item types
