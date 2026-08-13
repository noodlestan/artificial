# Implementation Instructions

**Plan:** `fix-clone-command-report`

**commit.Id:** `fix-clone-command-report`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-clone-command-report`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Fix two bugs in the clone command output:

1. **Bug 1:** Checkout list appears twice when running `clone` (no args)
2. **Bug 2:** Report shows full checkout list even when only one repo was cloned (without having scanned others)

Expected behavior:

- `npm run workspace clone` shows checkout list once (not twice)
- `npm run workspace clone Artificial` shows only "Artificial" in report, not all recorded checkouts
- `npm run workspace clone --all` shows all checkouts in report

## Mandatory Reading

- `architecture/commands.md` — command surface and BDD scenarios for clone command
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/reports.md` — how state and operation logs are presented

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

**Step 1: Modify `presentCheckoutReport` to support filtering**

- Add optional parameter `checkouts?: Checkout[]` to `presentCheckoutReport.ts`
- When provided, show only those checkouts; when omitted, show all (backward compatible)

**Step 2: Update `cloneSpecific` to handle its own reporting**

- Track which checkout was processed (created or existing)
- Call `presentCheckoutReport` with only that checkout
- Call `presentOperationsReport` for the operations log

**Step 3: Update `cloneAll` to handle its own reporting**

- Call `presentCheckoutReport(ctx)` at the end
- Call `presentOperationsReport(ctx.log)` at the end

**Step 4: Remove duplicate reporting from `runClone`**

- Remove `presentCheckoutReport(ctx)` call
- Remove `presentOperationsReport(ctx.log)` call
- Each sub-command now handles its own reporting

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Modify `presentCheckoutReport` to support filtering
Step 2. Update `cloneSpecific` to handle its own reporting
Step 3. Update `cloneAll` to handle its own reporting
Step 4. Remove duplicate reporting from `runClone`

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `repos/artificial/art-domains/cli/workspace` to validate format and typecheck
- Execute `npm run test` in `repos/artificial/art-domains/cli/workspace` to run tests

## Steps

### Step `1 / 4` — Modify `presentCheckoutReport` to support filtering

**Goal:** Enable `presentCheckoutReport` to show only specific checkouts when needed.

**File:** `src/private/present/presentCheckoutReport.ts`

**Instructions:**

1. Read the current implementation of `presentCheckoutReport.ts`
2. Modify the function signature to accept an optional parameter:
   ```typescript
   export function presentCheckoutReport(ctx: WorkspaceContext, checkouts?: Checkout[]): void;
   ```
3. Update the function body:
   - If `checkouts` parameter is provided, use it instead of `ctx.store.getAllCheckouts()`
   - Otherwise, use `ctx.store.getAllCheckouts()` (backward compatible)
4. Ensure the sorting logic still works with the filtered checkouts
5. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- presentCheckoutReport` to run specific tests

### Step `2 / 4` — Update `cloneSpecific` to handle its own reporting

**Goal:** Make `cloneSpecific` report only the checkout that was processed.

**File:** `src/commands/clone/cloneSpecific.ts`

**Instructions:**

1. Read the current implementation of `cloneSpecific.ts`
2. Import the reporting functions:
   ```typescript
   import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
   import { presentOperationsReport } from '../../private/present/presentOperationsReport';
   ```
3. Track which checkout was processed:
   - When creating a new checkout (line 34-43), capture the result of `scanCheckoutState`
   - When using an existing checkout (line 46-47), capture the result of `scanCheckoutState`
4. At the end of the function, call:
   ```typescript
   presentCheckoutReport(ctx, [processedCheckout]);
   presentOperationsReport(ctx.log);
   ```
5. Handle early returns (unknown repo, location taken) — they already log operations, so just add the reporting calls before returning
6. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- cloneSpecific` to run specific tests

### Step `3 / 4` — Update `cloneAll` to handle its own reporting

**Goal:** Make `cloneAll` report all checkouts after cloning.

**File:** `src/commands/clone/cloneAll.ts`

**Instructions:**

1. Read the current implementation of `cloneAll.ts`
2. Import the reporting functions:
   ```typescript
   import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
   import { presentOperationsReport } from '../../private/present/presentOperationsReport';
   ```
3. At the end of the function, add:
   ```typescript
   presentCheckoutReport(ctx);
   presentOperationsReport(ctx.log);
   ```
4. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- cloneAll` to run specific tests

### Step `4 / 4` — Remove duplicate reporting from `runClone`

**Goal:** Remove the duplicate reporting calls since each sub-command now handles its own reporting.

**File:** `src/commands/clone/runClone.ts`

**Instructions:**

1. Read the current implementation of `runClone.ts`
2. Remove the following lines (34-35):
   ```typescript
   presentCheckoutReport(ctx);
   presentOperationsReport(ctx.log);
   ```
3. Remove the unused imports:
   ```typescript
   import { presentCheckoutReport } from '../../private/present/presentCheckoutReport';
   import { presentOperationsReport } from '../../private/present/presentOperationsReport';
   ```
4. Run validation commands

**Extra validation commands:**

- Execute `npm run test -- runClone` to run specific tests

## Final Verification

**Sanity check**

Verify that:

1. `clone` (no args) shows checkout list once, not twice
2. `clone <repo>` shows only the cloned checkout in the report
3. `clone --all` shows all checkouts in the report
4. All existing tests still pass

**Verification steps**

- Execute `npm run build` in `repos/artificial/art-domains/cli/workspace` to build
- Execute `npm run test` in `repos/artificial/art-domains/cli/workspace` to run all tests
- Execute `npm run lint` in `repos/artificial/art-domains/cli/workspace` to validate format

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-clone-command-report/instructions/fix-clone-command-report__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-clone-command-report`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
