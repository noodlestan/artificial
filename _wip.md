# Artificials WIP

WIP tracker, structured like the session parking lot: **ACTIONABLE** (in progress now), **pending** (waiting), **BLOCKER** (blocking work), **FOLLOW-UPS** (not in scope). Decisions live in the ADRs (`architecture/records/adr/`); the work sequence lives in `_architect.md`.

## ACTIONABLE

- **POC Step 1 — Scaffold `cli/poc-parse` (done, commit `ea047db0`):** `@art-js/poc-parse` v0.0.1 CLI at `art-js/cli/poc-parse/`; record registered in `records/packages/artificials-poc-parse.art`; workspace entry `art-js/cli/poc-parse/` in `artificials/package.json` (module-root package.json, not repo-root); `npm run dev` prints banner, exit 0. Report: `_backlog/plan-poc-parse/instructions/scaffold-poc-parse__report.md` (feedback F1–F5, none blocking).
- **POC Step 1 — scripts/deps (from delegation F3):** `cli/poc-parse` package.json ships `dev` plus Common Scripts minus `ci` (no `build` yet — build/deps deferred). `lint` (`tsc --noEmit`) needs `@types/node` (Cli Development dep set); install dev deps when the package's lint/CI is first exercised (POC step 4+).
- **POC Step 2 — Core record schema (next):** author composable TS types in `cli/poc-parse` per ecosystem best-practices (`_research.md`) — discriminated union on `construct`, open per-position registries with derived unions (mdast `RootContentMap` pattern), position metadata, derive depth/parent from tree. Schema-first: TS is the metalanguage ground truth; the `.art` spec is the object language, reconciled later by the bootstrap check.
- **POC Step 3 — Smoke-parse the corpus through micromark:** 6 ADR files + one spec file; inspect the token event stream; confirm `**Field:**` (incl. block fields), `::READ`, `#tags`, code fences tokenize as expected.
- **POC Step 4 — Construct-stack record builder:** micromark extension (enter/exit hooks per token type + explicit stack) producing schema-typed records.
- **POC Step 5 — Cross-check against the grammar WIP:** enumerate gaps (grammar constructs the parser can't express yet).
- **POC Step 6 — Grammar spec fixes as the parser exercises it:** `FieldBlock` containment rules (terminator/content lists omit `SectionBlock` and nested `FieldBlock`); stale `type?` vs `kind` in `section-block.art` Schema block; clarify `NaturalBlock` as the catch-all (markdown not classified as art); tag placement reconciled with FieldBlock/ExampleBlock tag support. Summarise into `language.art` (Construct Containment and the NaturalBlock Catch-all).
- **POC Step 7 — First constructs to land:** the composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR corpus parses as proof), then `Tag` (critical path for projection classification).

## pending

- **Entry point spec** — define what an entry point is, how it is declared and selected for a compilation run, and what it resolves to. Anchors the vertical slice: output is validated against the entry point spec, not against a stored reference output.
- **Spec artificials.config** — `.artificials.config.mts` as the project source of truth: namespaces, packages, domains, and projection targets. `art init` writes it; `art update` reads it. See ADR `configuration.art`.
- **Primitive spec: valueType, value, and per-projection forms** — candidate directions undecided: (1) strip primitives to `valueType` + `value` and formalise the TS code-block expression; (2) remove `valueType`/`value` until the parser can bootstrap the expression form; (3) resolve the `art` overload question first (if `art` is the source-code expression, it is not a projection). Legacy `#### Art / Generation / Interpretation` sections in `primitives/*.art` are pre-projection-era dead prototypes.
- **Spec templates and files** — `art-js/spec/_wip.md` has `### Template <!-- WIP -->` and `### File <!-- WIP -->`.
- **Grammar constructs WIP** — from `art-js/spec/grammar/_wip.md`: Procedure, Procedure Block, Workflow, Directives, Semantics, and Artificial Meta-Syntax.
- **Spec modules** — from `art-js/spec/modules/_wip.md`: module Dependencies (mandatory-reading sections) and Declarations (resources, routines).
- **Spec routines reference** — from `art-js/spec/routines/_wip.md`: Reference section (Processing Input, Invoking Commands/Routines/Templates, General Statement Rules, Rules for Formatting Statements).
- **TagReference** — WIP in `expressions/tag.art`: backticked `#<identifier>` reference for use in instructions.
- **Bootstrap verification** — the consistency check (`ValueType: Primitive` self-description, `art-js/spec/README.md` Phase 6) is not implemented.

## BLOCKER

- None current. The grammar spec gaps (`%meta`) were the blocker; now fixed. The parser spike unblocks the vertical slice.

## FOLLOW-UPS (not in scope)

- **Art init bootstrap** — marker-delimited AGENTS.md section (`<!-- ::ART-BOOTSTRAP:START/END -->`) + `.agents/` skeleton; `art init` / `npx art-init` inserts it non-destructively (idempotent). See ADR `installation.art`.
- **Update commands** — consolidate `update-domains`, `update-skills`, `update-agents` into a single deterministic `art update` in `cli/tools`.
- **Vertical slice** — parse `section-block.art` → extract → transform → render the Indexer projection; validation contract = conformance checklist (resource names, kinds, categories, descriptions, source paths, resolvable refs), asserted against output instead of a stored reference. Depends on the parser spike.
- **Projection generation pipeline** — bundler generating per-domain projections (Author, Generator, Operator, Indexer), each exposing the minimum context its consumers need. Precompiled-and-committed to be replaced by install-time compilation + per-project overrides (see `distribution.art`).
- **Pipeline implementation details** — target-variant content, build configuration (projection + resource-type/name → format rules), tag-based filtering (`#author`/`#generator`/`#operator`/`#indexer`), overloaded declaration resolution, transformations, format templates, render stage, full-pipeline wiring. See `_architect.md` for sequence.
- **Artificial tasks domain package** — `@artificial/tasks`: `src/*.art` records + precompiled projections + `skills/` + `agents/`; first real domain packaged with the pipeline.
- **Developer dependencies field** — add `dependencies` to Structure: Project and Structure: Package; create Dependency + Dependency Group types.
- **Primitive spec cleanup** — legacy `#### Art: Inline/Block`, `#### Generation`, `#### Interpretation` sections in `primitives/*.art` (pre-projection era).
