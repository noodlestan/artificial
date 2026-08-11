# Noodlestan Artificial

A collection of tools and resources to generate and manage agent instructions. Includes the Art Language, and a (reactive) pipeline for bundling instructions.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — the artificials system overview, plan workflow, and agent interactions.
- `_backlog/_parking-lot.md` — the current work-in-progress tracker with actionable items, pending work, blockers, and follow-ups.
- `_backlog/_architect.md` — the forward-looking architect plan with approach, work sequence, and milestone steps.
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

This project plans its work with the plan workflow defined in `$WORKSPACE/.agents/domains/plans/`.

The short-term focus is captured in `_backlog/_parking-lot.md` – actionable items, pending questions, blockers, and follow-ups (no done items).

The requirements, use cases, and principles are captured in `_backlog/_architect.md`, along with approach to work sequence, iterations, and milestones.

The backlog lives at `_backlog/` with subdirectories such as `/3-now` (implementation in progress) and `/4-next/` (planned work not yet started).

## Delivery Workflow

Planning, delegation, and integration runs on the working agreements and agent modes defined in `$WORKSPACE/.agents/domains/engineering/_guide.md`.
