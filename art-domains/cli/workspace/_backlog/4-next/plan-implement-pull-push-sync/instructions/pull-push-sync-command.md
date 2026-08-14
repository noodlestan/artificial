# Implementation Instructions

**Plan:** `implement-pull-push-sync`

**commit.Id:** `pull-push-sync-command`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md`) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `pull-push-sync-command`, created `pull, push, sync commands implementation`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement the `pull`, `push`, and `sync` commands for `@art-domains/workspace-cli`. These commands provide cross-repo synchronization capabilities. The `sanity` command enhancement (workspace status, "is behind" detection, `--auto` pull) is OUT OF SCOPE — it belongs to the `sanity-enhancement` commit in the plan.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `$PROJECT/architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `$PROJECT/architecture/commands.md` — command surface and BDD scenarios (focus on Pull, Push, Sync, Sanity sections)
- `$PROJECT/architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `$PROJECT/_guide.md` — setup and verification commands

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Enhance scan functions with isBehind support
2. Step 2. Create Test Scaffolds
3. Step 3. Define Contracts
4. Step 4. Implement Core Functions
5. Step 5. Implement pull, push, sync Commands
6. Step 6. Wire Commands to CLI

Execute all the steps autonomously, one by one, including running the **Verification commands** plus any _Verification command_ found at the end of the current step.

### Rules

- RULE: You are FORBIDDEN to return to a previous step.
- RULE: If a verification command reports errors not related to the scope of these instructions, STOP and report back the error, following the "## How to Report Back".
- RULE: If a verification command reports errors related to the scope of these instructions, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back the error, following the "## How to Report Back".
- RULE: **One function per file** — Each function gets its own file (e.g., `isCleanCheckout.ts`, `pullCheckout.ts`)
- RULE: **camelCase file names** — Function files use camelCase matching the function name (e.g., `isCleanCheckout.ts`)
- RULE: **Singular/plural pattern** — For record reading functions (e.g., `readProjectRecord` / `readProjectRecords`)
- RULE: Use existing test patterns from `src/commands/clone/` and `src/commands/branch/`.
- RULE: Use existing record patterns from `src/private/records/repository/` and `src/private/records/checkout/`.
- RULE: Use existing presentation patterns from `src/private/present/`.
- RULE: Workspace root checkout is temporary (not persisted, not merged into store).
- RULE: Each function should be independently testable.
- RULE: **Tests MUST be implemented, not just scaffolded** — No `it.todo()` in final verification.

### Step Verification commands

After each step, run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Changes

- Add `getBehindCount(dir, remoteBranch)` function in `src/private/git/getBehindCount.ts` (in step 1)
- Add `isBehind` field to `Checkout` type in `src/private/scan/types.ts` (in step 1)
- Update `scanCheckoutState` to detect "is behind" state (in step 1)
- Create `src/private/scan/scanWorkspaceState.ts` for workspace root scanning (in step 1)
- Create test files following one-function-per-file pattern (in step 2):
  - `src/commands/pull/runPull.test.ts` — 4 tests from BDD scenarios
  - `src/commands/push/runPush.test.ts` — 5 tests from BDD scenarios
  - `src/commands/sync/runSync.test.ts` — 4 tests from BDD scenarios
  - `src/private/scan/scanWorkspaceState.test.ts` — workspace state tests
  - `src/private/present/presentWorkspaceReport.test.ts` — report tests
  - `src/private/git/getBehindCount.test.ts` — behind count tests
  - `src/private/scan/isCleanCheckout.test.ts` — clean checkout tests
  - `src/private/git/pullCheckout.test.ts` — pull checkout tests
- Define function signatures in separate files (in step 3):
  - `src/private/scan/isCleanCheckout.ts`
  - `src/private/git/pullCheckout.ts`
  - `src/private/present/presentWorkspaceReport.ts`
  - `src/private/git/getBehindCount.ts`
  - `src/private/scan/scanWorkspaceState.ts`
- Implement functions in their respective files (in step 4)
- Implement pull, push, sync command handlers (in step 5)
- Wire commands to CLI entry point (in step 6)

## Step Instructions

### Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

### Step 1/6 — Enhance scan functions with isBehind support

**Goal:** Add support for "is behind" detection and workspace root scanning.

**Instructions:**

1. Add `getBehindCount(dir: string, remoteBranch: string): number` function in `src/private/git/getBehindCount.ts`:
   - Use `git rev-list --count {branch}..origin/{branch}` to get behind count
   - Return 0 if command fails or no remote
2. Add `isBehind` field to `Checkout` type in `src/private/scan/types.ts`:
   ```typescript
   interface Checkout {
     // ... existing fields
     isBehind: boolean;
   }
   ```
3. Update `scanCheckoutState` in `src/private/scan/scanCheckoutState.ts`:
   - After getting `unpushed`, also get `isBehind` using `getBehindCount`
   - Add "is behind" issue when `isBehind` is true
4. Create `src/private/scan/scanWorkspaceState.ts`:
   - Implement `scanWorkspaceState(ctx)` function
   - Create temporary workspace checkout (not persisted, not merged into store)
   - Scan workspace root state
   - Return workspace checkout with updated state

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify scan functions work correctly

### Step 2/6 — Create Test Scaffolds

**Goal:** Establish test files with pending tests for each BDD scenario.

**Instructions:**

1. Read the BDD scenarios from `$PROJECT/architecture/commands.md` → Pull, Push, Sync, Sanity sections
2. Create `src/commands/pull/runPull.test.ts` with pending tests for each scenario:
   - "pull clean checkouts that are behind"
   - "pull skips dirty checkouts"
   - "pull skips checkouts already up to date"
   - "pull skips checkouts not cloned"
3. Create `src/commands/push/runPush.test.ts` with pending tests for each scenario:
   - "push clean checkouts that are ahead"
   - "push tries pull first if behind"
   - "push skips dirty checkouts"
   - "push skips checkouts already up to date"
   - "push skips checkouts not cloned"
4. Create `src/commands/sync/runSync.test.ts` with pending tests for each scenario:
   - "sync clean checkouts"
   - "sync skips dirty checkouts"
   - "sync skips checkouts not cloned"
   - "sync works on up to date checkouts"
5. Create `src/private/scan/scanWorkspaceState.test.ts` with tests for workspace state scanning
6. Create `src/private/present/presentWorkspaceReport.test.ts` with tests for presenting the Workspace Report
7. Create `src/private/git/getBehindCount.test.ts` with tests for behind count detection
8. Create `src/private/scan/isCleanCheckout.test.ts` with tests for clean checkout check
9. Create `src/private/git/pullCheckout.test.ts` with tests for pull checkout function

**CRITICAL:** These are `it.todo()` scaffolds. You MUST implement the actual tests in steps 4-6. Do NOT leave `it.todo()` in final verification.

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify test scaffolds compile

### Step 3/6 — Define Contracts

**Goal:** Define types and interfaces before implementation.

**Instructions:**

1. Define function signatures for helper functions:
   - `isCleanCheckout(checkout: Checkout): boolean` in `src/private/scan/isCleanCheckout.ts`
   - `pullCheckout(ctx: WorkspaceContext, checkout: Checkout): void` in `src/private/git/pullCheckout.ts`
   - `presentWorkspaceReport(workspace: Checkout): void` in `src/private/present/presentWorkspaceReport.ts`
2. Define `getBehindCount` function signature in `src/private/git/getBehindCount.ts`
3. Define `scanWorkspaceState` function signature in `src/private/scan/scanWorkspaceState.ts`

**Extra Verification commands:**

- Execute `npm run lint` in `$PROJECT` to verify types compile

### Step 4/6 — Implement Core Functions and Tests

**Goal:** Implement the core functions and their tests following the pseudo-code.

**Instructions:**

1. Implement `isCleanCheckout(checkout: Checkout): boolean` in `src/private/scan/isCleanCheckout.ts`:
   - Check if checkout exists, not extraneous, not dirty, not conflicts, not detached
   - Implement tests in `src/private/scan/isCleanCheckout.test.ts`
2. Implement `pullCheckout(ctx: WorkspaceContext, checkout: Checkout): void` in `src/private/git/pullCheckout.ts`:
   - Use `simple-git` to pull from origin
   - Update checkout state (clear isBehind issue)
   - Log pull success/failure
   - Implement tests in `src/private/git/pullCheckout.test.ts`
3. Implement `scanWorkspaceState(ctx: WorkspaceContext): Checkout` in `src/private/scan/scanWorkspaceState.ts`:
   - Create temporary workspace checkout
   - Scan workspace root state
   - Return workspace checkout with updated state
   - Implement tests in `src/private/scan/scanWorkspaceState.test.ts`
4. Implement `presentWorkspaceReport(workspace: Checkout): void` in `src/private/present/presentWorkspaceReport.ts`:
   - Present table with 1 row for workspace root
   - Follow existing report presentation patterns
   - Implement tests in `src/private/present/presentWorkspaceReport.test.ts`

**CRITICAL:** You MUST implement the actual tests, not just scaffold them. Verify no `it.todo()` tests remain.

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify core functions and tests pass

### Step 5/6 — Implement pull, push, sync Commands and Tests

**Goal:** Implement the command handlers and their tests.

**Instructions:**

- RULE: **Every executed operation is logged** — pull, push, and sync must each log their successes and failures to the Operations Report (following the `createPushSuccess` / `createPushFailure` factory patterns). No operation is done silently.

1. Create `src/commands/pull/runPull.ts` following the pattern from `clone/runClone.ts`:
   - Scan all checkouts
   - For each checkout: if clean and behind, pull
   - Log each pull success/failure to the Operations Report
   - Present Checkout Report + Operations Report
   - Implement tests in `src/commands/pull/runPull.test.ts` for all 4 BDD scenarios
2. Create `src/commands/push/runPush.ts` following the pattern from `clone/runClone.ts`:
   - Scan all checkouts
   - For each checkout: if clean and ahead, try pull first if behind, then push
   - Log each pull and push success/failure to the Operations Report
   - Present Checkout Report + Operations Report
   - Implement tests in `src/commands/push/runPush.test.ts` for all 5 BDD scenarios
3. Create `src/commands/sync/runSync.ts` following the pattern from `clone/runClone.ts`:
   - Scan all checkouts
   - For each checkout: if clean, pull then push
   - Log each pull and push success/failure to the Operations Report
   - Present Checkout Report + Operations Report
   - Implement tests in `src/commands/sync/runSync.test.ts` for all 4 BDD scenarios

**CRITICAL:** You MUST implement the actual tests, not just scaffold them. Verify no `it.todo()` tests remain.

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify command handlers and tests pass

### Step 6/6 — Wire Commands to CLI

**Goal:** Register the pull, push, sync commands in the CLI entry point.

**Instructions:**

1. Read the CLI entry point (`src/index.ts`)
2. Add the `pull` command registration following the pattern from `clone` and `branch`
3. Add the `push` command registration following the pattern from `clone` and `branch`
4. Add the `sync` command registration following the pattern from `clone` and `branch`
5. Wire the command handlers to the CLI router

**Extra Verification commands:**

- Execute `npm run build` in `$PROJECT` to verify the commands are wired correctly
- Execute `npm run test` in `$PROJECT` to verify all tests pass

### Final Verification

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

**Sanity check**

Verify that:

- The `pull` command pulls clean checkouts that are behind
- The `push` command pushes clean checkouts that are ahead (tries pull first if behind)
- The `sync` command pulls then pushes clean checkouts
- Edge cases are handled correctly (dirty checkouts, no remote, detached HEAD, merge conflicts)
- Every executed operation is logged — pull, push, and sync log their successes and failures to the Operations Report; nothing is done silently
- The `sanity` command is NOT modified — workspace status and `--auto` pull belong to the `sanity-enhancement` commit
- All BDD scenarios from `architecture/commands.md` pass
- **No `it.todo()` tests remain** — all tests must be implemented
- **All test files follow one-function-per-file pattern**

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with `$WORKSPACE/.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `implement-pull-push-sync/instructions/pull-push-sync-command__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `pull-push-sync-command`, created `pull, push, sync commands implementation`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
