# Architecture Briefing: Artificial

Forward-looking work for the artificials toolchain. Decisions live in the ADRs (`architecture/records/adr/`); this file tracks the work ahead only.

Short termtracker is `_parking-lot.md` (no done items there).

## Approach

**POC-first.** A single self-contained, CLI-executable `poc-parse` package at `art-js/cli/poc-parse/` (`@art-js/poc-parse`), internally partitioned along the pipeline boundaries (`parse/`, `extract/`, `transform/`, `render/`) so it mirrors the future `art-js` modules. The parse slice is exercised first; extract/transform/render land with the vertical slice. Deliberately non-reactive: no signals, no chokidar yet — reactivity and watching come after the POC proves the pipeline content. The split into packaged modules happens after the POC, not before.

**Schema-first, in TS.** The core record schema (what a construct is: kind, name, fields, children) is defined as composable TS types — the parser's output contract. The ouroboros dissolves in JS land: TS types are the metalanguage (ground truth for the parser); the `.art` spec files are the object language (domain descriptions), caught up later and verified by the (unimplemented) bootstrap check. Core schema in TS now; domain schemas in `.art` later.

**mdast substrate.** Parsing builds on mdast — the AST layer of the unified ecosystem — using `mdast-util-from-markdown` to parse markdown into typed nodes, then a factory-based visitor to classify nodes into art records (`SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`). The factory pattern separates detection (does this node qualify?) from construction (create the record) from visitation (should we recurse into children?). We own semantics at the mdast layer. See `architecture/records/adr/mdast-based.art`.

## Milestones

### POC Parse

- `art-js/cli/poc-parse/_guide.md` — POC spike of the artificials parser

### MD Art Roundtrip

Migrate poc-parse into proper packages (`primitives`, `parser`), verify lossless roundtrip (parse `.art` → serialize back → zero diffs), archive poc-parse, and publish v0.1.0. Each commit guarantees no source change breaks the roundtrip contract. Test harnesses: fixtures in `spec/`, automation to detect diffs in `.art.json` files.

- Milestone: `_backlog/4-next/plan-md-art-roundtrip/milestone-md-art-roundtrip.md`

### Reactive core (deferred)

chokidar → signals → memo recompute. Only relevant once re-compile-on-change is needed (watcher, dev-server). Finalises **SolidJS Signals** and **Watcher Based on Chokidar**.

### Template engine research (parallel)

Evaluate Nunjucks / Handlebars / Liquid against the `.tart` requirements; define the pre-pass (natural-language directives → plugin syntax) and post-pass (agent processes natural language) boundary. Finalises **Create an accessory Template Language**.

### Precompiled rewrite (after POC)

Replace **Projections Precompiled and Committed** with install-time compilation + per-project overrides, using render-cost evidence from the POC. Updates `distribution.art`.
