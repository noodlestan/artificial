# Plan: Migrate and Verify

**ID:** `migrate-and-verify`

**Status:** `PLANNED`

**Milestone:** `md-art-roundtrip`

**Phase:** 2

## Summary

Migrate all parser code to packages. Verify lossless roundtrip: parse `.art` → serialize back → zero diffs. Add unit tests for factories and handlers.

## Source Tasks

Milestone planning.

## Mandatory Reading

For the delegator (execution mechanics):

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `.agents/skills/execute-plan/SKILL.md` — how this plan is executed by delegation.

For the delegatee (shared context; per-step context is in each instruction file):

- `_backlog/_architect.md` — approach and milestones.
- `art-js/cli/poc-parse/_pseudo.md` — parser architecture (source of truth).
- `art-js/cli/poc-parse/src/parse/` — current POC implementation to migrate.

## Commits

#### `migrate-parser-code` - `PLANNED`

**Commit Message:** `art-js: migrate all parser code to packages`

**Instructions File:** `_backlog/4-next/plan-migrate-and-verify/instructions/migrate-parser-code.md`

**Scope:**

- Move all parser logic to `@art-js/artificials-parser`
- Move fixtures to parser package test directory
- Create unit tests for each factory and handler
- Verify: `npm run test` passes in parser package
- poc-parse becomes thin CLI wrapper

#### `roundtrip-verification` - `PLANNED`

**Commit Message:** `art-js: verify MD Art roundtrip`

**Instructions File:** `_backlog/4-next/plan-migrate-and-verify/instructions/roundtrip-verification.md`

**Scope:**

- Parse `ops/records/packages/art-mantras.art` → artast
- Serialize artast → markdown
- Assert zero diffs
- Add roundtrip test to parser package
- Verify: `npm run test` passes
