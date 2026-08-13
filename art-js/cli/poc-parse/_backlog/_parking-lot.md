# POC Parse WIP

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work), **FOLLOW-UPS** (not in scope). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **POC Step 5 — Cross-check against the grammar WIP (next):** enumerate gaps (grammar constructs the parser can't express yet).
- **POC Step 6 — Grammar spec fixes as the parser exercises it:** `FieldBlock` containment rules (terminator/content lists omit `SectionBlock` and nested `FieldBlock`); stale `type?` vs `kind` in `section-block.art` Schema block; clarify `NaturalBlock` as the catch-all (markdown not classified as art); tag placement reconciled with FieldBlock/ExampleBlock tag support. Summarise into `language.art` (Construct Containment and the NaturalBlock Catch-all).
- **POC Step 7 — First constructs to land:** the composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR corpus parses as proof), then `Tag` (critical path for projection classification).

## pending

- None current.

## BLOCKER

- None current.

## FOLLOW-UPS (not in scope)

- **Vertical slice** — parse `section-block.art` → extract → transform → render the Indexer projection; validation contract = conformance checklist (resource names, kinds, categories, descriptions, source paths, resolvable refs), asserted against output instead of a stored reference. Depends on the parser spike.
- **Projection generation pipeline** — bundler generating per-domain projections (Author, Generator, Operator, Indexer), each exposing the minimum context its consumers need. Precompiled-and-committed to be replaced by install-time compilation + per-project overrides (see `distribution.art`).
- **Pipeline implementation details** — target-variant content, build configuration (projection + resource-type/name → format rules), tag-based filtering (`#author`/`#generator`/`#operator`/`#indexer`), overloaded declaration resolution, transformations, format templates, render stage, full-pipeline wiring. See `_architect.md` for sequence.
