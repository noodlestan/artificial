# Milestone: MD Art Roundtrip

**ID:** `md-art-roundtrip`

**Status:** `PLANNED`

## Summary

Migrate poc-parse into proper packages, verify lossless roundtrip (parse `.art` → serialize back → zero diffs), archive poc-parse, and publish v0.1.0. Each commit guarantees no source change breaks the roundtrip contract.

## Source Tasks

- `_backlog/_architect.md` — Architecture Briefing: Artificial
- `_backlog/1-done/plan-poc-parse/plan.md` — archived POC plan: learnings, findings, feedback; `attachments/_architect.md` + `attachments/_parking-lot.md` (POC briefing and WIP)

## Phase Plans

| Phase                   | Plan                                   | Status      |
| ----------------------- | -------------------------------------- | ----------- |
| 1 — Bootstrap packages  | `plan-bootstrap-packages/plan.md`      | `PREPARING` |
| 2 — Migrate and verify  | `plan-migrate-and-verify/plan.md`      | `PREPARING` |
| 3 — Archive and publish | `plan-archive-poc-and-publish/plan.md` | `PREPARING` |

## Packages

| Package                          | Path                      | Purpose                                                                             | Dependencies                     |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| `@art-js/artificials-primitives` | `art-js/libs/primitives/` | Core types: `Point`, `Position`, `RecordBase`, construct interfaces, `ConstructMap` | None                             |
| `@art-js/artificials-parser`     | `art-js/libs/parser/`     | Parser: `buildDocument`, factories, handlers, context                               | `@art-js/artificials-primitives` |
| `@art-js/artificials-serializer` | `art-js/libs/serializer/` | Serializer: artast → mdast → md — required for the roundtrip; finding from archived POC briefing, not yet scaffolded | `@art-js/artificials-primitives` |
| `@art-js/artificials-spec`       | `art-js/spec/`            | Grammar specs (`.art` files) — already exists                                       | `@art-js/artificials-primitives` |
| `@art-js/poc-parse`              | `art-js/cli/poc-parse/`   | CLI entry point — will be archived after migration                                  | `@art-js/artificials-parser`     |

## Findings (from archived POC plan)

Integrated from `_backlog/1-done/plan-poc-parse/` (plan.md, `attachments/_architect.md`, `attachments/_parking-lot.md`).

**Roundtrip fixture strategy** (from the archived POC briefing, MD Art Roundtrip milestone): use one art file `ops/records/packages/art-mantras.art` to parse and serialize back with zero diffs. Store the file's contents as a fixture in `@art-js/artificials-spec`; the parser package imports the fixture from there. All code unit tested.

**POC split design** (from the archived POC briefing): the POC was internally partitioned along the pipeline boundaries to mirror the future `art-js` modules — `libs/primitives` (types, type assertions), `libs/parser` (md → mdast → artast), `libs/serializer` (artast → mdast → md). The serializer is missing from the package plan above and is required for the roundtrip (phase 2).

## Open questions (from archived POC parking lot)

- Pure-whitespace gap `NaturalBlock`s (`type: "text"`, `value: "\n\n"`) appear between sections. Should gaps be filtered in a future iteration? — must be decided for the lossless roundtrip (filter consistently on both sides, or preserve).
- `fieldBlockFactory` is exported but effectively dead code (field detection moved to the pre-processor). Keep for API completeness or remove in the parser package?
- Remove `createNestedContext` injection from handler factories (no point injecting what's already available) — apply during migration; do not carry the injection into `@art-js/artificials-parser`.

## Documentation to produce

(WIP)

- `art-js/architecture/index.md` - artificials ecosystem core
- `art-js/architecture/components.md` - major components of the ecosystem (as opposed to layers)
- `art-js/architecture/lib/index.md` - libs: responsibilities, dependencies, build system, distribution, test strategy
- `art-js/architecture/cli/index.md` - clis: packages, responsibilities, dependencies, build system, distribution, test strategy
- move some ADRs from root `architecture/` to `art-js/libs/parser/`
- i.e. create `art-js/libs/parser/architecture` with index placeholder and some ADRs from root
- `architecture/` (index the other architecture indexes)

## Follow ups

- Reactive core (chokidar → signals → memo recompute)
- Template engine research (Nunjucks/Handlebars/Liquid vs `.tart` requirements)
- Precompiled rewrite (install-time compilation + per-project overrides)
- Standalone build of the compile command — `bin/compile`, `architecture/records/adr/compile.art`-backed (follow-up from the archived POC plan)
