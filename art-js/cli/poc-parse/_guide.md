# Guide: Art JS POC Parse

POC spike of the artificials parser: a self-contained, CLI-executable package.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: project overview, layout, setup, verification.
- `$ROOT/_backlog/1-done/plan-poc-parse/plan.md` — archived POC plan; its attachments `attachments/_architect.md` and `attachments/_parking-lot.md` hold the briefing and WIP tracker.
- `_pseudo.md` — pseudo code for context-aware visiting.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan, implementation-instruction, delegation, and report definitions.
- `$WORKSPACE/.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `$WORKSPACE/.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `$WORKSPACE/.agents/domains/plans/templates/` — plan, instruction, and report templates.
- `$WORKSPACE/.agents/domains/engineering/_guide.md` — working agreements and agent modes.

## Repository Layout

```
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

This project's backlog has been archived; the completed plan lives at `$ROOT/_backlog/1-done/plan-poc-parse/plan.md` (with `_architect.md` and `_parking-lot.md` nested as attachments). Forward-looking work for the artificials parser now lives in the root `_backlog/` (`_architect.md`, `_parking-lot.md`) and the MD Art Roundtrip milestone at `$ROOT/_backlog/4-next/milestone-md-art-roundtrip/milestone.md`.
