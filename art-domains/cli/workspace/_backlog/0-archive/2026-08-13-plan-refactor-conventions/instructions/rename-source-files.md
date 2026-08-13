# Instruction: Rename Source Files

**Plan:** `refactor-conventions`

**commit.Id:** `rename-source-files`

**Package:** `$PACKAGE` = `repos/artificial/art-domains/cli/workspace` (relative to the workspace root). All file paths in this instruction are relative to `$PACKAGE`; run npm commands in `$PACKAGE`.

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `rename-source-files`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Rename every source file under `src/` whose filename does not match its single exported function in camelCase. Pure moves only — after the rename the codebase must lint, build, and test green with zero behavior changes.

## Mandatory Reading

- `package.json` — scripts: `lint`, `build`, `test`, `test:coverage`
- `_backlog/3-now/plan-refactor-conventions/plan.md` — commit boundaries and context
- `src/index.ts` — entry point wiring the renamed command/config modules
- `src/config/index.ts` — config barrel exporting the renamed config modules

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Rename the files below with `git mv` and update every import statement referencing the old path. All renames are pure moves — do NOT change function names, exports, import symbols, or behavior.

### `src/private/`

| current                                        | new                                   |
| ---------------------------------------------- | ------------------------------------- |
| `private/context/workspace-context.ts`         | `createWorkspaceContext.ts`           |
| `private/git/get-current-branch.ts`            | `getCurrentBranch.ts`                 |
| `private/git/get-remote-branch.ts`             | `getRemoteBranch.ts`                  |
| `private/git/get-unpushed-count.ts`            | `getUnpushedCount.ts`                 |
| `private/git/has-local-branch.ts`              | `hasLocalBranch.ts`                   |
| `private/git/has-merge-conflicts.ts`           | `hasMergeConflicts.ts`                |
| `private/git/is-detached-head.ts`              | `isDetachedHead.ts`                   |
| `private/log/operations-log.ts`                | `createOperationsLog.ts`              |
| `private/operations/create-branch-failure.ts`  | `createBranchFailure.ts`              |
| `private/operations/create-branch-success.ts`  | `createBranchSuccess.ts`              |
| `private/operations/create-clone-failure.ts`   | `createCloneFailure.ts`               |
| `private/operations/create-clone-success.ts`   | `createCloneSuccess.ts`               |
| `private/operations/create-push-failure.ts`    | `createPushFailure.ts`                |
| `private/operations/create-push-success.ts`    | `createPushSuccess.ts`                |
| `private/present/present-checkout-report.ts`   | `presentCheckoutReport.ts`            |
| `private/present/present-extraneous-report.ts` | `presentExtraneousReport.ts`          |
| `private/present/present-operations-report.ts` | `presentOperationsReport.ts`          |
| `private/records/load-checkout-records.ts`     | `loadCheckoutRecords.ts`              |
| `private/records/load-repository-rercords.ts`  | `loadRepositoryRecords.ts` (typo fix) |
| `private/records/read-checkout-record.ts`      | `readCheckoutRecord.ts`               |
| `private/records/read-repository-record.ts`    | `readRepositoryRecord.ts`             |
| `private/records/save-checkout-record.ts`      | `saveCheckoutRecord.ts`               |
| `private/store/checkout-store.ts`              | `createCheckoutStore.ts`              |
| `private/store/create-checkout-location.ts`    | `createCheckoutLocation.ts`           |
| `private/store/hydrate-store-from-records.ts`  | `hydrateStoreFromRecords.ts`          |
| `private/store/safe-path.ts`                   | `safePath.ts`                         |

### `src/shared/` and `src/config/`

| current                               | new                         |
| ------------------------------------- | --------------------------- |
| `shared/scan-all-checkouts-states.ts` | `scanAllCheckoutsStates.ts` |
| `shared/scan-checkout-state.ts`       | `scanCheckoutState.ts`      |
| `config/load-config.ts`               | `loadWorkspaceConfig.ts`    |

### `src/commands/`

| current                                              | new                       |
| ---------------------------------------------------- | ------------------------- |
| `commands/branch/branch.ts`                          | `runBranch.ts`            |
| `commands/branch/private/create-or-switch-branch.ts` | `createOrSwitchBranch.ts` |
| `commands/clone/clone.ts`                            | `runClone.ts`             |
| `commands/clone/clone-all.ts`                        | `cloneAll.ts`             |
| `commands/clone/clone-specific.ts`                   | `cloneSpecific.ts`        |
| `commands/clone/clone-status.ts`                     | `cloneStatus.ts`          |
| `commands/clone/private/clone-if-missing.ts`         | `cloneIfMissing.ts`       |
| `commands/link/link.ts`                              | `runLink.ts`              |
| `commands/publish/publish.ts`                        | `runPublish.ts`           |
| `commands/sanity/sanity.ts`                          | `runSanity.ts`            |
| `commands/sanity/private/does-issue-block-push.ts`   | `doesIssueBlockPush.ts`   |
| `commands/sanity/private/push-checkout.ts`           | `pushCheckout.ts`         |
| `commands/sanity/private/push-clean-checkouts.ts`    | `pushCleanCheckouts.ts`   |
| `commands/sanity/private/should-push-checkout.ts`    | `shouldPushCheckout.ts`   |
| `commands/unlink/unlink.ts`                          | `runUnlink.ts`            |

### `src/test/`

| current                         | new                      |
| ------------------------------- | ------------------------ |
| `test/init-bare-repo.ts`        | `initBareRepo.ts`        |
| `test/init-repo.ts`             | `initGitRepo.ts`         |
| `test/init-working-repo.ts`     | `initWorkingRepo.ts`     |
| `test/make-temp-dir.ts`         | `makeTempDir.ts`         |
| `test/remove-temp-dirs.ts`      | `removeTempDirs.ts`      |
| `test/write-checkout-record.ts` | `writeCheckoutRecord.ts` |
| `test/write-repo-record.ts`     | `writeRepoRecord.ts`     |

### Do NOT rename

- `src/index.ts`, `src/config/index.ts` — entry points/barrels
- `src/config/types.ts`, `src/private/operations/types.ts`, `src/private/records/types.ts`, `src/shared/types.ts` — type-only modules
- Already conformant: `src/config/define-config.ts`, `src/private/git/has-remote.ts`, `src/private/git/is-dirty.ts`, `src/private/present/format-table.ts`, `src/private/store/create-checkout.ts`, `src/shared/scanExtraneousCheckouts.ts`, `src/test/commit-file.ts`, `src/test/create-command-context.ts`, `src/test/make-config.ts`
- Test files — handled by the `split-test-files` commit

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report" section.
- RULE: Touch ONLY the files listed under `## Changes` (renames plus the import statements that reference them).
- RULE: Do NOT change function names, signatures, exports, or behavior. Use `git mv` so git records the renames.
- RULE: Importers live only under `src/`. Find them with `grep -rn "private/context/workspace-context\|load-repository-rercords\|operations-log\|scan-checkout-state" src` and update each old path to the new path. Repeat per renamed module.
- RULE: Keep the repo conventions: one function per file, tabs, no unused imports (lint enforces), no `console.log` in source.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Rename `src/private/` modules
Step 2. Rename `src/shared/` and `src/config/` modules
Step 3. Rename `src/commands/` modules
Step 4. Rename `src/test/` utilities
Step 5. Update all import statements referencing renamed paths
Step 6. Run full validation

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `$PACKAGE` to validate format, lint, and typecheck (catches broken imports early)
- Execute `npm run test` in `$PACKAGE` in the final step only — unit tests must stay green

## Steps

### Step 1 / 6 — Rename `src/private/` modules

Use `git mv` for each row in the `src/private/` table. After each `git mv`, run `npm run lint` in `$PACKAGE` to confirm no broken imports were introduced before moving on.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`

### Step 2 / 6 — Rename `src/shared/` and `src/config/` modules

Use `git mv` for each row in the `src/shared/` and `src/config/` tables.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`

### Step 3 / 6 — Rename `src/commands/` modules

Use `git mv` for each row in the `src/commands/` table.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`

### Step 4 / 6 — Rename `src/test/` utilities

Use `git mv` for each row in the `src/test/` table.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`

### Step 5 / 6 — Update all imports

Update every import statement under `src/` that references a renamed path. For each renamed module:

1. Grep `src` for the old path segment: `grep -rn "old-path-segment" src`
2. Update each match to the new path segment, keeping the imported symbol names unchanged.
3. Repeat until `grep -rn "old-path-segment" src` returns nothing.

Known importers to watch: `src/index.ts` (commands + config), `src/config/index.ts` (config barrel), all command files under `src/commands/`, `src/shared/scan-all-checkouts-states.ts` and `src/shared/scan-checkout-state.ts` (import from `private/`), and the `src/test/` helpers.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE` — must pass with no errors
- Execute `npm run build` in `$PACKAGE` — must pass

### Step 6 / 6 — Full validation

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Execute `npm run test:coverage` in `$PACKAGE` — thresholds lines 70 / functions 70 / branches 60 / statements 70

## Final Verification

**Sanity check**

`git status` in `$PACKAGE` shows only renames (detected as `R`) plus import-only edits — no new files, no deletions of content, no behavior changes.

**Verification steps**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Execute `npm run test:coverage` in `$PACKAGE`
- Commit in the artificial repo with the single message `refactor(workspace-cli): rename source files to camelCase matching exported function names` and push to `origin main`. If the pre-commit hook blocks, fix the issue and create a new commit — do not amend.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `_backlog/3-now/plan-refactor-conventions/instructions/rename-source-files__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `rename-source-files`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
