# Parking Lot: POC Parse

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **Plan next iteration** — remove `createNestedContext` injection from handler factories (no point injecting what's already available).

## pending

1. **ARCH:** Gap NaturalBlocks (`type: "text"`, `value: "\n\n"`) appear between sections. Should pure-whitespace gaps be filtered in a future iteration?
2. **ARCH:** `fieldBlockFactory` is exported but effectively dead code (field detection moves to pre-processor). Keep for API completeness or remove?
3. **ARCH:** Report file paths in instructions use `repos/artificial/_backlog/...` but actual path is `repos/artificial/art-js/cli/poc-parse/_backlog/...`. Should we standardize instruction paths?
4. Remove `createNestedContext` injection from handler factories (no point injecting what's already available).

## BLOCKER

- None current.
