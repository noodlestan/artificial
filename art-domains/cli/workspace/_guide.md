# Workspace CLI

The workspace CLI package (`@art-domains/workspace-cli`, binary `art-workspace`) orchestrates cross-repo work for the Noodlestan ecosystem. It clones repositories, branches across them, symlinks packages for local development, checks repository status, and publishes packages.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — the workspace CLI overview, plan workflow, and agent interactions.
- `_backlog/_parking-lot.md` — the current work-in-progress tracker with actionable items, pending work, blockers, and follow-ups.
- `_backlog/_architect.md` — the forward-looking architect plan with principles, NFRs, and follow-ups.
- `architecture/index.md` — How the workspace CLI is structured, how it works, and its use cases.
- `architecture/config.md` — The configuration system.
- `architecture/commands.md` — The command surface, procedures, and edge cases.
- `architecture/context-model.md` — Records and `WorkspaceContext`, `CheckoutStore`, `Checkout`.
- `architecture/operations-log.md` — How operations are logged.
- `architecture/reports.md` — How state and operation logs are presented.
- `architecture/_pseudo.md` — the CLI pseudo-code contract: data structures, use cases, and auxiliary functions.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan, implementation-instruction, delegation, and report definitions.
- `$WORKSPACE/.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `$WORKSPACE/.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `$WORKSPACE/.agents/domains/plans/templates/` — plan, instruction, and report templates.
- `$WORKSPACE/.agents/domains/engineering/_guide.md` — working agreements and agent modes.

## Repository Layout

```
_backlog/           — parking lot, briefings, plans, instructions, reports
architecture/       — architecture index, topic docs, and decision records (records/adr)
src/                — the CLI source (commands, config, shared, private)
_records/           — repository and checkout records (discovered by Workspace CLI)
```

## Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

## Verification

Run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

## Planning Workflow

This project plans its work with the plan workflow defined in `$WORKSPACE/.agents/domains/plans/index.md`.

The short-term focus is captured in `_backlog/_parking-lot.md` — actionable items, pending questions, blockers, and follow-ups (no done items).

The requirements, use cases, and principles are captured in `_backlog/_architect.md`, along with the forward-looking plan.

The backlog lives at `_backlog/` with subdirectories such as `/3-now` (implementation in progress) and `/4-next/` (planned work not yet started) containg plan records following the structure defined in `$WORKSPACE/.agents/domains/plans/structures/plan__structure.md`

## Delivery Workflow

Planning, delegation, and integration runs on the working agreements and agent modes defined in `$WORKSPACE/.agents/domains/engineering/_guide.md`.
