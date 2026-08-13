# Parking Lot: POC Parse

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work), **FOLLOW-UPS** (not in scope). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **POC Step 5 — Cross-check against the grammar WIP (next):** enumerate gaps (grammar constructs the parser can't express yet).
- **POC Step 6 — Grammar spec fixes as the parser exercises it:** `FieldBlock` containment rules (terminator/content lists omit `SectionBlock` and nested `FieldBlock`); stale `type?` vs `kind` in `section-block.art` Schema block; clarify `NaturalBlock` as the catch-all (markdown not classified as art); tag placement reconciled with FieldBlock/ExampleBlock tag support. Summarise into `language.art` (Construct Containment and the NaturalBlock Catch-all).
- **POC Step 7 — First constructs to land:** the composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR corpus parses as proof), then `Tag` (critical path for projection classification).

## pending

1. Is the pseudo-code in `_pseudo.md` (context-aware visiting with `createNestedContext`) still the target architecture, or has the implementation in `builder.ts` (sectionStack/fieldStack approach) diverged intentionally?
2. The plan shows `first-constructs-vertical-slice` as DRAFT with no instructions file. What's the scope and priority for this next commit?
3. POC Step 6 (grammar spec fixes) is listed as ACTIONABLE, but commit `aaadf70` already landed grammar-spec-fixes. Is this step complete or are there remaining gaps?
4. The \_test.md defines 15 manual test cases using CLI. Is there an automated test suite, or should one be created as part of the POC?
5. How are tags in prose (not in headings) currently handled? The factory detects tags on `text` nodes, but the builder attaches them to `section.tags`. What about tags in field values or natural blocks?
6. The \_pseudo.md states "NaturalBlock is a transparent wrapper — copy ALL mdast node attributes" but the implementation only copies specific attributes (type, value, position, lang, meta, children). Is this intentional divergence or incomplete implementation?
7. What defines "POC complete" to unblock the reactive core (chokidar → signals → memo recompute)?
8. The plan mentions "MD Art Roundtrip" and "Split POC into packages" as next phases. What's the priority order and dependency chain?
9. The \_guide references `$WORKSPACE/.agents/domains/plans/` with workspace-relative paths. Where is `$WORKSPACE` defined and should these paths be resolved?
10. The grammar-spec-fixes commit modified `field-block.art`, `section-block.art`, `natural-block.art`, and `tag.art`. Are there other grammar constructs that need parser coverage before the vertical slice?

## BLOCKER

- None current.

## FOLLOW-UPS (not in scope)

- None current.
