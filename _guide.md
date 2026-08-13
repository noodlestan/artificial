# Noodlestan Artificial

A collection of tools and resources to generate and manage agent instructions. Includes the Art Language, and a (reactive) pipeline for bundling instructions.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: system overview, layout, setup, verification.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan, implementation-instruction, delegation, and report definitions.
- `$WORKSPACE/.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `$WORKSPACE/.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `$WORKSPACE/.agents/domains/plans/templates/` — plan, instruction, and report templates.
- `$WORKSPACE/.agents/domains/engineering/_guide.md` — working agreements and agent modes.

## Repository Layout

```
_backlog/           — plans, instructions, reports
ops/                — records (packages, namespaces, scripts)
architecture/       — ADRs, index
art-js/             — (namespace) parser, CLI, spec
art-domains/        — (namespace) domain packages
artisans/           — (namespace) experiments
```

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

The workspace maintains ops records at `ops/records` detailing project configurations, namespaces, packages, dependencies, scaffolding and more.

## References

The workspace maintains an architecture reference at `architecture/index.md` and decision records at `architecture/records/adr`.

## Planning Workflow

Each project manages its own backlog in a local `_backlog/` directory with a `_guide.md` entry point containing layout, references, verification, and workflows.
