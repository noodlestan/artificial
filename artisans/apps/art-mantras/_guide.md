# Guide: Art Mantras

A micro app that generates mantras through a 12-step race.

## Recommended Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: project overview, layout, setup, verification.
- `_wip.md` — the parking lot and progress tracker — open actions, questions and blockers (no dones!).
- `_architect.md` — the architecture — Why, What, How, Follow-ups (no code).
- `_pseudo.md` — the function declarations — name, params, responsibility, pseudo code — entry point first, grouped by layer.

## Repository Layout

```
_backlog/           — plans, instructions, reports
src/                — application source
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
npm run build # to start the development server
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

## Deployment

See `_records/deployment.art` for deployment commands, environments, and infrastructure details.

## Records Management

Records are co-located with the resources they describe in `_records/` directories:

- **Project:** `_records/project.art`
- **Package:** `{package-path}/_records/package.art`
- **Deployment:** `{app-path}/_records/deployment.art`

Examples:

- `checkouts/artificial/_records/project.art`
- `checkouts/artificial/artisans/apps/art-mantras/_records/deployment.art`

## References

The workspace maintains an architecture reference at `architecture/index.md` and decision records at `architecture/records/adr`.

## Planning Workflow

This project plans its work with the plan workflow defined in `$WORKSPACE/.agents/domains/plans/`.

Each project manages its own backlog in a local `_backlog/` directory with a `_guide.md` entry point containing layout, references, verification, and workflows.

The short-term focus is captured in `_wip.md` — actionable items, pending questions, blockers, and follow-ups (no done items).

The requirements, use cases, and principles are captured in `_architect.md`, along with approach to work sequence, iterations, and milestones.

Delegation runs via `_backlog/plan-art-mantras/plan.md` and its instruction files.

**Reading order:** `_guide.md` → `_wip.md` → `_architect.md` → `_pseudo.md`
