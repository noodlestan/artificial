# Noodlestan Artificial

A collection of tools and resources to generate and manage agent instructions. Includes the Art Language, and a (reactive) pipeline for bundling instructions.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: system overview, layout, setup, verification.
- `_backlog/_parking-lot.md` — current work-in-progress tracker with actionable items, pending work, blockers, and follow-ups.
- `_backlog/_architect.md` — forward-looking architect plan with approach, work sequence, and milestone steps.

## Repository Layout

```
_backlog/           — plans, instructions, reports
ops/                — records (packages, namespaces, scripts)
architecture/       — ADRs, index
art-js/             — (namespace) parser, CLI, spec
art-domains/        — (namespace) domain packages
artisans/           — (namespace) experiments
```

## Projects

| Project            | Guide                                 | Backlog                                      |
| ------------------ | ------------------------------------- | -------------------------------------------- |
| Artificials (root) | `_guide.md`                           | `_backlog/`                                  |
| POC Parse          | `art-js/cli/poc-parse/_guide.md`      | `_backlog/1-done/plan-poc-parse/` (archived) |
| Art Mantras        | `artisans/apps/art-mantras/_guide.md` | `artisans/apps/art-mantras/_backlog/`        |
| Workspace CLI      | `art-domains/cli/workspace/_guide.md` | `art-domains/cli/workspace/_backlog/`        |

## Setup

Run at root of repository, not per package:

```bash
npm ci # to install dependencies.
```

## Verification

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues
npm run build
npm run test
```

## Records Management

This repository maintains ops records at `ops/records` detailing project configurations, namespaces, packages, dependencies, scaffolding and more.

## References

This repository maintains an architecture reference at `architecture/index.md` and decision records at `architecture/records/adr`.

## Planning Workflow

Each project manages its own backlog in a local `_backlog/` directory with a `_guide.md` entry point containing layout, references, verification, and workflows.
