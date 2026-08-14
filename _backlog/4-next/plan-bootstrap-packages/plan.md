# Plan: Bootstrap Packages

**ID:** `bootstrap-packages`

**Status:** `PLANNED`

**Milestone:** `md-art-roundtrip`

**Phase:** 1

## Summary

Bootstrap `@art-js/artificials-primitives` (types only) and `@art-js/artificials-parser` (parser + builder + context) packages. Migrate core types and parser code from poc-parse. Verify lint and build pass.

## Source Tasks

Milestone planning.

- `art-js/cli/poc-parse/_backlog/plan-poc-parse/plan.md` — POC learnings and current state

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

## Packages

| Package                          | Path                      | Purpose                    | Dependencies                     |
| -------------------------------- | ------------------------- | -------------------------- | -------------------------------- |
| `@art-js/artificials-primitives` | `art-js/libs/primitives/` | Core types                 | None                             |
| `@art-js/artificials-parser`     | `art-js/libs/parser/`     | Parser + builder + context | `@art-js/artificials-primitives` |

## Commits

#### `bootstrap-primitives` - `PLANNED`

**Commit Message:** `art-js: bootstrap primitives package with core types`

**Instructions File:** `_backlog/4-next/plan-bootstrap-packages/instructions/bootstrap-primitives.md`

**Scope:**

- Migrate types from `poc-parse/src/parse/types.ts` to `art-js/libs/primitives/src/`
- Create entry point `src/index.ts` re-exporting all types
- Verify: `npm run lint`, `npm run build`, `npm run test` (placeholder)
- Add `@art-js/artificials-primitives` as dependency to poc-parse

#### `bootstrap-parser` - `PLANNED`

**Commit Message:** `art-js: bootstrap parser package with migrated parser`

**Instructions File:** `_backlog/4-next/plan-bootstrap-packages/instructions/bootstrap-parser.md`

**Scope:**

- Migrate `factory.ts`, `builder.ts` from `poc-parse/src/parse/` to `art-js/libs/parser/src/`
- Update imports to use `@art-js/artificials-primitives`
- Create entry point `src/index.ts` re-exporting public API
- Verify: `npm run lint`, `npm run build`, `npm run test` (placeholder)
- Update poc-parse to import from `@art-js/artificials-parser`
