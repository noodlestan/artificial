# Milestone: MD Art Roundtrip

**ID:** `md-art-roundtrip`

**Status:** `PREPARING`

## Summary

Singularize the accidental `@art-js/artificials-*` plural package names (phase 0), migrate poc-parse into proper packages, migrate the testing fixtures, verify lossless roundtrip (parse `.art` → serialize back → zero diffs), refine whitespace handling (pure-whitespace gaps preserved), archive poc-parse, and publish v0.0.1. Each commit guarantees no source change breaks the roundtrip contract.

## Source Tasks

- `_backlog/_architect.md` — Architecture Briefing: Artificial
- `_backlog/1-done/plan-poc-parse/plan.md` — archived POC plan: learnings, findings, feedback; `attachments/_architect.md` + `attachments/_parking-lot.md` (POC briefing and WIP)

## Phase Plans

| Phase                          | Plan                                        | Status      |
| ------------------------------ | ------------------------------------------- | ----------- |
| 0 — Rename packages            | `plan-rename-packages/plan.md`              | `READY`     |
| 1 — Bootstrap packages         | `plan-bootstrap-packages/plan.md`           | `READY`     |
| 2 — Migrate testing fixtures   | `plan-migrate-testing-fixtures/plan.md`     | `READY`     |
| 3 — Migrate and verify         | `plan-migrate-and-verify/plan.md`           | `PREPARING` |
| 4 — Implement constructs       | `plan-implement-constructs/plan.md`         | `PREPARING` |
| 5 — Implement serializer       | `plan-implement-serializer/plan.md`         | `PREPARING` |
| 6 — Migrate tests to pipeline  | `plan-migrate-tests-pipeline/plan.md`       | `PREPARING` |
| 7 — Create knowledge resources | `plan-create-knowledge-resources/plan.md`   | `PREPARING` |
| 8 — Implement gaps             | `plan-implement-gaps/plan.md`               | `PREPARING` |
| 9 — Refactoring and Test Coverage | `plan-refactoring-and-test-coverage/plan.md` | `PREPARING` |
| 10 — Archive and publish       | `plan-archive-poc-and-publish/plan.md`      | `PREPARING` |
| 11 — Integrate knowledge       | `plan-integrate-knowledge/plan.md`          | `PREPARING` |

## Packages

| Package                          | Path                      | Purpose                                                                             | Dependencies                     |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| `@art-js/artificial-primitives` | `art-js/libs/primitives/` | Core types: `Point`, `Position`, `RecordBase`, construct interfaces, `ConstructMap` | None                             |
| `@art-js/artificial-parser`     | `art-js/libs/parser/`     | Parser: `buildDocument`, factories, handlers, context                               | `@art-js/artificial-primitives` |
| `@art-js/artificial-serializer` | `art-js/libs/serializer/` | Serializer: artast → mdast → md — bootstrapped in phase 5 (implement serializer); required for the roundtrip; finding from archived POC briefing | `@art-js/artificial-primitives`, `@art-js/artificial-constructs` |
| `@art-js/artificial-constructs` | `art-js/libs/constructs/` | Construct factories (blocks, fields, sections, `NaturalBlock`) migrated from the parser; consumed by parser and serializer | `@art-js/artificial-primitives` |
| `@art-js/artificial-spec`       | `art-js/spec/`            | Grammar specs (`.art` files) — already exists                                       | `@art-js/artificial-primitives` |
| `@art-js/pipeline-test-cli`     | `art-js/cli/pipeline-tests/` | Test harness CLI exercising the parser + serializer pipeline; `scripts/roundtrip.ts` + `fixtures/roundtrip/` | `@art-js/artificial-parser`, `@art-js/artificial-serializer` |
| `@art-js/poc-parse`              | `art-js/cli/poc-parse/`   | CLI entry point — will be archived after migration                                  | `@art-js/artificial-parser`     |

## Findings (from archived POC plan)

Integrated from `_backlog/1-done/plan-poc-parse/` (plan.md, `attachments/_architect.md`, `attachments/_parking-lot.md`).

**Roundtrip fixture strategy** (from the archived POC briefing, MD Art Roundtrip milestone): use one art file `ops/records/packages/art-mantras.art` to parse and serialize back with zero diffs. Store the file's contents as a fixture in `@art-js/artificial-spec`; the parser package imports the fixture from there. All code unit tested.

**POC split design** (from the archived POC briefing): the POC was internally partitioned along the pipeline boundaries to mirror the future `art-js` modules — `libs/primitives` (types, type assertions), `libs/parser` (md → mdast → artast), `libs/serializer` (artast → mdast → md). The serializer is missing from the package plan above and is required for the roundtrip (phase 5).

## Decisions (from archived POC parking lot)

Answered during planning; recorded as decisions, no longer open questions:

- Pure-whitespace gap `NaturalBlock`s (`type: "text"`, `value: "\n\n"`): **preserve** — no filtering. Logic that affects JSON output only changes after the verified migration (after phase 3); gap handling is refined reactively in phase 8.
- `createNestedContext` injection in handler factories: **eliminate** during migration — do not carry it into `@art-js/artificial-parser`.
- Dead `fieldBlockFactory` export: **not kept** — likely introduced later if needed.
- Fixture snapshot diffing (the runner only asserts parse success; one input lacks a snapshot): handled in phase 5 (implement serializer) — fixture tests become two-way (`source.md → art.json` and `art.json → parsed.md`, diffing `source.md` against `parsed.md`, counted as overhead).

## Documentation to produce

(WIP)

- `art-js/architecture/index.md` - artificial ecosystem core
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
