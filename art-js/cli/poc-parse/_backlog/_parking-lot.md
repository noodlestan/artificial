# Parking Lot: POC Parse

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **Plan `refine-parse-factories`** — rename `close()` → `parent()`, `findParentSection()` → `findTagable()`, refactor `buildDocument` to inject construct-specific logic via contract.
- **Plan `first-constructs-slice`** — land the composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR corpus parses as proof), then `Tag` (critical path for projection classification).

## pending

1. **ARCH:** Gap NaturalBlocks (`type: "text"`, `value: "\n\n"`) appear between sections. Should pure-whitespace gaps be filtered in a future iteration?
2. **ARCH:** `fieldBlockFactory` is exported but effectively dead code (paragraphs handled by `visitParagraph` before `getFactory`). Keep for API completeness or remove?

## BLOCKER

- None current.
