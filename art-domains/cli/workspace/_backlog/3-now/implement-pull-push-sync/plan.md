# Plan: Workspace CLI — Pull, Push, Sync Commands

**ID:** `implement-pull-push-sync`

**Status:** `DRAFT`

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

The repo command was successfully implemented with the following patterns (commit `76cd4b4`):

- **Test-first approach with pending tests** — 35 pending tests created in step 2, implemented incrementally in step 4
- **Test helper pattern** — Created `src/test/writeProjectRecord.ts` similar to `writeCheckoutRecord.ts`
- **Singular/plural pattern** — `readProjectRecord` / `readProjectRecords` works well for record reading functions
- **6-step workflow** — Refactor → Test Scaffolds → Define Contracts → Implement Core → Implement Command → Wire to CLI
- **All CI steps passed** — 9/9 tasks successful

### Pre-work: Enhance scan functions

Add support for "is behind" detection and workspace root scanning:

- Add `getBehindCount(dir, remoteBranch)` function to `src/private/git/`
- Add `isBehind` field to `Checkout` type in `src/private/scan/types.ts`
- Add `getBehindCount` to `src/private/scan/scanCheckoutState.ts`
- Create `src/private/scan/scanWorkspaceState.ts` for workspace root scanning

### Test File Structure

Create test files following the existing patterns in `src/`:

- `src/commands/pull/runPull.test.ts` — unit tests for the pull command
- `src/commands/push/runPush.test.ts` — unit tests for the push command
- `src/commands/sync/runSync.test.ts` — unit tests for the sync command
- `src/private/scan/scanWorkspaceState.test.ts` — unit tests for workspace state scanning
- `src/private/present/presentWorkspaceReport.test.ts` — unit tests for presenting the Workspace Report

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

- Use existing test patterns from `src/commands/clone/` and `src/commands/branch/`
- Follow the data flow pattern: load config → create context → hydrate → execute → present reports
- Use operation log factories from `src/private/operations/` for pull operations
- Use report presentation patterns from `src/private/present/`
- Workspace root checkout is temporary (not persisted, not merged into store)

## SETUP

Before starting work, execute the setup steps defined in `_guide.md`:

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Iterations

### `pull-push-sync-command` - `PLANNED`

**Commit Message:** `feat(workspace-cli): implement pull, push, sync commands`

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

### `sanity-enhancement` - `PLANNED`

**Commit Message:** `feat(workspace-cli): enhance sanity with workspace status and is behind detection`

Enhance `art-workspace sanity` command with workspace status and "is behind" detection.

**Use case:**

- `art-workspace sanity` → show workspace status before checkout status
- `art-workspace sanity --auto` → pull if behind (before pushing) if clean

**Responsibilities:**

- Create temporary workspace checkout (not persisted, not merged into store)
- Scan workspace root state
- Present Workspace Report before Checkout Report
- Pull if behind in `sanity --auto` (before pushing)

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

## Follow ups

- This command is prerequisite for `publish` command.
- Consider adding `--force` flag to pull/push/sync commands for dirty checkouts.
