# Report: `add-missing-tests`

## Outcome

✅ All 23 test files created and committed. Lint, build, and tests all pass.

## Summary

- **Baseline**: 26 test files, 82 tests
- **Final**: 49 test files, 114 tests (32 new tests across 23 new files)
- **Coverage**: 96.23% statements, 85.38% branches, 100% functions
- **Commit**: `2782b2b` — `test(workspace-cli): add minimum test per untested production file`
- **Push**: `origin/main` ✅

## Tests Added

### Commands (9 files)

| File                           | Tests                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `createOrSwitchBranch.test.ts` | creates branch → `'created'`; switches existing → `'switched'`                       |
| `cloneAll.test.ts`             | no-op with empty repos list                                                          |
| `cloneSpecific.test.ts`        | unknown repo → failure with `unknown repo "..."`                                     |
| `cloneStatus.test.ts`          | runs without error on empty store                                                    |
| `cloneIfMissing.test.ts`       | checkout without a repo → returns `null`                                             |
| `doesIssueBlockPush.test.ts`   | `true` for `'merge conflicts'`; `false` for clean string                             |
| `pushCheckout.test.ts`         | no remote → logs failure operation                                                   |
| `pushCleanCheckouts.test.ts`   | no-op when store has no checkouts                                                    |
| `shouldPushCheckout.test.ts`   | `false` when blocking issue present; `true` for clean checkout with unpushed commits |

### Operations (4 files)

| File                         | Tests                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| `createCloneFailure.test.ts` | message contains repo name; errorSerialized contains `CloneError` |
| `createCloneSuccess.test.ts` | message is `to ${location}`                                       |
| `createPushFailure.test.ts`  | message extracts reason; errorSerialized contains `PushError`     |
| `createPushSuccess.test.ts`  | message is `to origin/${branch}`                                  |

### Presenters (4 files)

| File                              | Tests                                                         |
| --------------------------------- | ------------------------------------------------------------- |
| `formatTable.test.ts`             | pads columns to align headers and rows                        |
| `presentCheckoutReport.test.ts`   | calls `console.info` with `'Checkouts:'`                      |
| `presentExtraneousReport.test.ts` | no output when empty; prints `'Untracked:'` otherwise         |
| `presentOperationsReport.test.ts` | no output when empty; prints `'Operations Report:'` otherwise |

### Store (3 files)

| File                              | Tests                                                 |
| --------------------------------- | ----------------------------------------------------- |
| `createCheckoutLocation.test.ts`  | sanitizes repo name; combines name + target           |
| `hydrateStoreFromRecords.test.ts` | populates store with one checkout per record          |
| `safePath.test.ts`                | lowercase, non-alphanumerics → `-`, hyphens collapsed |

### Shared (3 files)

| File                              | Tests                                                   |
| --------------------------------- | ------------------------------------------------------- |
| `scanAllCheckoutsStates.test.ts`  | no-op on empty store                                    |
| `scanCheckoutState.test.ts`       | missing dir → `exists: false`, `issues: ['not cloned']` |
| `scanExtraneousCheckouts.test.ts` | empty checkouts dir → no extraneous entries             |

## Issues Found

None — no production bugs exposed.

## Do NOT

- No production files modified
- No skip files tested
- No `architecture/commands.md` touched
