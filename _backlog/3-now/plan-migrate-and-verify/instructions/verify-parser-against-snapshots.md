# Instructions: `verify-parser-against-snapshots`

**Plan:** `migrate-and-verify`

**Commit:** `verify-parser-against-snapshots`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to the requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its Mandatory Reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

- Implement snapshot diffing for parser outputs against the POC `.art.json` fixtures.
- Validate that migrated parser output (md → art.json) is byte-identical with archived POC snapshots for all listed inputs.
- Ensure the snapshot runner is self-contained and imports the migrated parser from `@art-js/artificial-parser`.

## Mandatory Reading

- ::READ `plan.md` — the plan being executed.
- ::READ `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` — milestone context and decisions.
- ::READ `_backlog/1-done/plan-poc-parse/plan.md` — archived POC plan and snapshot references.
- ::READ `art-js/cli/poc-parse/fixtures/` — archived fixture inputs and snapshots (read-only source).

### Execution Context

**Workspace:** Running on `$WORKSPACE = CWD` managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

If a git workspace tree was created, it is likely that the workspace CLI is not installed AND that the checkout(s) of the repository or repositories where work is performed do not exist yet.

### Setup

Execute in `$WORKSPACE`, to clone and branch the repo:

```bash
npm install # installs workspace cli
npm run workspace clone artificial # creates checkout at repos/artificial
npm run branch migrate-and-verify artificial # branches it to migrate-and-verify
```

And check `repos/artificial` exists and is on branch `migrate-and-verify`.

Run from the `repos/artificial` repository root:

```bash
npm ci
```

## Verification

Run the full verification commands until green:

```bash
npm run lint:fix
npm run build
npm run test
# If there is a separate snapshot runner: node scripts/run-snapshot-check.js
```

## Changes (authoritative; do not deviate)

1. Create or update the fixture runner under `art-js/libs/parser/scripts/run-snapshot-check.ts` that:
   - Imports parser from `@art-js/artificial-parser` (package entrypoint).
   - Reads the archived `.art.json` snapshots from `art-js/cli/poc-parse/fixtures/` or local copied fixtures under `art-js/libs/parser/test/fixtures/`.
   - Runs the parser over each input and compares the produced JSON with the archived `.art.json` snapshot byte-for-byte or via deterministic JSON compare.
2. Ensure the runner maps basenames correctly (there are 16 inputs to cover) and reports PASS/FAIL per fixture.
3. Add any helper utilities under `art-js/libs/parser/scripts/` to normalise JSON for stable comparisons if required (document the normalisation in the code comments).
4. Wire the parser package test script to run the snapshot runner or add a separate script entry in `package.json`.

## Runner (example — adapt as needed):

```ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from '@art-js/artificial-parser';

const FIXTURES_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'test',
  'fixtures',
);

function readSnapshot(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function runFixture(inputPath: string, snapshotPath: string) {
  const input = fs.readFileSync(inputPath, 'utf-8');
  const got = parse(input);
  const expected = readSnapshot(snapshotPath);
  // Optionally normalise both 'got' and 'expected' for deterministic comparison
  return JSON.stringify(got) === JSON.stringify(expected);
}

// iterate fixtures, run comparisons, print PASS/FAIL, exit non-zero on any failure
```

## Steps (recommended order)

1. Read `plan.md` and all Mandatory Reading.
2. Implement the snapshot runner (small change), and add a single fixture check to assert runner runs and compares one snapshot.
3. Run verification and iterate until runner behaves as expected.
4. Expand runner to cover all fixtures (16 inputs) and ensure mappings are correct.
5. Fix parser behaviour if diffs are found; commit fixes in small units with corresponding test evidence.
6. Finalise and ensure all snapshot checks pass locally.

## Rules

- Do not modify archived snapshots in `art-js/cli/poc-parse/fixtures/` — they are the source of truth for comparisons.
- Runner must import `@art-js/artificial-parser` and not import runtime code from the POC package.
- Keep commits small and include test evidence.

## How to Report Back

Render a report file at the instruction's report path: `<instruction-dir>/<instruction-id>__report.md` including:

- Commit SHAs (one per logical commit performed)
- Snapshot runner output and test logs
- A short summary of changes (3 bullets)
- Any remaining blockers and reproduction steps

Then reply in chat with a single line: `done verify-parser-against-snapshots {report-file}`

If blocked, create the report with evidence and reply: `blocked verify-parser-against-snapshots {report-file}`
