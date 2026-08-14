# Architecture Briefing: POC Parse

Forward-looking work for the artificials parser POC. Decisions live in the ADRs (`architecture/records/adr/`); this file tracks the work ahead only.

## Approach

**POC-first.** A single self-contained, CLI-executable `poc-parse` package at `art-js/cli/poc-parse/` (`@art-js/poc-parse`), internally partitioned along the pipeline boundaries (`parse/`, `extract/`, `transform/`, `render/`) so it mirrors the future `art-js` modules. The parse slice is exercised first; extract/transform/render land with the vertical slice. Deliberately non-reactive: no signals, no chokidar yet — reactivity and watching come after the POC proves the pipeline content. The split into packaged modules happens after the POC, not before.

**Schema-first, in TS.** The core record schema (what a construct is: kind, name, fields, children) is defined as composable TS types — the parser's output contract. The ouroboros dissolves in JS land: TS types are the metalanguage (ground truth for the parser); the `.art` spec files are the object language (domain descriptions), caught up later and verified by the (unimplemented) bootstrap check. Core schema in TS now; domain schemas in `.art` later.

**mdast substrate.** Parsing builds on mdast — the AST layer of the unified ecosystem — using `mdast-util-from-markdown` to parse markdown into typed nodes, then a factory-based visitor to classify nodes into art records (`SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`). The factory pattern separates detection (does this node qualify?) from construction (create the record) from visitation (should we recurse into children?). We own semantics at the mdast layer. See `architecture/records/adr/mdast-based.art`.

## Milestones

### POC Parse

- `_backlog/plan-poc-parse/plan.md` - WORKING

**Next iteration:** `define-parser-builder-construct-layers` — clean layer separation, injectable entry point, define construct contracts.

**After that:** Pre-roundtrip (parse one art file, verify output structure matches expectations).

### MD Art Roundtrip

Use one art file `ops/records/packages/art-mantras.art` to parse and serialize back with zero diffs. All code unit tested. Use contents of file as fixture stored in spec package, parser package needs to import from there.

### Split POC into packages

- libs/primitives for types, type assertions
- libs/parser - md => mdast => artast
- libs/serializer - artast => mdast => md
