# Implementation Instructions: Sanity Workspace Report

**Plan:** `implement-sanity-workspace-report`

**commit.Id:** `implement-sanity-workspace-report`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `implement-sanity-workspace-report`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Treat workspace as a first-class checkout in sanity command. Show "Workspace:" report before "Checkouts:". Store workspace in `ctx.workspace` (not `ctx.store`). Update context constructor and `createCommandContext.ts`. Unit test.

Expected behavior:

- `npm run workspace sanity` shows "Workspace:" section first, then "Checkouts:" section
- Workspace is scanned like a checkout but not stored in `ctx.store`
- `ctx.workspace` provides workspace record (repo, location, branch, states)

## Mandatory Reading

- `$PROJECT/architecture/commands.md` — Sanity command BDD scenarios
- `$PROJECT/architecture/_pseudo.md` — sanity command pseudo-code
- `$PROJECT/architecture/context-model.md` — WorkspaceContext, CheckoutStore, Checkout
- `$PROJECT/architecture/reports.md` — Workspace Report format
- `$PROJECT/src/private/context/createWorkspaceContext.ts` — context to modify
- `$PROJECT/src/commands/sanity/runSanity.ts` — command to modify
- `$PROJECT/src/private/scan/scanCheckoutState.ts` — reference for scanning pattern
- `$PROJECT/src/private/present/presentCheckoutReport.ts` — reference for presentation pattern
- `$PROJECT/src/test/createCommandContext.ts` — test helper to update

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

**Step 1: Add workspace field to WorkspaceContext**

- Add `workspace?: Checkout` field to `WorkspaceContext` interface in `createWorkspaceContext.ts`
- Update `createWorkspaceContext` function to accept optional workspace parameter

**Step 2: Create scanWorkspaceState function**

- Create `src/private/scan/scanWorkspaceState.ts`
- Scan workspace root (config.root.path) like a checkout
- Return a Checkout object with workspace state (not persisted, not in store)

**Step 3: Create presentWorkspaceReport function**

- Create `src/private/present/presentWorkspaceReport.ts`
- Present "Workspace:" header followed by workspace row
- Format: repo | location | branch | states
- Location is "." for workspace root

**Step 4: Update runSanity to scan and present workspace**

- Import `scanWorkspaceState` and `presentWorkspaceReport`
- Call `scanWorkspaceState(ctx)` before `scanAllCheckoutsStates`
- Store result in `ctx.workspace`
- Call `presentWorkspaceReport(ctx)` before `presentCheckoutReport`

**Step 5: Update test helper createCommandContext**

- Update `src/test/createCommandContext.ts` to support workspace field
- Add optional workspace parameter

**Step 6: Write tests**

- Test `scanWorkspaceState` function
- Test `presentWorkspaceReport` function
- Test `runSanity` presents workspace report before checkout report

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back".

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Add workspace field to WorkspaceContext
Step 2. Create scanWorkspaceState function
Step 3. Create presentWorkspaceReport function
Step 4. Update runSanity to scan and present workspace
Step 5. Update test helper createCommandContext
Step 6. Write tests

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `repos/artificial/art-domains/cli/workspace` to validate format and typecheck
- Execute `npm run test` in `repos/artificial/art-domains/cli/workspace` to run tests

## Steps

### Step `1 / 6` — Add workspace field to WorkspaceContext

**Goal:** Extend WorkspaceContext to hold workspace state.

**File:** `src/private/context/createWorkspaceContext.ts`

**Instructions:**

1. Read the current implementation of `createWorkspaceContext.ts`
2. Import `Checkout` type from `../store/createCheckout`
3. Add `workspace?: Checkout` field to `WorkspaceContext` interface
4. Update `createWorkspaceContext` function signature to accept optional `workspace` parameter
5. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- createWorkspaceContext` to run specific tests

### Step `2 / 6` — Create scanWorkspaceState function

**Goal:** Scan workspace root state like a checkout.

**File:** `src/private/scan/scanWorkspaceState.ts`

**Instructions:**

1. Create new file `src/private/scan/scanWorkspaceState.ts`
2. Import git helpers: `getCurrentBranch`, `getRemoteBranch`, `getUnpushedCount`, `hasMergeConflicts`, `hasRemote`, `isDetachedHead`, `isDirty`
3. Import `Checkout` type and `createCheckout` function
4. Implement `scanWorkspaceState(ctx: WorkspaceContext): Promise<Checkout>`:
   - Create a temporary checkout for workspace root using `createCheckout(ctx.config, '.', undefined, 'main', 'Workspace')`
   - Set `path` to `ctx.config.root.path`
   - Scan git state (branch, detached, conflicts, dirty, hasRemote, remoteBranch, unpushed)
   - Build issues array like `scanCheckoutState` does
   - Return the checkout (do NOT add to store)
5. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- scanWorkspaceState` to run specific tests

### Step `3 / 6` — Create presentWorkspaceReport function

**Goal:** Present workspace report before checkout report.

**File:** `src/private/present/presentWorkspaceReport.ts`

**Instructions:**

1. Create new file `src/private/present/presentWorkspaceReport.ts`
2. Import `WorkspaceContext` type
3. Import `formatTable` from `./formatTable`
4. Implement `presentWorkspaceReport(ctx: WorkspaceContext): void`:
   - Check if `ctx.workspace` exists, return early if not
   - Print "Workspace:" header
   - Build row: [repo name or '-', '.', branch, issues joined or '-']
   - Use `formatTable` with headers ['repo', 'location', 'branch', 'states']
   - Print empty line after table
5. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- presentWorkspaceReport` to run specific tests

### Step `4 / 6` — Update runSanity to scan and present workspace

**Goal:** Integrate workspace scanning and reporting into sanity command.

**File:** `src/commands/sanity/runSanity.ts`

**Instructions:**

1. Read the current implementation of `runSanity.ts`
2. Import `scanWorkspaceState` from `../../private/scan/scanWorkspaceState`
3. Import `presentWorkspaceReport` from `../../private/present/presentWorkspaceReport`
4. After `hydrateStoreFromRecords`, call `const workspace = await scanWorkspaceState(ctx)`
5. Set `ctx.workspace = workspace`
6. Before `presentCheckoutReport(ctx)`, call `presentWorkspaceReport(ctx)`
7. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- runSanity` to run specific tests

### Step `5 / 6` — Update test helper createCommandContext

**Goal:** Support workspace field in test helper.

**File:** `src/test/createCommandContext.ts`

**Instructions:**

1. Read the current implementation of `createCommandContext.ts`
2. Add optional `workspace?: Checkout` parameter to the function
3. Pass workspace to `createWorkspaceContext` call
4. Run validation commands

**Extra validation commands:**

- Execute `npm run test` to verify all tests still pass

### Step `6 / 6` — Write tests

**Goal:** Test the new workspace functionality.

**Files:**

- `src/private/scan/scanWorkspaceState.test.ts`
- `src/private/present/presentWorkspaceReport.test.ts`
- `src/commands/sanity/runSanity.test.ts` (update existing)

**Instructions:**

1. Create `src/private/scan/scanWorkspaceState.test.ts`:
   - Test scanning workspace root state
   - Test handling git errors
   - Test building issues array

2. Create `src/private/present/presentWorkspaceReport.test.ts`:
   - Test presenting workspace report with clean state
   - Test presenting workspace report with issues
   - Test handling missing workspace

3. Update `src/commands/sanity/runSanity.test.ts`:
   - Add test for workspace report appearing before checkout report
   - Verify workspace state is scanned and presented

4. Run all tests to verify everything passes

**Extra validation commands:**

- Execute `npm run test` to verify all tests pass

## Final Verification

**Sanity check**

Verify that:

1. `sanity` shows "Workspace:" section before "Checkouts:" section
2. Workspace report shows repo, location (.), branch, states
3. Workspace state is scanned correctly (branch, dirty, unpushed, etc.)
4. All existing tests still pass
5. New tests cover the workspace functionality

**Verification steps**

- Execute `npm run build` in `repos/artificial/art-domains/cli/workspace` to build
- Execute `npm run test` in `repos/artificial/art-domains/cli/workspace` to run all tests
- Execute `npm run lint` in `repos/artificial/art-domains/cli/workspace` to validate format

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `$WORKSPACE/.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-implement-sanity-workspace-report/instructions/implement-sanity-workspace-report__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `implement-sanity-workspace-report`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
