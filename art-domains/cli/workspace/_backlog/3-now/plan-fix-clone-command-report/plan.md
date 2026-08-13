# Plan: Workspace CLI — Fix Clone Command Report

**ID:** `fix-clone-command-report`

**Status:** `READY`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Fix clone command report issues: checkout list shown twice, and report shows full checkout list without having scanned other repos.

## Source Tasks

- Parking lot bug: "Clone outputs checkout list twice"
- Parking lot bug: "Clone report shows checkout list without scanning"

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/commands.md` — command surface and BDD scenarios
- `architecture/reports.md` — How state and operation logs are presented

## Analysis

### Root Cause Identification

**Bug 1: Checkout list shown twice**

- Location: `cloneStatus.ts` line 10 calls `presentCheckoutReport(ctx)`
- Location: `runClone.ts` line 34 ALSO calls `presentCheckoutReport(ctx)` after calling `cloneStatus(ctx)`
- Result: When running `clone` (no args), the checkout report is presented twice

**Bug 2: Report shows full checkout list without having scanned other repos**

- Location: `runClone.ts` line 34 calls `presentCheckoutReport(ctx)` which shows ALL checkouts from store
- Issue: `cloneSpecific` only scans the specific checkout that was cloned, but the report shows all checkouts
- The store is hydrated with ALL checkout records at startup (runClone.ts line 24)
- Result: When cloning a single repo, the report shows all recorded checkouts, not just the cloned one

### Expected Behavior (from architecture docs)

From `commands.md` and `_pseudo.md`:

- `clone` (no args) — status mode: present Checkout Report and Extraneous Report once
- `clone <repo>` — clone single repo, present Checkout Report with ONLY the cloned checkout
- `clone --all` — clone all repos, present Checkout Report with ALL checkouts

### Solution Design

**Approach: Each sub-command handles its own reporting**

1. **Remove duplicate reporting from `runClone.ts`**
   - Remove `presentCheckoutReport(ctx)` from line 34
   - Remove `presentOperationsReport(ctx.log)` from line 35
   - Each sub-command (`cloneAll`, `cloneSpecific`, `cloneStatus`) will handle its own reporting

2. **Update `cloneSpecific.ts` to report only the cloned checkout**
   - Modify `presentCheckoutReport` to accept an optional filter parameter
   - Track which checkout was processed in `cloneSpecific`
   - Call `presentCheckoutReport` with only that checkout
   - Call `presentOperationsReport` for the operations log

3. **Update `presentCheckoutReport.ts` to support filtering**
   - Add optional parameter: `checkouts?: Checkout[]`
   - When provided, show only those checkouts
   - When omitted, show all checkouts (backward compatible)

4. **Update `cloneAll.ts` to handle its own reporting**
   - Call `presentCheckoutReport(ctx)` at the end
   - Call `presentOperationsReport(ctx.log)` at the end

5. **Keep `cloneStatus.ts` as-is**
   - Already calls `presentCheckoutReport(ctx)` and `presentExtraneousReport(ctx.store)`
   - Just need to add `presentOperationsReport(ctx.log)` if needed (though status mode doesn't log operations)

## Iterations

### `fix-clone-command-report` - `PLANNED`

**Commit Message:** `fix(workspace-cli): clone command report shows checkout list once and only for scanned repos`

Fix two bugs in clone command output: (1) checkout list appears twice, (2) report shows full checkout list even when only one repo was cloned (without having scanned others).

**Use case:**

- `npm run workspace clone` shows checkout list once (not twice)
- `npm run workspace clone Artificial` shows only "Artificial" in report, not all recorded checkouts
- `npm run workspace clone --all` shows all checkouts in report

**Responsibilities:**

1. Remove duplicate `presentCheckoutReport` call from `runClone.ts`
2. Modify `presentCheckoutReport` to accept optional checkout filter
3. Update `cloneSpecific` to track processed checkout and call reporting functions
4. Update `cloneAll` to call reporting functions at the end
5. Ensure `cloneStatus` doesn't duplicate reporting

**Edge cases:**

- Clone single repo (new) → shows only that checkout
- Clone single repo (already exists) → shows only that checkout
- Clone single repo (unknown) → shows failure in operations report
- Clone with --all flag → shows all checkouts
- Clone with no args → shows all checkouts once (not twice)

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → clone command.

**BDD:** `architecture/commands.md` → Clone section.

**Files to modify:**

- `src/commands/clone/runClone.ts` — remove duplicate reporting calls
- `src/commands/clone/cloneSpecific.ts` — add reporting with filtered checkouts
- `src/commands/clone/cloneAll.ts` — add reporting calls
- `src/private/present/presentCheckoutReport.ts` — add optional filter parameter

## Follow ups

- None.
