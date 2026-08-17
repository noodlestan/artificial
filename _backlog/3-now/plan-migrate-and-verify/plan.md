# Plan: Migrate and Verify

**ID:** `migrate-and-verify`

**Status:** `READY`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Migrate all parser code to `@art-js/artificial-parser` and verify md → art.json behaves exactly like the POC against the migrated fixture snapshots, adding minimum viable test coverage as soon as the structure of directories, types, and factories is stable. Executed within the Artificial repository (`repos/artificial`) as phase 3 of the MD Art Roundtrip milestone. Decisions applied during migration: eliminate `createNestedContext` injection; do not keep the dead `fieldBlockFactory` export. Serializer bootstrap and roundtrip verification are NOT in this plan — they moved to phases 5 and 6.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: factory extraction into a dedicated package, addressed by the constructs implementation in phase 4 (`plan-implement-constructs`).
- Out of scope: serializer bootstrap and two-way fixture tests, addressed in phase 5 (`plan-implement-serializer`).
- Out of scope: pipeline test suite and roundtrip fixtures, addressed in phase 6 (`plan-migrate-tests-pipeline`).
- Out of scope: roundtrip gap refinements (whitespace gaps preserved), addressed reactively in phase 8 (`plan-implement-gaps`).
- Out of scope: archive and publish, addressed in phase 10 (`plan-archive-poc-and-publish`).

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Primitives – Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art`; located at `art-js/libs/primitives/`.
- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/`.
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 3; package table; Decisions section (eliminate `createNestedContext`, drop `fieldBlockFactory`, preserve whitespace gaps, two-way snapshot diffing in phase 5).
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items relevant to migration and verification.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback; source code at `art-js/cli/poc-parse/src/parse/`.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Pseudo: `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth): context-aware visiting, factories, handlers.
- Architecture: `architecture/index.md` – artificial ecosystem overview.
- ADR: `architecture/records/adr/parser.art` – mdast-based substrate research behind the parser.
- ADR: `architecture/records/adr/language.art` – language and parser containment model decisions.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth).
- `art-js/cli/poc-parse/src/parse/` – current POC implementation to migrate.

## Execution Context

**Workspace:** Running on `$WORKSPACE = CWD` managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

If a git workspace tree was created, it is likely that the workspace CLI is not installed AND that the checkout(s) of the repository or repositories where work is performed do not exist yet.

## Setup

Execute in `$WORKSPACE`, to clone and branch the repo:

```bash
npm install # installs workspace cli
npm run workspace clone artificial # creates checkout at repos/artificial
npm run branch migrate-and-verify artificial # branches it to migrate-and-verify
```

And check `repos/artificial` exists and is on branch `migrate-and-verify`.

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Commits

### `migrate-parser-code` - `COMMITTED`

**Commit Message:** `build(md-art-roundtrip): migrate all parser code to packages`

**Instructions File:** `_backlog/3-now/plan-migrate-and-verify/instructions/migrate-parser-code.md`

**Commit Id:** `9c688285`

**Report:** `_backlog/3-now/plan-migrate-and-verify/instructions/migrate-parser-code__report.md`

**Scope:**

- Move all parser logic to `@art-js/artificial-parser`
- Eliminate `createNestedContext` injection from handler factories (milestone decision)
- Do not keep the dead `fieldBlockFactory` export (milestone decision)
- Move fixtures to parser package test directory
- Add minimum viable test coverage for each factory and handler as soon as the directory structure, migrated types, and factories are stable
- Verify: `npm run test` passes in parser package
- Do not modify poc-parse (migration source; read-only) — `@art-js/artificial-parser` takes over as the parser; poc-parse stays untouched until archived in phase 10

**Result:**

- Copied and adapted parser implementation files into `art-js/libs/parser/src/`
- Implemented public API `parse(markdown)` and `createDefaultConfig`; wired builder and factories
- Added minimal unit-test fixture runner and confirmed tests pass ("All fixtures passed!")

### `verify-parser-against-snapshots` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): art-js: verify parser output against POC snapshots`

**Instructions File:** `_backlog/3-now/plan-migrate-and-verify/instructions/verify-parser-against-snapshots.md`

**Evidence:**

- Extend the migrated fixture runner (phase 2) to diff parser output against the `.art.json` snapshots — md/art → art.json must match the POC output exactly
- All 16 inputs are covered by basename (15 snapshot files; `section-block.art` and `section-block.md` share `section-block.art.json`)
- Do not modify poc-parse (migration source; read-only) — snapshots are read from the POC fixtures and asserted from the parser package
- Verify: `npm run test` in parser package passes with snapshot diffing enabled

## Follow ups

No follow-ups yet.

## Feedback

- migrate-parser-code: `COMMITTED` — report: `_backlog/3-now/plan-migrate-and-verify/migrate-parser-code__report.md`

Planner reflection:

- Migration completed and verified in the parser package; tests for migrated fixtures passed.
- No blockers reported; follow-ups noted in the report as observations.
