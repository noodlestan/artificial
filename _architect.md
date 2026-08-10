# Artificials Plan

Forward-looking work for the artificials toolchain. Decisions live in the ADRs (`architecture/records/adr/`); this file tracks the work ahead only.

Short termtracker is `_wip.md` (no done items there).

## Approach

**POC-first.** A single self-contained, CLI-executable `poc-parse` package at `art-js/cli/poc-parse/` (`@art-js/poc-parse`), internally partitioned along the pipeline boundaries (`parse/`, `extract/`, `transform/`, `render/`) so it mirrors the future `art-js` modules. The parse slice is exercised first; extract/transform/render land with the vertical slice. Deliberately non-reactive: no signals, no chokidar yet — reactivity and watching come after the POC proves the pipeline content. The split into packaged modules happens after the POC, not before.

**Schema-first, in TS.** The core record schema (what a construct is: kind, name, fields, children) is defined as composable TS types — the parser's output contract. The ouroboros dissolves in JS land: TS types are the metalanguage (ground truth for the parser); the `.art` spec files are the object language (domain descriptions), caught up later and verified by the (unimplemented) bootstrap check. Core schema in TS now; domain schemas in `.art` later.

**Micromark substrate.** Parsing builds directly on micromark — the same extension base GFM, MDX, and directives use — with our own thin extension (enter/exit hooks per token type) and an explicit construct stack. The parser emits art's own AST records (`SectionBlock`, `FieldBlock`, `NaturalBlock`, `ExampleBlock`, `Tag`), not mdast: no unist-util-visit, no remark/unified packages. Unified's extension-trio pattern (syntax extension, record types, renderer support) is mirrored when language plugins land. Whether the parse slice consumes micromark directly or declares indirections (e.g. `mdast-util-from-markdown`) is a spike decision; the research framing it is `architecture/records/adr/_research.md`.

## Work ahead

### Step 0 — Best-practices research (done 2026-08-08)

Surveyed projects doing "similar things" on top of micromark and extracted the best practices that shape the spike. Captured in `architecture/records/adr/_research.md`. Key takeaways:

- Two-layer design: micromark owns syntax (tokens), a `from-markdown`-style stage owns semantics (records).
- Construct-stack record builder (enter/exit hooks per token type + explicit stack) is the established pattern.
- 4-part extension anatomy (syntax, HTML/rendering, from-markdown, to-markdown); the POC ships syntax (if any) + from-markdown only.
- Open registries + derived unions (mdast `RootContentMap`); position metadata on every record.
- Early insight: `# Kind: Name` is plain ATX markdown, so the composing trio is likely a semantic-stage concern, not a custom micromark construct. Tag is the custom-syntax candidate.

### Step 1 — Scaffold the `poc-parse` package (done 2026-08-08, commit `ea047db0`)

**Goal:** a runnable, self-contained CLI package named `@art-js/poc-parse` at `art-js/cli/poc-parse/`.

- Register the package in `records/packages/artificials-poc-parse.art` (Path `cli/poc-parse/`, Canonical Name `@art-js/poc-parse`, Version `0.0.1`, scaffolders: Scaffolder Skeleton: CLI Package + Scaffolder Skeleton: Package Common).
- Scaffold `art-js/cli/poc-parse/` per repo conventions — the `skeleton-cli` shape (package.json, tsconfig variants, README), matching sibling CLI packages like `art-js/cli/bin/`.
- Add the workspace entry `art-js/cli/poc-parse/` to the `workspaces` array in `artificials/package.json` (the module-root package.json that owns the art-js workspaces; the repo-root `package.json` does not include art-js). Run `npm install` in `artificials/` to register it.
- **Verification:** `npm run dev` in the package dir prints the welcome banner and exits 0.
- **Deliberately deferred:** micromark vs indirections, the record schema, any parsing logic. The substrate choice belongs to Step 3+ (see `_research.md` open questions).

### Step 2 — Core record schema as composable TS types

**Goal:** the parser's output contract, before any parsing.

- Recursive discriminated union on `construct` (e.g. `SectionBlock`, `FieldBlock`, `NaturalBlock`); extensible via open per-position registries (`BlockConstructMap`, `InlineConstructMap`) + declaration merging, mirroring mdast's `RootContentMap` pattern.
- Records carry source position metadata; depth and parent are derived from the tree, not stored.
- Schema-first: TS types are the metalanguage ground truth for the parser; the `.art` spec files are the object language, caught up later by the bootstrap check.

### Step 3 — Smoke-parse the corpus through micromark

**Goal:** prove the token stream supports the grammar, before building the record builder.

- Parse the corpus — 6 ADR files + one spec file — through micromark and inspect the token event stream.
- Confirm `**Field:**` (incl. block fields), `::READ`, `#tags`, code fences tokenize as expected.
- Record findings; they feed Step 4 and settle the substrate decision (micromark direct vs indirections).

### Step 4 — Construct-stack record builder

**Goal:** schema-typed records from the token stream.

- micromark extension (enter/exit hooks per token type + explicit stack) producing schema-typed records.
- **Proof:** the ADR corpus parses into `SectionBlock` / `FieldBlock` / `NaturalBlock` records.

### Step 5 — Cross-check against the grammar WIP

**Goal:** enumerate gaps — grammar constructs the parser can't express yet. Output is the gap list that Step 6 consumes.

### Step 6 — Grammar spec fixes as the parser exercises it

**Goal:** reconcile the spec with the parser, feeding findings back into `art-js/spec`.

- `FieldBlock` containment rules (terminator/content lists omit `SectionBlock` and nested `FieldBlock`).
- Stale `type?` vs `kind` in `section-block.art` Schema block.
- Clarify `NaturalBlock` as the catch-all (markdown not classified as art).
- Tag placement reconciled with FieldBlock/ExampleBlock tag support.
- Summarise into `language.art` (Construct Containment and the NaturalBlock Catch-all).

### Step 7 — First constructs to land

- The composing trio `SectionBlock` + `FieldBlock` + `NaturalBlock` (the ADR corpus parses as proof), then `Tag` (critical path for projection classification).

### Vertical slice (next)

One package: parse `section-block.art` → extract → transform → render the Indexer projection. Starts by drafting the validation contract — a conformance checklist for Indexer output (resource names, kinds, categories, descriptions, source paths, resolvable refs) derived from the projection taxonomy, asserted against the output instead of a stored reference. Must exercise the shared grammar machinery (module, construct, field blocks, rules, syntax, examples).

### Reactive core (deferred)

chokidar → signals → memo recompute. Only relevant once re-compile-on-change is needed (watcher, dev-server). Finalises **SolidJS Signals** and **Watcher Based on Chokidar**.

### Template engine research (parallel)

Evaluate Nunjucks / Handlebars / Liquid against the `.tart` requirements; define the pre-pass (natural-language directives → plugin syntax) and post-pass (agent processes natural language) boundary. Finalises **Create an accessory Template Language**.

### Precompiled rewrite (after POC)

Replace **Projections Precompiled and Committed** with install-time compilation + per-project overrides, using render-cost evidence from the POC. Updates `distribution.art`.
