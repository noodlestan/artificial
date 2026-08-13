# Instruction: Split Test Files

**Plan:** `refactor-conventions`

**commit.Id:** `split-test-files`

**Package:** `$PACKAGE` = `repos/artificial/art-domains/cli/workspace` (relative to the workspace root). All file paths in this instruction are relative to `$PACKAGE`; run npm commands in `$PACKAGE`.

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `split-test-files`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Split and rename the test files under `src/` so that each test file tests exactly one function and its filename matches the tested file (camelCase). Remove the leftover `describe.only` / `it.only` calls that currently silence tests. No production behavior changes — test expectations stay identical.

## Mandatory Reading

- `package.json` — scripts: `lint`, `build`, `test`, `test:coverage`
- `_backlog/3-now/plan-refactor-conventions/plan.md` — commit boundaries and context
- `src/private/git/git.test.ts` — current multi-function test file to split
- `src/commands/branch/branch.test.ts` — current multi-function test file to split

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Note: this commit runs AFTER `rename-source-files`. All source modules are already at their camelCase paths (e.g. `src/private/git/getCurrentBranch.ts`, `src/commands/branch/runBranch.ts`). Test files below still use the old names until this commit renames/splits them.

### Split `src/private/git/git.test.ts` into 8 files

Move each `describe` block into its own file, removing `describe.only` (line 78, `hasLocalBranch`). All describes become plain `describe`. Each new file imports only the function it tests plus the test helpers it needs (`makeTempDir`, `removeTempDirs`, `initGitRepo`, `initBareRepo`, `commitFile` as used by the moved tests).

| new test file                               | describes moved     |
| ------------------------------------------- | ------------------- |
| `src/private/git/getCurrentBranch.test.ts`  | `getCurrentBranch`  |
| `src/private/git/isDetachedHead.test.ts`    | `isDetachedHead`    |
| `src/private/git/hasMergeConflicts.test.ts` | `hasMergeConflicts` |
| `src/private/git/hasLocalBranch.test.ts`    | `hasLocalBranch`    |
| `src/private/git/isDirty.test.ts`           | `isDirty`           |
| `src/private/git/hasRemote.test.ts`         | `hasRemote`         |
| `src/private/git/getRemoteBranch.test.ts`   | `getRemoteBranch`   |
| `src/private/git/getUnpushedCount.test.ts`  | `getUnpushedCount`  |

Delete `src/private/git/git.test.ts` after the split. The 12 currently-skipped tests must now run.

### Split `src/commands/branch/branch.test.ts` into 3 files

Move each `describe` block into its own file. Remove the two `it.only` calls (lines 145 and 163) — those tests must now run.

| new test file                                        | describes moved       |
| ---------------------------------------------------- | --------------------- |
| `src/private/operations/createBranchSuccess.test.ts` | `createBranchSuccess` |
| `src/private/operations/createBranchFailure.test.ts` | `createBranchFailure` |
| `src/commands/branch/runBranch.test.ts`              | `branch command`      |

Delete `src/commands/branch/branch.test.ts` after the split. The 6 currently-skipped tests must now run.

### Split `src/private/records/checkout-record.test.ts` into 2 files

| new test file                                    | tests moved                                                                         |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `src/private/records/readCheckoutRecord.test.ts` | read-side assertions (`readCheckoutRecord`)                                         |
| `src/private/records/saveCheckoutRecord.test.ts` | save-side assertions (`saveCheckoutRecord`, round-trip, markers, template fallback) |

Delete `src/private/records/checkout-record.test.ts` after the split.

### Split `src/config/config.test.ts` into 2 files

| new test file                            | describes moved       |
| ---------------------------------------- | --------------------- |
| `src/config/defineConfig.test.ts`        | `defineConfig`        |
| `src/config/loadWorkspaceConfig.test.ts` | `loadWorkspaceConfig` |

Delete `src/config/config.test.ts` after the split.

### Rename remaining test files

| current                                             | new                                                  |
| --------------------------------------------------- | ---------------------------------------------------- |
| `src/commands/clone/clone.test.ts`                  | `src/commands/clone/runClone.test.ts`                |
| `src/commands/sanity/sanity.test.ts`                | `src/commands/sanity/runSanity.test.ts`              |
| `src/commands/link/link.test.ts`                    | `src/commands/link/runLink.test.ts`                  |
| `src/commands/publish/publish.test.ts`              | `src/commands/publish/runPublish.test.ts`            |
| `src/commands/unlink/unlink.test.ts`                | `src/commands/unlink/runUnlink.test.ts`              |
| `src/private/context/workspace-context.test.ts`     | `src/private/context/createWorkspaceContext.test.ts` |
| `src/private/log/operations-log.test.ts`            | `src/private/log/createOperationsLog.test.ts`        |
| `src/private/records/load-checkout-records.test.ts` | `src/private/records/loadCheckoutRecords.test.ts`    |
| `src/private/records/repository-record.test.ts`     | `src/private/records/readRepositoryRecord.test.ts`   |
| `src/private/store/checkout-store.test.ts`          | `src/private/store/createCheckoutStore.test.ts`      |

### Do NOT rename

- `src/private/store/create-checkout.test.ts` — already conformant (`createCheckout.test.ts`)
- `src/test/*` — helpers have no dedicated test files

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report" section.
- RULE: Touch ONLY the test files listed under `## Changes`. Do not modify production modules or their behavior.
- RULE: Preserve every test expectation verbatim — only move tests and remove `.only` calls.
- RULE: Update imports inside each moved test file to the renamed source modules (e.g. `getCurrentBranch` from `./getCurrentBranch`, `runBranch` from `../runBranch`).
- RULE: Use `git mv` for plain renames; create the new split files with `git mv` + content edits where practical.
- RULE: Coverage thresholds must hold after the split: lines 70 / functions 70 / branches 60 / statements 70. Previously-skipped tests now count toward coverage.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Split `src/private/git/git.test.ts` into 8 files
Step 2. Split `src/commands/branch/branch.test.ts` into 3 files
Step 3. Split `src/private/records/checkout-record.test.ts` and `src/config/config.test.ts`
Step 4. Rename the remaining test files
Step 5. Run full validation

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `$PACKAGE` to validate format, lint, and typecheck
- Execute `npm run test` in `$PACKAGE` to run the unit tests

## Steps

### Step 1 / 5 — Split `src/private/git/git.test.ts`

Move each of the 8 describes into its own file per the table above. Remove `describe.only`. Verify the moved tests import only what they use — drop unused imports (lint enforces).

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE` — confirm the 12 previously-skipped git tests now run (git-related test count grows from 2 to 14)

### Step 2 / 5 — Split `src/commands/branch/branch.test.ts`

Move each of the 3 describes into its own file per the table above. Remove the two `it.only` calls.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE` — confirm the 6 previously-skipped branch tests now run (branch-related test count grows from 2 to 8)

### Step 3 / 5 — Split `src/private/records/checkout-record.test.ts` and `src/config/config.test.ts`

Move the describes/tests per the tables above. Delete the originals.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`

### Step 4 / 5 — Rename the remaining test files

Use `git mv` per the rename table.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`

### Step 5 / 5 — Full validation

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Execute `npm run test:coverage` in `$PACKAGE` — thresholds lines 70 / functions 70 / branches 60 / statements 70

## Final Verification

**Sanity check**

`git status` in `$PACKAGE` shows only test-file moves and splits. The full test suite runs more tests than before the split: 14 git tests + 8 branch tests now execute instead of being silenced by `.only`.

**Verification steps**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Execute `npm run test:coverage` in `$PACKAGE`
- Commit in the artificial repo with the single message `refactor(workspace-cli): rename and split test files, one function tested per file` and push to `origin main`. If the pre-commit hook blocks, fix the issue and create a new commit — do not amend.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `_backlog/3-now/plan-refactor-conventions/instructions/split-test-files__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `split-test-files`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
