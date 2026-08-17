# Plan: Migrate Testing Fixtures

**ID:** `migrate-testing-fixtures`

**Status:** `READY`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Migrate the poc-parse fixture testing mechanism into `@art-js/artificial-parser`: copy the 16 fixture inputs (8 `.art` + 8 `.md`) and the 15 expected `.art.json` snapshots from the read-only POC package, create the fixture runner (`scripts/test-fixtures.ts`), and wire the `test` script in the parser package so fixture tests run in the migrated codebase. The runner is **self-contained** — it imports nothing from `poc-parse`; it imports `parse` from the parser's own entry point (`../src/index.ts`, which phase 1 bootstrapped with a `parse(): void { return undefined }` stub) and calls `parse()` until phase 3. NOTE: because `parse()` returns `undefined` and never throws, all fixtures pass vacuously — the harness is wired but nothing is genuinely parsed until phase 3. Executed within the Artificial repository (`repos/artificial`) as phase 2 of the MD Art Roundtrip milestone; prerequisite for phase 3 (`migrate-and-verify`) so the migrated parser is verified against the fixture suite before any refinement. NOTE: phase 3 (`verify-parser-against-snapshots`) reads the file and replaces the stub call with the real `parse(content)`. The runner already imports `parse` from the entry point (`../src/index.ts`), so phase 3 only fills in the call.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: two-way fixture diffing (`source.md` vs `parsed.md`), addressed by the serializer extension in phase 5 (`plan-implement-serializer`).
- Out of scope: the `.art.json` snapshot diffing — the runner asserts parse success only (POC behavior kept identical); snapshot verification lands with the migrated parser in phase 3.
- Out of scope: `art-js/cli/poc-parse/**` — read-only migration source; fixtures and runner are copied, never moved or modified.

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

- Milestone: `_backlog/3-now/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 2 of the MD Art Roundtrip milestone; successor is phase 3 (`migrate-and-verify`).
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items and open questions relevant to fixture testing.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Mechanism (POC): `art-js/cli/poc-parse/package.json` – `"test": "npx tsx scripts/test-fixtures.ts"`.
- Runner (POC): `art-js/cli/poc-parse/scripts/test-fixtures.ts` – reads every `.md`/`.art` file in `fixtures/` (excluding `.art.json`), calls `parse(content)`, prints per-fixture `PASS`/`FAIL` with timing, exits non-zero on any failure. Structural reference for the output format only — the parser runner is **self-contained** (no `poc-parse` import). NOTE: the runner asserts parse success only — the `.art.json` snapshots are currently not diffed.
- Runner parse (resolved): phase 1 bootstraps the parser entry point to export `parse(): void { return undefined }` — the runner is **self-contained** (imports nothing from `poc-parse`) and imports `parse` from its own entry point (`../src/index.ts`), calling `const document = parse()`. Because the stub returns `undefined` and never throws, all fixtures pass vacuously. Phase 3 (`verify-parser-against-snapshots`) reads the file and replaces the call with `const document = parse(content)`, and removes the `filePath` `eslint-disable` once the param is used.
- Fixture data (POC): `art-js/cli/poc-parse/fixtures/` – 31 files: 16 inputs (8 `.art` + 8 `.md`) and 15 expected `.art.json` snapshots. Every input maps to a snapshot by basename (`section-block.art` and `section-block.md` share `section-block.art.json`).
- Runtime: `tsx ^4.8.1` and `@types/node ^25.9.3` (matching the root workspace ranges; both already resolved in the root lockfile) are added to the parser devDependencies. The parser `tsconfig.json` already includes `scripts/` and `types: ["vite/client", "node"]`, so the runner is typechecked.
- Lint: the root `no-console` rule allow-lists `info|warn|error` — the runner logs via `console.info` / `console.error` only, so no `eslint-disable` comment is needed for `console`. The single `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above `parseFixture` handles the unused `filePath` parameter (unused while parse is stubbed).
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

### `migrate-testing-fixtures` - `COMMITTED`

**Commit Message:** `build(md-art-roundtrip): migrate testing fixtures to parser package`

**Commit:** `6ecfbc1`

**Instructions File:** `_backlog/3-now/plan-migrate-testing-fixtures/instructions/migrate-testing-fixtures.md`

**Scope:**

- Copy the 16 fixture inputs and 15 expected `.art.json` snapshots from `poc-parse/fixtures/` (read-only source) to `art-js/libs/parser/test/fixtures/` — copy, never move or modify the source
- Create the fixture runner `scripts/test-fixtures.ts` in the parser package (self-contained — imports nothing from poc-parse; imports `parse` from its own entry point `../src/index.ts` and calls `parse()`; single `eslint-disable` for the unused `filePath` param), keeping the output format identical to the POC; `FIXTURES_DIR` points at `../test/fixtures` (the parser suite lives under `test/`, unlike the POC)
- Wire `"test": "npx tsx scripts/test-fixtures.ts"` in `art-js/libs/parser/package.json`; add `tsx ^4.8.1` and `@types/node ^25.9.3` to parser devDependencies; regenerate the lockfile via `npm install` at the repository root
- Do not modify poc-parse (migration source; read-only)
- Verify: `npm run test` in the parser package prints the 16-fixture PASS output above; `npm run lint` and `npm run build` pass

```
**CHANGELOG:**

- Copy 16 fixture inputs + 15 `.art.json` snapshots from poc-parse to `art-js/libs/parser/test/fixtures/`
- Create self-contained fixture runner at `art-js/libs/parser/scripts/test-fixtures.ts` (no poc-parse import; imports `parse` from the parser entry point and calls `parse()` — stub returns `undefined` until phase 3)
- Wire `"test": "npx tsx scripts/test-fixtures.ts"` + add `tsx` / `@types/node` devDeps; regenerate lockfile
```

## Follow ups

- Phase 3 (`migrate-and-verify`) must replace the runner's `parse()` entry-point stub call with a real one: read the file (`fs.readFileSync(filePath, 'utf-8')`) and call `const document = parse(content)`, and remove the `eslint-disable` for `filePath` (the param becomes used) — noted in the phase 3 plan and in this plan's instruction DIRECTIVE FEEDBACK.
- Snapshot diffing (`.art.json` comparison) is out of scope here — revisit with the migrated parser in phase 3 and the serializer in phase 5.

## Feedback

Nothing relevant.
