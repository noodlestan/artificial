# Plan: Migrate Testing Fixtures

**ID:** `migrate-testing-fixtures`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Migrate the poc-parse fixture testing mechanism into `@art-js/artificial-parser`: copy the 16 fixture inputs (8 `.art` + 8 `.md`) and the 15 expected `.art.json` snapshots from the read-only POC package, port the fixture runner (`scripts/test-fixtures.ts`), and wire the `test` script in the parser package so fixture tests run in the migrated codebase. Executed within the Artificial repository (`repos/artificial`) as phase 2 of the MD Art Roundtrip milestone; prerequisite for phase 3 (`migrate-and-verify`) so the migrated parser is verified against the fixture suite before any refinement.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: two-way fixture diffing (`source.md` vs `parsed.md`), addressed by the serializer extension in phase 5 (`plan-implement-serializer`).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/` (receives the fixtures, the fixture runner, and the wired `test` script in this plan; currently `"test": "echo none yet"`).
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only — fixtures and runner are copied, never modified).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 2 of the MD Art Roundtrip milestone; successor is phase 3 (`migrate-and-verify`).
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items and open questions relevant to fixture testing.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Mechanism (POC): `art-js/cli/poc-parse/package.json` – `"test": "npx tsx scripts/test-fixtures.ts"`.
- Runner (POC): `art-js/cli/poc-parse/scripts/test-fixtures.ts` – reads every `.md`/`.art` file in `fixtures/` (excluding `.art.json`), calls `parse(content)`, prints per-fixture `PASS`/`FAIL` with timing, exits non-zero on any failure. NOTE: the runner asserts parse success only — the `.art.json` snapshots are currently not diffed.
- Fixture data (POC): `art-js/cli/poc-parse/fixtures/` – 31 files: 16 inputs (8 `.art` + 8 `.md`) and 15 expected `.art.json` snapshots. Every input maps to a snapshot by basename (`section-block.art` and `section-block.md` share `section-block.art.json`).
- Milestone strategy: the roundtrip art fixture for the serializer phase lives in `@art-js/artificial-spec`; this plan only migrates the parser fixture suite.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/poc-parse/scripts/test-fixtures.ts` – the runner to port (source of truth).
- `art-js/cli/poc-parse/fixtures/` – the fixture inputs and snapshots to copy.
- `art-js/libs/parser/package.json` – target package; `"test"` script to wire.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directory is `$PROJECT/art-js/libs/parser`.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run in the parser package:

```bash
npm run test # fixture runner — expected output:
```

```text
> @art-js/artificial-parser@0.0.1 test
> npx tsx scripts/test-fixtures.ts

Testing 16 fixtures...

README.md                      PASS (5ms)
architecture-index.md          PASS (7ms)

section-block.art              PASS (1ms)
section-block.md               PASS (1ms)
semantics.art                  PASS (2ms)

==================================================
Results: 16 fixtures tested
Total time: 45ms
Parse time: 43ms
Overhead: 2ms
==================================================

All fixtures passed!
```

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Commits

### `migrate-testing-fixtures` - `DRAFT`

**Commit Message:** `art-js: migrate testing fixtures to parser package`

**Instructions File:** `_backlog/4-next/plan-migrate-testing-fixtures/instructions/migrate-testing-fixtures.md`

**Scope:**

- Copy the 16 fixture inputs and 15 expected `.art.json` snapshots from `poc-parse/fixtures/` (read-only source) to `art-js/libs/parser/test/fixtures/` — copy, never move or modify the source
- Port `scripts/test-fixtures.ts` from poc-parse into the parser package as `scripts/test-fixtures.ts`, keeping the output format identical (import the parse API from the parser package)
- Wire `"test": "npx tsx scripts/test-fixtures.ts"` in `art-js/libs/parser/package.json`; add `tsx` (and `@types/node` if missing) to parser devDependencies
- Do not modify poc-parse (migration source; read-only)
- Verify: `npm run test` in the parser package prints the 16-fixture PASS output above; `npm run lint` and `npm run build` pass

## Follow ups

None.

## Feedback

No sub-agent reports yet.
