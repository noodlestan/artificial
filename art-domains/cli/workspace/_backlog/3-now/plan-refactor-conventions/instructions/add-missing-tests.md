# Instruction: `add-missing-tests`

## Goal

Add at least one minimum test per untested production file under `src/`. Do NOT add tests for the explicitly-listed skip files (entry points, barrels, type-only modules, test helpers). Do NOT change production behavior.

## Dependency

Run AFTER `rename-remaining-files` is committed. All paths below use the post-rename camelCase filenames (e.g. `createCheckout.ts`, not `create-checkout.ts`). If the rename commit is not applied yet, delegate it first.

## Scope

`$SCOPE` = `repos/artificial/art-domains/cli/workspace/src`

## Pattern to follow

Study `src/private/operations/createBranchSuccess.test.ts` (factory pattern) and `src/private/git/getUnpushedCount.test.ts` (real-git pattern). Use the existing test helpers:

- `src/test/makeTempDir.ts`, `src/test/removeTempDirs.ts` — temp dir lifecycle (`afterEach` cleanup)
- `src/test/initBareRepo.ts`, `src/test/initGitRepo.ts`, `src/test/initWorkingRepo.ts` — repo fixtures
- `src/test/commitFile.ts` — initial commit before pushing
- `src/test/createCommandContext.ts`, `src/test/makeConfig.ts` — context/config fixtures
- `src/test/writeCheckoutRecord.ts`, `src/test/writeRepoRecord.ts` — record fixtures

## Files to test (23) — minimum one test each

### Commands (`src/commands/`)

| File | Minimum test suggestion |
| --- | --- |
| `src/commands/branch/private/createOrSwitchBranch.ts` | creates a branch in a working repo → returns `'created'`; second call switches → `'switched'` |
| `src/commands/clone/cloneAll.ts` | no-op with an empty repos list (no checkouts added, nothing cloned) |
| `src/commands/clone/cloneSpecific.ts` | unknown repo → logs failure containing `unknown repo "..."` |
| `src/commands/clone/cloneStatus.ts` | runs without error on an empty store (spy `console.info` if needed) |
| `src/commands/clone/private/cloneIfMissing.ts` | checkout without a repo → returns `null` |
| `src/commands/sanity/private/doesIssueBlockPush.ts` | returns `true` for `'merge conflicts'`, `false` for a clean string |
| `src/commands/sanity/private/pushCheckout.ts` | pushing a checkout with no remote → logs a failure operation |
| `src/commands/sanity/private/pushCleanCheckouts.ts` | no-op when the store has no checkouts |
| `src/commands/sanity/private/shouldPushCheckout.ts` | `false` when a blocking issue is present; `true` for a clean checkout with unpushed commits |

### Operations factories (`src/private/operations/`)

| File | Minimum test suggestion |
| --- | --- |
| `src/private/operations/createCloneFailure.ts` | `message()` contains the repo name; `errorSerialized()` contains `CloneError` |
| `src/private/operations/createCloneSuccess.ts` | `message()` is `` `to ${location}` `` |
| `src/private/operations/createPushFailure.ts` | `message()` extracts the reason; `errorSerialized()` contains `PushError` |
| `src/private/operations/createPushSuccess.ts` | `message()` is `` `to origin/${branch}` `` |

### Presenters (`src/private/present/`)

| File | Minimum test suggestion |
| --- | --- |
| `src/private/present/formatTable.ts` | pads columns: headers + rows produce aligned output |
| `src/private/present/presentCheckoutReport.ts` | calls `console.info` with `'Checkouts:'` (spy) |
| `src/private/present/presentExtraneousReport.ts` | no output when no extraneous checkouts; prints `'Untracked:'` otherwise |
| `src/private/present/presentOperationsReport.ts` | no output when the log is empty; prints `'Operations Report:'` otherwise |

### Store (`src/private/store/`)

| File | Minimum test suggestion |
| --- | --- |
| `src/private/store/createCheckoutLocation.ts` | `'repo name'` + target → sanitized location (`safePath` applied) |
| `src/private/store/hydrateStoreFromRecords.ts` | store populated with a checkout per record |
| `src/private/store/safePath.ts` | lowercase, non-alphanumerics → `-`, hyphens collapsed |

### Shared (`src/shared/`)

| File | Minimum test suggestion |
| --- | --- |
| `src/shared/scanAllCheckoutsStates.ts` | no-op on an empty store |
| `src/shared/scanCheckoutState.ts` | missing dir → `exists: false`, `issues: ['not cloned']` |
| `src/shared/scanExtraneousCheckouts.ts` | empty checkouts dir → no extraneous entries |

## Do NOT test (skip files)

- `src/index.ts` — CLI entry point: commander wiring + `program.parse()`. Testing would require spawning a process; leave untested (entry-point convention).
- `src/config/index.ts` — barrel re-export only; no logic.
- `src/config/types.ts`, `src/private/operations/types.ts`, `src/private/records/types.ts`, `src/shared/types.ts` — type-only modules; no runtime behavior.
- `src/test/*` helpers (`commitFile`, `createCommandContext`, `initBareRepo`, `initGitRepo`, `initWorkingRepo`, `makeConfig`, `makeTempDir`, `removeTempDirs`, `writeCheckoutRecord`, `writeRepoRecord`) — test utilities, not production code; already exercised indirectly by every test that uses them.

## Steps

1. Verify the current test state: `npm run test` — 26 files, 82 tests, 0 skipped, all passing. This is the baseline.
2. Confirm the rename commit is applied: `find src -name "*-*"` returns nothing.
3. Add the 23 test files listed above (one per row). Each file: exactly one focused test at minimum — do not pad with extra cases; keep it minimal but meaningful (assert actual behavior, not trivial truthiness).
4. Validate per step:
   - `npm run lint` — clean (prettier, eslint, tsc)
   - `npm run build` — clean
5. Run the full suite: `npm run test` — expect ≥ 105 tests (82 + at least one per new file), 0 skipped, all passing.
6. Run coverage: `npm run test:coverage` — must stay above thresholds (they only rise; the new files must be covered by their own tests, so coverage grows).
7. Commit:
   ```
   git add -A $SCOPE && git commit --no-verify -m "test(workspace-cli): add minimum test per untested production file" && git push origin main
   ```

## Do NOT

- Do NOT modify any production file (unless a test exposes a clear bug — in that case STOP and report it in the report file instead of fixing).
- Do NOT add tests to the skip files listed above.
- Do NOT touch `architecture/commands.md` (uncommitted WIP, unrelated).
- Do NOT run the CLI itself (entry point is untested by design).
