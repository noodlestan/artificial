# Instructions: `art-js: migrate testing fixtures to parser package`

**Plan:** `migrate-testing-fixtures`

**Commit:** `migrate-testing-fixtures`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `migrate-testing-fixtures`, fixtures + runner + test script, 16 fixtures PASS, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Migrate the poc-parse fixture testing mechanism into `@art-js/artificial-parser`: copy the 16 fixture inputs (8 `.art` + 8 `.md`) and 15 expected `.art.json` snapshots from the read-only POC package to `art-js/libs/parser/test/fixtures/`, port the fixture runner to `art-js/libs/parser/scripts/test-fixtures.ts` (importing `parse` from the POC source until phase 3), wire the `test` script, and add the runtime devDependencies — so fixture tests run in the migrated codebase with byte-identical fixture data.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, setup, verification, working agreements, workflows.
- `repos/artificial/_backlog/3-now/plan-migrate-testing-fixtures/plan.md` — this plan; the commit is `migrate-testing-fixtures`.
- `repos/artificial/art-js/cli/poc-parse/scripts/test-fixtures.ts` — the runner to port (source of truth; port verbatim except the two adjustments in Step 2).
- `repos/artificial/art-js/cli/poc-parse/package.json` — POC `"test": "npx tsx scripts/test-fixtures.ts"` mechanism reference.
- `repos/artificial/art-js/libs/parser/package.json` — target package; `"test"` script to wire, devDependencies to extend.
- `repos/artificial/art-js/cli/poc-parse/fixtures/` — the fixture inputs and snapshots to copy (31 files).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Changes

1. Copy ALL files from `repos/artificial/art-js/cli/poc-parse/fixtures/` (31 files: 8 `.art` + 8 `.md` inputs, 15 `.art.json` snapshots) to `repos/artificial/art-js/libs/parser/test/fixtures/` — copy, never move or modify the source; the target tree must be byte-identical to the source.
2. Port `repos/artificial/art-js/cli/poc-parse/scripts/test-fixtures.ts` to `repos/artificial/art-js/libs/parser/scripts/test-fixtures.ts`, keeping the output format identical, with exactly two adjustments:
   - import `parse` from the POC source: `import { parse } from '../../../cli/poc-parse/src/parse/parse';` — the parser package has no `parse` export until phase 3 (`verify-parser-against-snapshots` swaps this import to `@art-js/artificial-parser`). Add a comment noting that swap.
   - `FIXTURES_DIR` → `path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'test', 'fixtures')` — the parser suite lives under `test/fixtures`, unlike the POC.
3. Wire the test script in `repos/artificial/art-js/libs/parser/package.json`: `"test": "npx tsx scripts/test-fixtures.ts"`; add devDependencies `"tsx": "^4.8.1"` and `"@types/node": "^25.9.3"` (matching the root workspace ranges).
4. Run `npm install` at the repository root to regenerate `package-lock.json` (never hand-edit it) and confirm exit 0.

## Rules

- Only modify: `repos/artificial/art-js/libs/parser/test/fixtures/**`, `repos/artificial/art-js/libs/parser/scripts/test-fixtures.ts`, `repos/artificial/art-js/libs/parser/package.json`, `repos/artificial/package-lock.json` (regenerated via `npm install`, never hand-edited).
- RULE: Do NOT modify `repos/artificial/art-js/cli/poc-parse/**` — POC Parse is a read-only migration source; fixtures and runner are copied, never moved or modified.
- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_backlog/**`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- RULE: The runner logs via `console.info` / `console.error` only — these are allow-listed by the root `no-console` rule (`allow: ['info', 'warn', 'error']`); do NOT add any `eslint-disable` comment.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Copy the fixtures
Step 2. Port the fixture runner
Step 3. Wire the test script and dependencies
Step 4. Verify

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Verification

- After Step 1: `diff -r` between source and target fixtures reports no differences; the target holds 31 files.
- After Step 2: `npx tsc --noEmit` in `art-js/libs/parser/` passes (the runner is typechecked — the parser tsconfig includes `scripts/` and `types: ["vite/client", "node"]`).
- After Step 3: `npm install` at the repository root exits 0; `grep '"test"' art-js/libs/parser/package.json` shows the tsx script.
- After Step 4: full verification below.

## Verification

Run from `repos/artificial/art-js/libs/parser/` package directory:

```bash
npm run test
```

Expected: the fixture runner prints `Testing 16 fixtures...`, one `PASS (Nms)` line per fixture, the results block (`Results: 16 fixtures tested`, `Total time`, `Parse time`, `Overhead`), and `All fixtures passed!`; exit code 0. Fixture names and timings may differ slightly from the plan's sample — the structure and the 16-fixture count must match.

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Steps

### Step 1 of 4 — Copy the fixtures

1. Create the target directory: `mkdir -p repos/artificial/art-js/libs/parser/test/fixtures`.
2. Copy all 31 files from `repos/artificial/art-js/cli/poc-parse/fixtures/` into the target.
3. Confirm byte-identity:

   ```bash
   diff -r repos/artificial/art-js/cli/poc-parse/fixtures repos/artificial/art-js/libs/parser/test/fixtures
   # no output = identical; count: 31 files
   ```

### Step 2 of 4 — Port the fixture runner

1. Copy `repos/artificial/art-js/cli/poc-parse/scripts/test-fixtures.ts` to `repos/artificial/art-js/libs/parser/scripts/test-fixtures.ts`.
2. Adjust the import:

   ```typescript
   // NOTE: phase 3 (verify-parser-against-snapshots) swaps this import to '@art-js/artificial-parser'.
   import { parse } from '../../../cli/poc-parse/src/parse/parse';
   ```

3. Adjust `FIXTURES_DIR`:

   ```typescript
   const FIXTURES_DIR = path.join(
     path.dirname(new URL(import.meta.url).pathname),
     '..',
     'test',
     'fixtures',
   );
   ```

4. Leave everything else verbatim — the `getFixtures` filter (`*.md` / `*.art`, excluding `*.art.json`), the `parseFixture` try/catch, the per-fixture `PASS`/`FAIL` line (`padEnd(30)`), the results block, and `process.exit(exitCode)`.
5. Typecheck: run `npm run lint` in `repos/artificial/art-js/libs/parser/` — must exit 0 (this also validates the `@types/node` types for `node:fs` / `node:path` / `process`).

### Step 3 of 4 — Wire the test script and dependencies

1. In `repos/artificial/art-js/libs/parser/package.json`:
   - replace `"test": "echo none yet"` with `"test": "npx tsx scripts/test-fixtures.ts"`
   - add to `devDependencies`: `"tsx": "^4.8.1"`, `"@types/node": "^25.9.3"` (keep everything else, including the vite build scripts)
2. Run `npm install` from `repos/artificial/` (the repository root) to install `tsx` / `@types/node` and regenerate `package-lock.json` — confirm exit 0. Do NOT hand-edit the lockfile.
3. Confirm the parser's `node_modules/.bin/tsx` exists (or tsx is hoisted to the root `node_modules`).

### Step 4 of 4 — Verify

1. Run `npm run test` from `repos/artificial/art-js/libs/parser/` — 16 fixtures, all PASS, exit 0.
2. Run `npm run lint:fix` then `npm run lint` from `repos/artificial/art-js/libs/parser/` — must exit 0.
3. Run `npm run build` from `repos/artificial/art-js/libs/parser/` — must exit 0.
4. `git status` — the change set contains ONLY the copied fixtures, the ported runner, `art-js/libs/parser/package.json`, and the regenerated root `package-lock.json`. Confirm nothing in `poc-parse` changed.

## Final Verification

**Sanity check**

The parser package owns the fixture suite: 31 files (16 inputs + 15 `.art.json` snapshots) byte-identical to the POC source, the ported runner (POC import + `FIXTURES_DIR` → `../test/fixtures`, output format identical), the wired `test` script, and `tsx` / `@types/node` devDependencies with a regenerated lockfile. `npm run test` prints 16 PASS and `All fixtures passed!`; lint and build pass. POC Parse is untouched.

**Verification:**

Run from `repos/artificial/art-js/libs/parser/` package directory:

```bash
npm run test
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
```

**Commit and report**

- Stage all changes in `repos/artificial/art-js/libs/parser/` (fixtures, scripts, package.json) + the regenerated root `package-lock.json`.
- Commit with message: `art-js: migrate testing fixtures to parser package`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/3-now/plan-migrate-testing-fixtures/instructions/migrate-testing-fixtures__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `migrate-testing-fixtures`, fixtures + runner + test script, 16 fixtures PASS, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_backlog/_architect.md`, or `repos/artificial/_backlog/_parking-lot.md`. Never silently "fix in code only" — the planner applies these changes later. Explicitly include the phase-3 swap note (`../../../cli/poc-parse/src/parse/parse` → `@art-js/artificial-parser`) in the feedback so phase 3 (`plan-migrate-and-verify`) picks it up.

Thank you for your service.
