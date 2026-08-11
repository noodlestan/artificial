# Instruction: Refactor Commands

**Plan:** `workspace-cli`

**Commit:** `refactor-commands`

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `refactor-commands`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Restructure the workspace CLI codebase to match the new pseudo specs (`ops/_pseudo.md`). This instruction covers two commits:

1. **Filesystem restructure** — one command per directory, one function per file, helpers in private, shared types extracted.
2. **Data model implementation** — WorkspaceContext, CheckoutStore, OperationsLog, scanCheckout, typed operations, always full table.

## Mandatory Reading

- `ops/_pseudo.md` — the source of truth for data structures, use cases, and auxiliary functions
- `ops/_architect.md` — principles, NFRs, use cases, definitions
- `ops/_adr/execution-model.art` — imperative-first execution model
- `ops/_adr/cli.art` — CLI tech stack decisions

## Commit 1: Filesystem Restructure

Reorganise the source tree to: one command directory per command, one function per file, helpers nested under private, shared types extracted.

### Expected Filesystem Layout

```
repos/artificial/art-domains/cli/workspace/src/
├── index.ts                              # CLI entry point, commander routing
├── config/
│   ├── types.ts                          # WorkspaceConfig, RepositoryRecord, CheckoutRecord
│   ├── define-config.ts                  # defineConfig helper
│   ├── load-config.ts                    # loadWorkspaceConfig (esbuild bundle-at-runtime)
│   ├── load-repositories.ts              # loadRepositories(config, root)
│   ├── load-checkouts.ts                 # loadCheckouts(config, root)
│   └── config.test.ts                    # config tests
├── clone/
│   ├── clone.ts                          # clone command handler
│   ├── clone-all.ts                      # clone --all logic
│   ├── clone-specific.ts                 # clone <repo> logic
│   ├── clone-status.ts                   # clone (no args) logic
│   ├── clone.test.ts                     # clone tests
│   └── private/
│       ├── default-location.ts           # defaultLocation(repo)
│       └── clone-repo.ts                 # cloneRepo(location, remote)
├── sanity/
│   ├── sanity.ts                         # sanity command handler
│   ├── sanity.test.ts                    # sanity tests
│   └── private/
│       └── push-clean.ts                 # pushCleanRepos(ctx) logic
├── branch/
│   ├── branch.ts                         # branch command handler
│   └── branch.test.ts
├── link/
│   ├── link.ts                           # link command handler
│   └── link.test.ts
├── unlink/
│   ├── unlink.ts                         # unlink command handler
│   └── unlink.test.ts
├── publish/
│   ├── publish.ts                        # publish command handler
│   └── publish.test.ts
├── shared/
│   ├── types.ts                          # Shared types (CheckoutState, OperationType, etc.)
│   ├── workspace-context.ts              # WorkspaceContext type + createWorkspaceContext
│   ├── checkout-store.ts                 # CheckoutStore type + API
│   ├── checkout.ts                       # Checkout type (data only, no methods)
│   ├── operations-log.ts                 # OperationsLog type + API
│   ├── operation.ts                      # Operation type
│   ├── scan-checkout.ts                  # scanCheckout(ctx, checkout) — standalone function
│   ├── sync-records.ts                   # syncRecords(store, config, root)
│   └── shared.test.ts                    # shared module tests
└── private/
    ├── records/
    │   ├── repository-record.ts          # readRepositoryRecord(file)
    │   └── checkout-record.ts            # saveCheckoutRecord, readCheckoutRecord
    └── git/
        ├── get-current-branch.ts         # getCurrentBranch(dir)
        ├── is-detached-head.ts           # isDetachedHead(dir)
        ├── has-merge-conflicts.ts        # hasMergeConflicts(dir)
        ├── is-dirty.ts                   # isDirty(dir)
        ├── has-remote.ts                 # hasRemote(dir)
        ├── get-unpushed-count.ts         # getUnpushedCount(dir)
        └── git.test.ts                   # git helper tests
```

### Rules for Commit 1

- RULE: Move existing code into the new structure. Do not rewrite logic yet — that's Commit 2.
- RULE: Each file contains exactly one exported function or type.
- RULE: Helpers that are used by only one command go under that command's `private/`. Helpers shared across commands go under `shared/`.
- RULE: Tests collocate with their source file (e.g., `clone.ts` → `clone.test.ts`).
- RULE: Update all import paths to reflect the new structure.
- RULE: All existing tests must pass after the restructure.

## Commit 2: Data Model Implementation

Implement the new data model per `ops/_pseudo.md` and refactor clone/sanity to use it.

### Changes

1. **Data structures** — implement in `shared/`:
   - `WorkspaceContext` — single object passed to all routines
   - `CheckoutStore` — `addCheckout`, `loadExistingCheckouts`, `findCheckout` (case-insensitive), `getCheckout`, `setCheckout`, `getAllCheckouts`, `markExtraneous`, `getExtraneous`, `syncRecords`
   - `Checkout` — pure data: `repo`, `record`, `exists`, `branch`, `detached`, `conflicts`, `dirty`, `hasRemote`, `unpushed`, `issues`, `extraneous`; convenience accessors `name` (lowercase), `location`, `branch`
   - `OperationsLog` — `cloned()`, `pushed()`, `published()`, `branchCreated()`, `linked()`, `unlinked()`, `all()`, `since(ts)`, `latest(n)`
   - `Operation` — `ts`, `repo`, `operation`, `detail`

2. **scanCheckout** — standalone function in `shared/scan-checkout.ts`:
   - Takes `(ctx, checkout)`, reads git state, creates new checkout instance, calls `ctx.store.setCheckout(updated)`, returns updated checkout
   - Sets: `exists`, `branch`, `detached`, `conflicts`, `dirty`, `hasRemote`, `unpushed`, `issues`

3. **Clone refactor** — per `ops/_pseudo.md` use case:
   - `clone --all`: load repos, load existing checkouts into store, iterate repos, `findCheckout` (case-insensitive), `addCheckout` if missing, `scanCheckout`, clone if missing, log `cloned`, `syncRecords` at end
   - `clone <repo>`: same flow for single repo, support `target` override
   - `clone` (no args): `loadExistingCheckouts`, `scanAllCheckouts`, `scanExtraneousCheckouts`, present Checkout Report + Extraneous Report

4. **Sanity refactor** — per `ops/_pseudo.md` use case:
   - `loadExistingCheckouts`, `scanAllCheckouts`, `scanExtraneousCheckouts`
   - If `--auto`: push clean repos (not dirty, has remote, unpushed > 0), create new checkout instance with `unpushed: 0`, `setCheckout`, log `pushed`
   - `syncRecords` if `--auto`

5. **Reports** — always full table, no collapsing:
   - Checkout Report: `repo | location | branch | issues`
   - Operations Report: `repo | operation | detail` (omitted when empty)
   - Extraneous Report: `directory | branch | issues` (omitted when empty)

6. **Name matching** — case-insensitive via `findCheckout`; package names (`@noodlestan/...`) interchangeable with repo names (extract name after `/`)

### Rules for Commit 2

- RULE: Follow `ops/_pseudo.md` as the source of truth for data structures and flows.
- RULE: No direct mutation of checkout instances — always create new via spread and `setCheckout`.
- RULE: `syncRecords()` called at end of mutating commands, not per-mutation.
- RULE: All tests must pass. Add new tests for: WorkspaceContext creation, CheckoutStore operations, scanCheckout mutations, OperationsLog recording, case-insensitive lookup, report formatting.
- RULE: Coverage floor: 70% statements, 70% functions, 60% branches, 70% lines.

## Final Verification

**Sanity check:**
- `art-workspace clone --all` shows full Checkout Report table (no "All repos are green ✓")
- `art-workspace clone artificial` works (case-insensitive)
- `art-workspace clone` shows Checkout Report + Extraneous Report
- `art-workspace sanity` shows Checkout Report
- `art-workspace sanity --auto` pushes and shows Operations Report

**Verification steps:**
- Execute `npm run lint` in the workspace CLI package
- Execute `npm run build` in the workspace CLI package
- Execute `npm run test` in the workspace CLI package
- Execute `npm run ci` in the workspace CLI package
- Bump version in `package.json`
- Publish to npm
- Bump root `package.json` devDependency

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-workspace-cli/instructions/refactor-commands__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `refactor-commands`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
