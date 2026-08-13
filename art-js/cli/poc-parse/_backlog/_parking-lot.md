# Parking Lot: POC Parse

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **Plan `abstract-builder`** — rename `visitChildren` → `shouldVisit`, restructure `visitNode` with `maybeHandleFactory`, rename `visitParagraph` → `handleBlock`, extract `handleNaturalBlock`, move field detection into `VisitContext.detectField()`.
- **Plan `first-constructs-slice`** — land the composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR parses as proof), then `Tag` (critical path for projection classification).

## pending

1. **ARCH:** Gap NaturalBlocks (`type: "text"`, `value: "\n\n"`) appear between sections. Should pure-whitespace gaps be filtered in a future iteration?
2. **ARCH:** `fieldBlockFactory` is exported but effectively dead code (paragraphs handled by `handleBlock` before `getFactory`). Keep for API completeness or remove?
3. **ARCH:** Report file paths in instructions use `repos/artificial/_backlog/...` but actual path is `repos/artificial/art-js/cli/poc-parse/_backlog/...`. Should we standardize instruction paths?

## BLOCKER

- None current.
