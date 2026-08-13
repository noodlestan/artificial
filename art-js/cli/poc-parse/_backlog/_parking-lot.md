# Parking Lot: POC Parse

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **Plan `define-parser-builder-construct-layers`** — clean layer separation: remove construct-specific pollution from VisitContext, create ConstructPreProcessor contract, move tag detection to handler, inject everything into buildDocument via ParserConfig.

## pending

1. **ARCH:** Gap NaturalBlocks (`type: "text"`, `value: "\n\n"`) appear between sections. Should pure-whitespace gaps be filtered in a future iteration?
2. **ARCH:** `fieldBlockFactory` is exported but effectively dead code (field detection moves to pre-processor). Keep for API completeness or remove?
3. **ARCH:** Report file paths in instructions use `repos/artificial/_backlog/...` but actual path is `repos/artificial/art-js/cli/poc-parse/_backlog/...`. Should we standardize instruction paths?

## BLOCKER

- None current.
