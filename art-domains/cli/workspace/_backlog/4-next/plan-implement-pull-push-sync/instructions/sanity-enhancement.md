# Implementation Instructions

**Plan:** `implement-pull-push-sync`

**commit.Id:** `sanity-enhancement`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md`) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `sanity-enhancement`, created `sanity --auto` workspace-root pull, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Enhance `art-workspace sanity` with workspace status and "is behind" detection — specifically the remaining `--auto` behavior: pull the workspace root when it is behind and clean, **before** pushing clean unpushed checkouts.

What is ALREADY DONE (commit `51cad48`) and therefore OUT OF SCOPE for this commit:

- `scanWorkspaceState` — workspace root scanning (temporary checkout, not persisted, not merged into store)
- `presentWorkspaceReport` — Workspace Report before Checkout Report
- `runSanity` wiring — scan workspace → scan checkouts → scan extraneous → reports

The shared "is behind" infrastructure is provided by the `pull-push-sync-command` commit (`getBehindCount`, `isBehind` on `Checkout`, `isCleanCheckout`, `createPullSuccess`/`createPullFailure`, `PullSuccess`/`PullFailure` operation types). This commit DEPENDS on that infrastructure — do NOT re-implement any of it. If any required file is missing at Setup, REPORT A BLOCKER.

**Use case:**

- `art-workspace sanity --auto` → pull workspace root if behind and clean (before pushing), then push clean unpushed checkouts

**BDD:** `architecture/commands.md` → Sanity section:

- sanity detects "is behind" state → Workspace Report lists workspace root with state "1 commit behind"
- sanity --auto pulls if behind and clean → workspace root is pulled from origin; a pull operation is logged with outcome success
- sanity --auto does not pull if dirty → workspace root not pulled; Workspace Report lists state "uncommitted files; 1 commit behind"

**Edge case:** workspace root pull fails → log failure, continue with other operations.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `$PROJECT/architecture/_pseudo.md` — CLI pseudo-code: focus on `scanWorkspaceState`, `isCleanCheckout`, `pullCheckout`, `pushCleanCheckouts`, `shouldPushCheckout`
- `$PROJECT/architecture/commands.md` — command surface and BDD scenarios (focus on Sanity section)
- `$PROJECT/architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `$PROJECT/_guide.md` — setup and verification commands
- `$PROJECT/src/commands/sanity/runSanity.ts` — the file you are wiring into
- `$PROJECT/src/commands/sanity/private/pushCleanCheckouts.ts` — the push flow your pull runs before
- `$PROJECT/src/commands/sanity/private/pushCheckout.ts` — the pattern for an executed-operation helper (try/catch, factory logging, issue update)

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Create `pullWorkspaceCheckout` helper + unit tests
2. Step 2. Wire `runSanity --auto` (pull before push)
3. Step 3. Add BDD scenario tests to `runSanity.test.ts`

Execute all the steps autonomously, one by one, including running the **Verification commands** plus any _Verification command_ found at the end of the current step.

### Rules

- RULE: You are FORBIDDEN to return to a previous step.
- RULE: If a verification command reports errors not related to the scope of these instructions, STOP and report back the error, following the "## How to Report Back".
- RULE: If a verification command reports errors related to the scope of these instructions, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back the error, following the "## How to Report Back".
- RULE: **One function per file** — Each function gets its own file (e.g., `pullWorkspaceCheckout.ts`)
- RULE: **camelCase file names** — Function files use camelCase matching the function name (e.g., `pullWorkspaceCheckout.ts`)
- RULE: The workspace root checkout is temporary — `pullWorkspaceCheckout` MUST NOT call `ctx.store.updateCheckout`. It updates `ctx.workspace` directly. The workspace checkout is never merged into the store.
- RULE: Reuse `isCleanCheckout` (from commit `pull-push-sync-command`) and the pull operation factories `createPullSuccess` / `createPullFailure`. Do NOT re-implement them.
- RULE: **Every executed operation is logged** — the workspace-root pull must log success or failure to the Operations Report. No operation is done silently.
- RULE: Use existing test patterns from `src/commands/sanity/` (e.g., `runSanity.test.ts`, `pushCheckout.test.ts`, `pushCleanCheckouts.test.ts`).
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

- Create `src/commands/sanity/private/pullWorkspaceCheckout.ts` — pull the workspace root when clean and behind; log success/failure (in step 1)
- Create `src/commands/sanity/private/pullWorkspaceCheckout.test.ts` — unit tests for the helper (in step 1)
- Modify `src/commands/sanity/runSanity.ts` — in the `--auto` branch, call `pullWorkspaceCheckout(ctx)` BEFORE `pushCleanCheckouts(ctx)` (in step 2)
- Modify `src/commands/sanity/runSanity.test.ts` — BDD scenario tests (in step 3)

## Step Instructions

### Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

**Prerequisite verification** — verify the shared infrastructure from the `pull-push-sync-command` commit exists. Each of the following MUST exist; if any is missing, STOP and REPORT A BLOCKER (commit `pull-push-sync-command` must land first):

- `src/private/git/getBehindCount.ts` — `getBehindCount(dir, remoteBranch)`
- `src/private/scan/isCleanCheckout.ts` — `isCleanCheckout(checkout)`
- `src/private/operations/createPullSuccess.ts` — `createPullSuccess(checkout, branch)`
- `src/private/operations/createPullFailure.ts` — `createPullFailure(checkout, branch, error)`
- `isBehind: boolean` field on the `Checkout` type in `src/private/store/createCheckout.ts` (note: the `Checkout` type lives there, NOT in `src/private/scan/types.ts`)
- `scanWorkspaceState` returns a `Checkout` whose `isBehind` is populated and adds a "behind" issue (e.g. `1 commit behind`)

### Step 1/3 — Create `pullWorkspaceCheckout` helper and unit tests

**Goal:** A helper that pulls the workspace root when it is clean and behind, logging the operation. It updates `ctx.workspace` directly — the workspace checkout is temporary and is never written to the store.

**Instructions:**

1. Create `src/commands/sanity/private/pullWorkspaceCheckout.ts`:

   ```typescript
   import simpleGit from 'simple-git';

   import type { WorkspaceContext } from '../../../private/context/createWorkspaceContext';
   import { createPullFailure } from '../../../private/operations/createPullFailure';
   import { createPullSuccess } from '../../../private/operations/createPullSuccess';
   import { isCleanCheckout } from '../../../private/scan/isCleanCheckout';
   import type { Checkout } from '../../../private/store/createCheckout';

   export async function pullWorkspaceCheckout(ctx: WorkspaceContext): Promise<void> {
     const workspace = ctx.workspace;
     if (!workspace) return;
     if (!isCleanCheckout(workspace)) return;
     if (!workspace.isBehind) return;

     const git = simpleGit(workspace.path);
     try {
       await git.pull('origin', workspace.record.branch);
       const updated: Checkout = {
         ...workspace,
         isBehind: false,
         issues: workspace.issues.filter(i => !/\d+ commit behind/.test(i)),
       };
       ctx.workspace = updated;
       ctx.log.log(createPullSuccess(workspace, workspace.record.branch));
     } catch (error) {
       const op = createPullFailure(workspace, workspace.record.branch, error);
       const updated: Checkout = {
         ...workspace,
         issues: [...workspace.issues, op.message()],
       };
       ctx.workspace = updated;
       ctx.log.log(op);
     }
   }
   ```

   - RULE: Do NOT call `ctx.store.updateCheckout` — the workspace root is a temporary checkout, never merged into the store.
   - RULE: On failure, log the failure and return normally — the caller must be able to continue with other operations.

2. Create `src/commands/sanity/private/pullWorkspaceCheckout.test.ts` with implemented tests (no `it.todo()`), following the patterns in `src/commands/sanity/private/pushCheckout.test.ts` and the test helpers in `src/test/` (`createCommandContext`, `initWorkingRepo`, `initGitRepo`, `commitFile`, `makeTempDir`, `removeTempDirs`, `simpleGit`).

   **Test setup pattern** — build a workspace-root repo that is 1 commit behind `origin/main`:

   ```typescript
   // tempDir IS the workspace root (createCommandContext(tempDir) sets config.root.path = tempDir)
   const tempDir = makeTempDir(tempDirs);
   const bareDir = makeTempDir(tempDirs);
   await initWorkingRepo(tempDir, bareDir); // inits repo at tempDir, origin=bareDir, commits, pushes origin main --set-upstream
   const git = simpleGit(tempDir);
   await git.push('origin', 'main', ['--set-upstream']);

   // advance origin by one commit (workspace root is now 1 behind)
   const advDir = makeTempDir(tempDirs);
   await git.clone(bareDir, advDir);
   const advGit = simpleGit(advDir);
   await advGit.addConfig('user.email', 'test@example.com');
   await advGit.addConfig('user.name', 'Test');
   await commitFile(advDir, 'origin-advance.txt');
   await advGit.push('origin', 'main');
   ```

   - RULE: Use `initWorkingRepo(tempDir, bareDir)` — it already configures `user.email`/`user.name` on tempDir and pushes `main` with `--set-upstream`.

   **Required tests:**

   - **"pulls the workspace root when clean and behind"** — using the setup above, call `pullWorkspaceCheckout(ctx)`; assert `ctx.workspace!.isBehind` is `false`, `ctx.workspace!.issues` no longer contains `1 commit behind`, exactly one operation is logged with `operation` `'pull'` and `outcome` `'success'`, and the pulled file exists in the workspace root (`join(tempDir, 'origin-advance.txt')`).
   - **"skips when the workspace is up to date"** — workspace `isBehind` is `false`; assert no operations are logged.
   - **"skips when the workspace is dirty"** — workspace `isBehind` is `true` but `dirty` is `true`; assert no operations are logged.
   - **"skips when there is no workspace checkout"** — create the context without a workspace (`createCommandContext(tempDir)`); assert no operations are logged and no error is thrown.
   - **"logs failure and continues when the pull fails"** — make the workspace behind as above, then break the origin remote (`await git.remote(['set-url', 'origin', join(tempDir, 'missing-origin')])`); call `pullWorkspaceCheckout(ctx)`; assert it does not throw, exactly one operation is logged with `operation` `'pull'` and `outcome` `'failure'`.

   - TIP: to build the workspace checkout directly for unit tests, construct a `Checkout` object (mirroring the shape in `src/private/store/createCheckout.ts`) and pass it to `createCommandContext(tempDir, workspace)` — `createCommandContext` accepts an optional workspace argument.
   - TIP: assert log entries with `ctx.log.all()` (see `src/commands/sanity/runSanity.test.ts`).

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify the helper and its tests pass.

### Step 2/3 — Wire `runSanity --auto` (pull before push)

**Goal:** In `sanity --auto`, pull the workspace root if behind and clean BEFORE pushing clean unpushed checkouts.

**Instructions:**

1. Read `src/commands/sanity/runSanity.ts` (current `--auto` branch):

   ```typescript
   if (options.auto) {
     await pushCleanCheckouts(ctx);
   }
   ```

2. Modify the `--auto` branch so the workspace-root pull runs first:

   ```typescript
   if (options.auto) {
     await pullWorkspaceCheckout(ctx);
     await pushCleanCheckouts(ctx);
   }
   ```

3. Add the import for `pullWorkspaceCheckout` following the existing import style in the file.

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` — existing `runSanity.test.ts` tests must still pass (they run `--auto` with a clean unpushed checkout and expect exactly one `push` operation: `pullWorkspaceCheckout` must not log anything when the workspace root is not behind, so the existing assertions hold).

### Step 3/3 — Add BDD scenario tests to `runSanity.test.ts`

**Goal:** Cover the Sanity BDD scenarios and the edge case at the command level.

**Instructions:**

1. Read the existing tests in `src/commands/sanity/runSanity.test.ts` and follow their patterns (`makeTempDir`/`removeTempDirs` in `beforeEach`-less style with the shared `tempDirs` array, `createCommandContext`, `initWorkingRepo`, `commitFile`, `writeRepoRecord`, `writeCheckoutRecord`, assertions on `ctx.log.all()`).

2. Add the following implemented tests (no `it.todo()`):

   - **"detects the workspace root is behind origin"** — workspace root 1 behind (setup above), `runSanity(ctx, { auto: false })`; assert `ctx.workspace` is defined, `ctx.workspace!.isBehind` is `true`, and `ctx.workspace!.issues` contains `'1 commit behind'`.
   - **"pulls the workspace root with --auto when behind and clean"** — workspace root 1 behind and clean, `runSanity(ctx, { auto: true })`; assert exactly one operation is logged with `operation` `'pull'` and `outcome` `'success'`, `ctx.workspace!.isBehind` is `false`, and `join(tempDir, 'origin-advance.txt')` exists in the workspace root.
   - **"does not pull the workspace root with --auto when dirty"** — workspace root 1 behind, then add an uncommitted file in the workspace root (`writeFileSync(join(tempDir, 'dirty.txt'), 'dirty')`); `runSanity(ctx, { auto: true })`; assert no operations are logged and `ctx.workspace!.issues` contains both `'uncommitted files'` and `'1 commit behind'`.
   - **"logs failure and continues with other operations when the workspace pull fails"** — workspace root 1 behind, break its origin remote (`await simpleGit(tempDir).remote(['set-url', 'origin', join(tempDir, 'missing-origin')])`), AND add a clean unpushed checkout that `--auto` should still push (pattern from the existing "pushes clean unpushed repo with --auto" test: `initWorkingRepo` a checkout dir under `ctx.config.clone.path`, commit and `push --set-upstream`, then one more commit, then `writeRepoRecord` + `writeCheckoutRecord`); `runSanity(ctx, { auto: true })`; assert it does not throw, exactly two operations are logged — first `operation` `'pull'` with `outcome` `'failure'` (the workspace root), then `operation` `'push'` with `outcome` `'success'` (the checkout) — proving execution continues with other operations.

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify all tests pass.

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

- `sanity` detects the "is behind" state for the workspace root (Workspace Report lists `1 commit behind`)
- `sanity --auto` pulls the workspace root when behind and clean, and the pull runs BEFORE `pushCleanCheckouts`
- `sanity --auto` does NOT pull when the workspace root is dirty (state `uncommitted files; 1 commit behind`)
- A workspace-root pull failure is logged and execution continues with other operations
- The workspace root checkout is NEVER merged into the store — `pullWorkspaceCheckout` updates `ctx.workspace` only
- Every executed pull is logged (success or failure) — nothing is done silently
- All BDD scenarios from `architecture/commands.md` Sanity section pass
- **No `it.todo()` tests remain** — all tests must be implemented
- The `pull`, `push`, and `sync` commands are NOT modified — they belong to the `pull-push-sync-command` commit

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with `$WORKSPACE/.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `implement-pull-push-sync/instructions/sanity-enhancement__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `sanity-enhancement`, created `sanity --auto` workspace-root pull, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
