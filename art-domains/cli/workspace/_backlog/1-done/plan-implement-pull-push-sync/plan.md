# Plan: Workspace CLI — Pull, Push, Sync Commands

**ID:** `implement-pull-push-sync`

**Status:** `DONE`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Implement the `pull`, `push`, and `sync` commands for `@art-domains/workspace-cli`. These commands provide cross-repo synchronization capabilities. Also enhance `sanity` command with workspace status and "is behind" detection.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md)

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/commands.md` — command surface and BDD scenarios
- `architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan, implementation-instruction, delegation, and report definitions.

## Scaffold + Tests Strategy

Before writing implementation code, the worker MUST establish the test scaffolds and contracts. This ensures the implementation is driven by the BDD scenarios and conventions already defined in the architecture.

### Learnings from repo command implementation

The repo command was implemented with the following patterns (commit `76cd4b4`):

- **Test-first approach with pending tests** — 35 pending tests created in step 2, but worker never implemented actual tests (chronic case of missing tests). This is a lesson learned: **tests MUST be implemented, not just scaffolded**.
- **Test helper pattern** — Created `src/test/writeProjectRecord.ts` similar to `writeCheckoutRecord.ts`
- **Singular/plural pattern** — `readProjectRecord` / `readProjectRecords` works well for record reading functions
- **6-step workflow** — Refactor → Test Scaffolds → Define Contracts → Implement Core → Implement Command → Wire to CLI
- **All CI steps passed** — 9/9 tasks successful

### Critical Lesson: Implement Tests, Don't Just Scaffold

The worker created 35 `it.todo()` tests but never implemented them. This is unacceptable. The instruction file MUST:

1. Create test scaffolds with `it.todo()` in step 2
2. **Implement all tests** in subsequent steps (not just scaffold them)
3. Verify no `it.todo()` tests remain in final verification

### Pre-work: Enhance scan functions

Add support for "is behind" detection and workspace root scanning:

- Add `getBehindCount(dir, remoteBranch)` function to `src/private/git/`
- Add `isBehind` field to `Checkout` type in `src/private/store/createCheckout.ts` (the `Checkout` interface lives there — NOT in `src/private/scan/types.ts`)
- Add `getBehindCount` to `src/private/scan/scanCheckoutState.ts`
- `src/private/scan/scanWorkspaceState.ts` ALREADY EXISTS (landed in commit `51cad48`) — commit 1 must UPDATE it to add `isBehind` detection, not create it
- `src/private/present/presentWorkspaceReport.ts` ALREADY EXISTS (landed in commit `51cad48`) — commit 1 must UPDATE it as needed, not create it

### Test File Structure

Create test files following the existing patterns in `src/`:

- `src/commands/pull/runPull.test.ts` — unit tests for the pull command
- `src/commands/push/runPush.test.ts` — unit tests for the push command
- `src/commands/sync/runSync.test.ts` — unit tests for the sync command
- `src/private/scan/scanWorkspaceState.test.ts` — unit tests for workspace state scanning
- `src/private/present/presentWorkspaceReport.test.ts` — unit tests for presenting the Workspace Report
- `src/private/git/getBehindCount.test.ts` — unit tests for behind count detection
- `src/private/scan/isCleanCheckout.test.ts` — unit tests for clean checkout check
- `src/private/git/pullCheckout.test.ts` — unit tests for pull checkout function

### Test-First Approach

1. **Read BDD scenarios** from `architecture/commands.md` → Pull, Push, Sync, Sanity sections
2. **Create test scaffolds** with pending tests for each BDD scenario
3. **Define contracts** (types, interfaces) before implementation:
   - `isBehind` field for `Checkout` type
   - `getBehindCount(dir, remoteBranch)` function signature
   - `scanWorkspaceState(ctx)` function signature
   - `isCleanCheckout(checkout)` function signature
   - `pullCheckout(ctx, checkout)` function signature
   - `presentWorkspaceReport(workspace)` function signature
4. **Implement incrementally** to make each test pass
5. **Verify edge cases** are covered by tests (dirty checkouts, no remote, detached HEAD, merge conflicts)

### Conventions to Follow

- **One function per file** — Each function gets its own file (e.g., `isCleanCheckout.ts`, `pullCheckout.ts`)
- **camelCase file names** — Function files use camelCase matching the function name (e.g., `isCleanCheckout.ts`)
- **Singular/plural pattern** — For record reading functions (e.g., `readProjectRecord` / `readProjectRecords`)
- Use existing test patterns from `src/commands/clone/` and `src/commands/branch/`
- Follow the data flow pattern: load config → create context → hydrate → execute → present reports
- Use operation log factories from `src/private/operations/` for pull operations
- Use report presentation patterns from `src/private/present/`
- Workspace root checkout is temporary (not persisted, not merged into store)
- **Tests MUST be implemented, not just scaffolded** — No `it.todo()` in final verification

## SETUP

Before starting work, execute the setup steps defined in `_guide.md`:

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Iterations

### `pull-push-sync-command` - `DONE`

**Commit Message:** `feat(workspace-cli): implement pull, push, sync commands`

**Instructions File:** `_backlog/4-next/plan-implement-pull-push-sync/instructions/pull-push-sync-command.md`

**Commit:** `ef8a2cf` (`feat(workspace-cli): implement pull, push, sync commands`), pushed to `origin/main`.

**Report:** `_backlog/4-next/plan-implement-pull-push-sync/instructions/pull-push-sync-command__report.md`

**Evidence:**

- `src/commands/pull/runPull.ts`, `src/commands/push/runPush.ts`, `src/commands/sync/runSync.ts` — pull, push, sync handlers with BDD scenario tests
- `src/private/git/getBehindCount.ts`, `src/private/git/pullCheckout.ts`, `src/private/scan/isCleanCheckout.ts` — core helper functions
- `isBehind` on `Checkout` + behind detection in `scanCheckoutState` / `scanWorkspaceState`
- `src/private/operations/createPullSuccess.ts` / `createPullFailure.ts` and pull operation factories
- `src/index.ts` — registered `pull`, `push`, `sync` commands
- Verification: package + monorepo `npm run ci` green (186/186 tests, no `it.todo()` remaining)

Implement `art-workspace pull`, `art-workspace push`, and `art-workspace sync` commands.

**Use case:**

- `art-workspace pull` → pull from origin for all clean checkouts
- `art-workspace push` → push to origin for all clean checkouts (try pull first if behind)
- `art-workspace sync` → pull then push for all clean checkouts

**Responsibilities:**

- Scan workspace root status (temporary checkout, not persisted)
- Detect "is behind" state for checkouts
- Implement `isCleanCheckout` helper function
- Implement `pullCheckout` helper function
- Implement `pull`, `push`, `sync` command handlers
- Present Workspace Report before Checkout Report
- Handle edge cases: dirty checkouts, no remote, detached HEAD, merge conflicts

**Edge cases:**

- Checkout not cloned → skip with warning.
- Checkout has no remote → skip, report state "no remote".
- Checkout is dirty (uncommitted changes) → skip, keep "uncommitted files" state.
- Checkout has merge conflicts → skip, report state "merge conflicts".
- Pull fails → log failure, skip push for this checkout (push command).
- Push fails → log failure, continue with other checkouts.

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → pull, push, sync commands.

**BDD:** `architecture/commands.md` → Pull, Push, Sync sections.

### `sanity-enhancement` - `DONE`

**Commit Message:** `feat(workspace-cli): enhance sanity with workspace status and is behind detection`

**Instructions File:** `_backlog/4-next/plan-implement-pull-push-sync/instructions/sanity-enhancement.md`

**Commit:** `51cd680` (`feat(workspace-cli): enhance sanity with workspace status and is behind detection`), pushed to `origin/main`.

**Report:** `_backlog/4-next/plan-implement-pull-push-sync/instructions/sanity-enhancement__report.md`

**Evidence:**

- `src/commands/sanity/private/pullWorkspaceCheckout.ts` — pull workspace root when clean and behind; logs success/failure; updates `ctx.workspace` only (temporary checkout, never merged into store)
- `runSanity --auto` — calls `pullWorkspaceCheckout` before `pushCleanCheckouts`
- Tests: `pullWorkspaceCheckout.test.ts` (5), `runSanity.test.ts` BDD scenarios (4) — 195/195 green, no `it.todo()`
- `pull`, `push`, `sync` commands untouched (belong to the previous commit)

Enhance `art-workspace sanity` command with workspace status and "is behind" detection.

**Use case:**

- `art-workspace sanity` → show workspace status before checkout status
- `art-workspace sanity --auto` → pull if behind (before pushing) if clean

**Responsibilities:**

- Create temporary workspace checkout (not persisted, not merged into store)
- Scan workspace root state
- Present Workspace Report before Checkout Report
- Pull if behind in `sanity --auto` (before pushing)

**Already landed in commit `51cad48`:** temporary workspace checkout, workspace root scan (`scanWorkspaceState`), Workspace Report presentation, and the `runSanity` wiring. This commit adds the remaining `--auto` pull behavior (`pullWorkspaceCheckout`) plus the BDD scenario tests. The "is behind" scan infrastructure itself comes from the `pull-push-sync-command` commit.

**Edge cases:**

- Workspace root has no remote → report state "no remote"
- Workspace root is detached → report state "detached HEAD"
- Workspace root has conflicts → report state "merge conflicts"
- Workspace root pull fails → log failure, continue with other operations

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → sanity command.

**BDD:** `architecture/commands.md` → Sanity section.

## Final Verification

After implementation, execute the verification steps defined in `_guide.md`:

Run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

All steps MUST pass. If any step fails, fix the issue before considering the task complete.

## Feedback

### From `pull-push-sync-command` (worker, commit `ef8a2cf`)

- **Step 3 "Define contracts" conflicts with live ESLint** — stubs with empty bodies / unused params fail `npm run lint` (`@typescript-eslint/no-unused-vars`). Merging the stub step into implementation (steps 3+4) resolves it; step order is fine, but the step-3 verification (lint green) can only pass with full bodies.
- **`push`/`sync` test setups need divergence** — `push` "tries pull first if behind" needs a diverged (ahead AND behind) setup, and `sync` "clean checkouts" needs divergence so a push operation is actually logged. Explicit `git fetch` is required because behind detection reads local remote-tracking refs.
- **`simple-git` blocks `git config` writes** by default (block-unsafe-operations plugin); test setups must not call `addConfig('core.editor', ...)`.
- **Crew note** — `rg` is not installed in this environment; use `grep`. `npm run test` in the package dir is the fastest signal; the monorepo `npm run ci` is the final gate.

**Planner reflection:** `pull-push-sync-command` is DONE (`ef8a2cf`). `sanity-enhancement` remains READY — apply the ESLint step + divergence feedback when refining that instruction.

### From `sanity-enhancement` (worker, commit `51cd680`)

- **Test setups need an explicit `git fetch`** after advancing origin — behind detection reads the local remote-tracking ref (`origin/main`), so without a fetch `isBehind` stays `false` and the behind state is never detected.
- **Workspace-root test setup must stay clean** — `writeRepoRecord`/`writeCheckoutRecord` and a nested checkout under `repos/` make the root dirty, which skips the pull before it can fail; commit the records plus a `.gitignore` for `repos/` so the pull is attempted.
- **ESLint rejects non-null assertions** (`@typescript-eslint/no-non-null-assertion`) — use `expect(...).toBeDefined()` + optional chaining instead of `ctx.workspace!.isBehind`. Same divergence as on `pull-push-sync-command`.
- **`git status` treats untracked nested git repos as dirt** — any test placing a checkout inside a workspace-root repo must neutralize the untracked paths (gitignore + commit, or `.git/info/exclude`).

**Planner reflection:** `sanity-enhancement` is DONE (`51cd680`). All iterations of this plan are complete — marking the plan DONE.

## Follow ups

- This command is prerequisite for `publish` command.
- Consider adding `--force` flag to pull/push/sync commands for dirty checkouts.
