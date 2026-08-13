# Sub-Agent REPORT (#producer)

**Plan:** `fix-clone-command-report`

**Instruction Id:** `fix-clone-command-report`

**Outcome:** `COMPLETED`

## Evidence

### Changes

Fixed two bugs in the clone command output:

1. **Bug 1 (duplicate checkout list):** `clone` (no args) was showing the checkout list twice because both `cloneStatus` and `runClone` called `presentCheckoutReport`. Fixed by removing the duplicate call from `runClone`.

2. **Bug 2 (full checkout list on single clone):** `clone <repo>` was showing all recorded checkouts instead of only the cloned one. Fixed by making `cloneSpecific` report only the processed checkout via a new optional filter parameter on `presentCheckoutReport`.

#### Files changed

| file                                           | change                                                                                                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/private/present/presentCheckoutReport.ts` | Added optional `checkouts?: Checkout[]` parameter; uses it when provided, falls back to `ctx.store.getAllCheckouts()` otherwise                                                              |
| `src/commands/clone/cloneSpecific.ts`          | Tracks processed checkout, calls `presentCheckoutReport(ctx, [processedCheckout])` and `presentOperationsReport(ctx.log)` at end; early returns call `presentOperationsReport(ctx.log)` only |
| `src/commands/clone/cloneAll.ts`               | Calls `presentCheckoutReport(ctx)` and `presentOperationsReport(ctx.log)` at end                                                                                                             |
| `src/commands/clone/runClone.ts`               | Removed `presentCheckoutReport` and `presentOperationsReport` calls and their imports; sub-commands now handle their own reporting                                                           |

### Verification

- `npm run build` — passed
- `npm run test` — 152 tests passed (52 test files)
- `npm run lint` (src/) — passed (pre-existing formatting issues in backlog markdown files were fixed)
- `git push` — pushed to `origin/main` as `603b4a4`
