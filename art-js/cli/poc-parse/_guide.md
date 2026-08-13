# Guide: Art JS POC Parse

POC spike of the artificials parser: a self-contained, CLI-executable package.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: project overview, layout, setup, verification.
- `_backlog/_parking-lot.md` — current work-in-progress tracker with actionable items, pending work, blockers, and follow-ups.
- `_backlog/_architect.md` — forward-looking architect plan with approach, work sequence, and milestone steps.
- `_pseudo.md` — pseudo code for context-aware visiting.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan, implementation-instruction, delegation, and report definitions.
- `$WORKSPACE/.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `$WORKSPACE/.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `$WORKSPACE/.agents/domains/plans/templates/` — plan, instruction, and report templates.
- `$WORKSPACE/.agents/domains/engineering/_guide.md` — working agreements and agent modes.

## Repository Layout

```
_backlog/           — plans, instructions, reports
src/                — parser source code
fixtures/           — test fixtures
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

## References

The project maintains an architecture reference at `../../../architecture/index.md` and decision records at `../../../architecture/records/adr`.

## Planning Workflow

This project plans its work with the plan workflow defined in `$WORKSPACE/.agents/domains/plans/`.

This project manages its own backlog in a local `_backlog/`.

The short-term focus is captured in `_backlog/_parking-lot.md` – actionable items, pending questions, blockers, and follow-ups (no done items).

The requirements, use cases, and principles are captured in `_backlog/_architect.md`, along with approach to work sequence, iterations, and milestones.
