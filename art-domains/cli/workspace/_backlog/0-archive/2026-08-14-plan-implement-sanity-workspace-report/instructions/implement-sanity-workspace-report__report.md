# Sub-Agent REPORT (#producer)

**Plan:** `implement-sanity-workspace-report`

**Instruction Id:** `implement-sanity-workspace-report`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Goal                                           | Change                                                                                                  | Status |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| Add workspace field to WorkspaceContext        | Added `workspace?: Checkout` field to interface and optional parameter to constructor                   | Done   |
| Create scanWorkspaceState function             | Created `src/private/scan/scanWorkspaceState.ts` that scans workspace root git state                    | Done   |
| Create presentWorkspaceReport function         | Created `src/private/present/presentWorkspaceReport.ts` that presents "Workspace:" section              | Done   |
| Update runSanity to scan and present workspace | Integrated workspace scanning and presentation before checkout report                                   | Done   |
| Update test helper createCommandContext        | Added optional `workspace?: Checkout` parameter                                                         | Done   |
| Write tests                                    | Added 8 new tests covering scanWorkspaceState, presentWorkspaceReport, and runSanity workspace ordering | Done   |

#### Files changed

- `src/private/context/createWorkspaceContext.ts` — Added `workspace?: Checkout` field to `WorkspaceContext` interface and optional `workspace` parameter to `createWorkspaceContext` function
- `src/private/scan/scanWorkspaceState.ts` — New file: scans workspace root git state (branch, detached, conflicts, dirty, hasRemote, unpushed) and returns a Checkout object
- `src/private/scan/scanWorkspaceState.test.ts` — New file: 4 tests for scanWorkspaceState (clean state, dirty, unpushed, no remote)
- `src/private/present/presentWorkspaceReport.ts` — New file: presents "Workspace:" header with table (repo, location, branch, states)
- `src/private/present/presentWorkspaceReport.test.ts` — New file: 3 tests for presentWorkspaceReport (header/table, issues, missing workspace)
- `src/commands/sanity/runSanity.ts` — Added imports for scanWorkspaceState and presentWorkspaceReport; calls them before checkout scanning/presentation
- `src/commands/sanity/runSanity.test.ts` — Added test verifying workspace report appears before checkout report
- `src/test/createCommandContext.ts` — Added optional `workspace?: Checkout` parameter passed to createWorkspaceContext

### Verification

- `npm run lint` — passed (prettier, eslint, tsc)
- `npm run test` — passed (160 tests, 54 files)
- `npm run build` — passed

### Commits

- `51cad48` — `implement-sanity-workspace-report`

### Push

- Pushed to `origin/main` successfully
