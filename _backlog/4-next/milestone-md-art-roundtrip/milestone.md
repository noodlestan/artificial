# Milestone: MD Art Roundtrip

**ID:** `md-art-roundtrip`

**Status:** `PLANNED`

## Summary

Migrate poc-parse into proper packages, verify lossless roundtrip (parse `.art` → serialize back → zero diffs), archive poc-parse, and publish v0.1.0. Each commit guarantees no source change breaks the roundtrip contract.

## Source Tasks

- `_backlog/_architect.md` — Architecture Briefing: Artificial

## Phase Plans

| Phase                   | Plan                               | Status      |
| ----------------------- | ---------------------------------- | ----------- |
| 1 — Bootstrap packages  | `plan-bootstrap-packages/plan.md`  | `PREPARING` |
| 2 — Migrate and verify  | `plan-migrate-and-verify/plan.md`  | `PREPARING` |
| 3 — Archive and publish | `plan-archive-and-publish/plan.md` | `PREPARING` |

## Packages

| Package                          | Path                      | Purpose                                                                             | Dependencies                     |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| `@art-js/artificials-primitives` | `art-js/libs/primitives/` | Core types: `Point`, `Position`, `RecordBase`, construct interfaces, `ConstructMap` | None                             |
| `@art-js/artificials-parser`     | `art-js/libs/parser/`     | Parser: `buildDocument`, factories, handlers, context                               | `@art-js/artificials-primitives` |
| `@art-js/artificials-spec`       | `art-js/spec/`            | Grammar specs (`.art` files) — already exists                                       | `@art-js/artificials-primitives` |
| `@art-js/poc-parse`              | `art-js/cli/poc-parse/`   | CLI entry point — will be archived after migration                                  | `@art-js/artificials-parser`     |

## Documentation to produce

(WIP)

- `art-js/architecture/index.md` - artificials ecosystem core
- `art-js/architecture/components.md` - major components of the ecosystem (as opposed to layers)
- `art-js/architecture/lib/index.md` - libs: responsibilities, dependencies, build system, distribution, test strategey
- `art-js/architecture/cli/index.md` - clis: pacakges, responsibilities, dependencies, build system, distribution, test strategy
- move some ADRS from root to parsers `architecture/` to `art-js/lib/parser`
- i.e. create `art-js/lib/parser/architecture` with index placeholder and some ADRS from root
- `architecture/` (index the other architecture indexes)

## Follow ups

- Reactive core (chokidar → signals → memo recompute)
- Template engine research (Nunjucks/Handlebars/Liquid vs `.tart` requirements)
- Precompiled rewrite (install-time compilation + per-project overrides)
