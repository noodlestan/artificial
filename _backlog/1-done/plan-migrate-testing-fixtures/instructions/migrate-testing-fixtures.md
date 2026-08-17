# Instructions: `build(md-art-roundtrip): migrate testing fixtures to parser package`

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

Migrate the poc-parse fixture testing mechanism into `@art-js/artificial-parser`: copy the 16 fixture inputs (8 `.art` + 8 `.md`) and 15 expected `.art.json` snapshots from the read-only POC package to `art-js/libs/parser/test/fixtures/`, create a **self-contained** fixture runner at `art-js/libs/parser/scripts/test-fixtures.ts` (importing nothing from `poc-parse`; the parse call goes through the parser entry point's `parse(): void { return undefined }` stub until phase 3), wire the `test` script, and add the runtime devDependencies — so the fixture harness runs in the migrated codebase with byte-identical fixture data.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, setup, verification, working agreements, workflows.
- `repos/artificial/_backlog/3-now/plan-migrate-testing-fixtures/plan.md` — this plan; the commit is `migrate-testing-fixtures`.
- `repos/artificial/art-js/cli/poc-parse/scripts/test-fixtures.ts` — the POC runner (structural reference for the output format only; do NOT port its `parse` import — the parser runner imports `parse` from its own entry point, not from poc-parse).
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
2. Create the fixture runner `repos/artificial/art-js/libs/parser/scripts/test-fixtures.ts`, **self-contained — it MUST NOT import anything from `poc-parse/**`, not even `parse`.** It imports `parse` from the parser's own entry point (`../src/index.ts`, which phase 1 bootstrapped to export `parse(): void { return undefined }`). Use exactly the runner below (output format identical to the POC):
   - `const document = parse();` calls the entry-point `parse` stub (returns `undefined`); the intended `// const content = fs.readFileSync(filePath, 'utf-8');` and `// const document = parse(content);` are kept as commented-out placeholders so phase 3 sees exactly what to fill in.
   - `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above `parseFixture` suppresses the unused `filePath` parameter (unused while the file is not read — the parse stub takes no args).
   - `FIXTURES_DIR` → `path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'test', 'fixtures')` — the parser suite lives under `test/fixtures`, unlike the POC.
3. Wire the test script in `repos/artificial/art-js/libs/parser/package.json`: `"test": "npx tsx scripts/test-fixtures.ts"`; add devDependencies `"tsx": "^4.8.1"` and `"@types/node": "^25.9.3"` (matching the root workspace ranges).
4. Run `npm install` at the repository root to regenerate `package-lock.json` (never hand-edit it) and confirm exit 0.

The runner to create (authoritative; do not deviate):

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from '../src/index.ts'; // parser entry point — parse stub returns undefined until phase 3

const FIXTURES_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'test',
  'fixtures',
);

function getFixtures(): string[] {
  const files = fs.readdirSync(FIXTURES_DIR);
  return files
    .filter(f => f.endsWith('.md') || f.endsWith('.art'))
    .filter(f => !f.endsWith('.art.json'))
    .sort();
}

function getTimeMs(): number {
  return Date.now();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseFixture(filePath: string): {
  success: boolean;
  document?: unknown;
  error?: string;
  durationMs: number;
} {
  const startTime = getTimeMs();

  try {
    // const content = fs.readFileSync(filePath, 'utf-8'); // phase 3: read the file and pass content to parse

    const document = parse(); // entry-point parse stub — returns undefined until phase 3

    const endTime = getTimeMs();
    return { success: true, document, durationMs: endTime - startTime };
  } catch (error) {
    const endTime = getTimeMs();
    return { success: false, error: (error as Error).message, durationMs: endTime - startTime };
  }
}

async function main(): Promise<void> {
  const fixtures = getFixtures();
  let exitCode = 0;
  let totalParseTime = 0;
  const startTime = getTimeMs();

  console.info(`Testing ${fixtures.length} fixtures...\n`);

  for (const fixture of fixtures) {
    const filePath = path.join(FIXTURES_DIR, fixture);
    const result = parseFixture(filePath);
    totalParseTime += result.durationMs;

    const status = result.success ? 'PASS' : 'FAIL';
    console.info(`${fixture.padEnd(30)} ${status} (${result.durationMs}ms)`);

    if (!result.success) {
      console.error(`  Error: ${result.error}`);
      exitCode = 1;
    }
  }

  const endTime = getTimeMs();
  const totalTime = endTime - startTime;

  console.info('\n' + '='.repeat(50));
  console.info(`Results: ${fixtures.length} fixtures tested`);
  console.info(`Total time: ${totalTime}ms`);
  console.info(`Parse time: ${totalParseTime}ms`);
  console.info(`Overhead: ${totalTime - totalParseTime}ms`);
  console.info('='.repeat(50));

  if (exitCode === 0) {
    console.info('\nAll fixtures passed!');
  } else {
    console.info('\nSome fixtures failed!');
  }

  process.exit(exitCode);
}

main();
```

## Rules

- Only modify: `repos/artificial/art-js/libs/parser/test/fixtures/**`, `repos/artificial/art-js/libs/parser/scripts/test-fixtures.ts`, `repos/artificial/art-js/libs/parser/package.json`, `repos/artificial/package-lock.json` (regenerated via `npm install`, never hand-edited).
- RULE: Do NOT import anything from `poc-parse/**` — not even `parse`. The runner is self-contained and imports `node:fs`, `node:path`, and `parse` from the parser's own entry point (`../src/index.ts`).
- RULE: Do NOT modify `repos/artificial/art-js/cli/poc-parse/**` — POC Parse is a read-only migration source; fixtures are copied, never moved or modified.
- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_backlog/**`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- RULE: The runner logs via `console.info` / `console.error` only — these are allow-listed by the root `no-console` rule (`allow: ['info', 'warn', 'error']`); do NOT add any `eslint-disable` comment for `console`.
- RULE: The only `eslint-disable` comment is the `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above `parseFixture` (for the unused `filePath` param, unused while the file is not read — the parse stub takes no args).
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Copy the fixtures
Step 2. Create the fixture runner
Step 3. Wire the test script and dependencies
Step 4. Verify

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Verification

- After Step 1: `diff -r` between source and target fixtures reports no differences; the target holds 31 files.
- After Step 2: `npx tsc --noEmit` in `art-js/libs/parser/` passes (the runner is typechecked — the parser tsconfig includes `scripts/` and `types: ["vite/client", "node"]`). Because the runner imports nothing from `poc-parse`, the POC module graph is not pulled into the parser compilation.
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

### Step 2 of 4 — Create the fixture runner

1. Create `repos/artificial/art-js/libs/parser/scripts/test-fixtures.ts` with EXACTLY the runner shown under `## Changes` — self-contained (imports `node:fs`, `node:path`, and `parse` from the parser entry point `../src/index.ts`), parse called via `parse()`, the `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above `parseFixture`, and `FIXTURES_DIR` → `../test/fixtures`.
2. Do NOT port the POC runner's `parse` import from `poc-parse` — the parser runner imports `parse` from its own entry point (`../src/index.ts`), never from `poc-parse`.
3. Typecheck: run `npm run lint` in `repos/artificial/art-js/libs/parser/` — must exit 0 (validates the `@types/node` types for `node:fs` / `node:path` / `process`).

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
4. `git status` — the change set contains ONLY the copied fixtures, the new runner, `art-js/libs/parser/package.json`, and the regenerated root `package-lock.json`. Confirm nothing in `poc-parse` changed.

## Final Verification

**Sanity check**

The parser package owns the fixture suite: 31 files (16 inputs + 15 `.art.json` snapshots) byte-identical to the POC source, a **self-contained** runner (no `poc-parse` import; imports `parse` from the parser entry point `../src/index.ts` and calls `parse()`, which returns `undefined` via the phase-1 stub; `FIXTURES_DIR` → `../test/fixtures`; output format identical), the wired `test` script, and `tsx` / `@types/node` devDependencies with a regenerated lockfile. `npm run test` prints 16 PASS and `All fixtures passed!`; lint and build pass. POC Parse is untouched. NOTE: because `parse()` is a stub returning `undefined` and never throws, every fixture passes vacuously — the harness proves the runner and the fixture wiring, not parsing correctness, which is exercised only in phase 3 (`migrate-and-verify`).

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
- Commit with message: `build(md-art-roundtrip): migrate testing fixtures to parser package`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/3-now/plan-migrate-testing-fixtures/instructions/migrate-testing-fixtures__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `migrate-testing-fixtures`, fixtures + runner + test script, 16 fixtures PASS, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_backlog/_architect.md`, or `repos/artificial/_backlog/_parking-lot.md`. Never silently "fix in code only" — the planner applies these changes later. Explicitly include the phase-3 note (the runner's `parse()` entry-point stub returns `undefined` → phase 3 reads the file and replaces the call with `const document = parse(content)`, and removes the `filePath` `eslint-disable` once the param is used) in the feedback so phase 3 (`plan-migrate-and-verify`) picks it up.

Thank you for your service.
