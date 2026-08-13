# Parking Lot: POC Parse

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **Plan `extract-mdast-transparently`** — re-derive parser from `_pseudo.md` (context-aware visiting with `createNestedContext`), replacing current `builder.ts`/`factory.ts` implementation.
- **Plan `first-constructs-slice`** — land the composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR corpus parses as proof), then `Tag` (critical path for projection classification).

## pending

1. **ARCH:** How are tags in prose (not in headings) currently handled? The factory detects tags on `text` nodes, but the builder attaches them to `section.tags`. What about tags in field values or natural blocks?
2. **ARCH:** `_pseudo.md` states "NaturalBlock is a transparent wrapper — copy ALL mdast node attributes" but the implementation only copies specific attributes. Does the TS declaration for `NaturalBlock` have all mdast node fields? Can we extend it and use `{ ...destruct }` or `{ ...assign }` to ensure everything is copied?

## BLOCKER

- None current.
