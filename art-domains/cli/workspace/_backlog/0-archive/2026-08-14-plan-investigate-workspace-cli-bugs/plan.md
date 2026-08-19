# Plan: Investigate Workspace CLI Bugs

**ID:** `investigate-workspace-cli-bugs`

**Status:** `DONE`

## Summary

Investigate and create fix instructions for 11 previously reported bugs in the workspace CLI. These bugs span clone command behavior, sanity report accuracy, and extraneous checkout handling.

## Investigation Approach

For each bug:

1. **Reproduce** — Run `npm run workspace ...` commands to reproduce the issue
2. **Verify against BDD** — Check `architecture/commands.md` and `architecture/_pseudo.md` to see if the bug matches the specification
3. **Review tests** — Check if existing tests cover the scenario and if they align with BDD
4. **Identify root cause** — Determine if the bug is in implementation, tests, or specification
5. **Create instructions** — For bugs with clear root causes, create fix instructions
6. **Document uncertainties** — For bugs that are unclear or contradict BDD, document questions

## Bug Groups

### Group 1: Clone Command Bugs

**Bug 1.1: `clone Foo` fails silently**

- **Symptom:** `npm run workspace clone Foo` produces no output, no error
- **Expected:** Should log clone failure: `unknown repo "Foo"`
- **Files:** `src/commands/clone/runClone.ts`, `src/commands/clone/cloneSpecific.ts`

**Bug 1.2: Clone refuses second checkout of same repo**

- **Symptom:** `clone Purrtrait bug-fix` when `repos/purrtrait` exists → error: `Purrtrait already exists at repos/purrtrait`
- **Expected:** Should create checkout `Purrtrait-bug-fix` at `repos/bug-fix/`
- **Files:** `src/commands/clone/cloneSpecific.ts`, `src/private/store/createCheckoutStore.ts`

**Bug 1.3: Clone should refuse if target dir is extraneous**

- **Symptom:** `clone Purrtrait bug-fix` when `repos/bug-fix` exists → creates checkout anyway
- **Expected:** Should error: directory already exists
- **Files:** `src/commands/clone/cloneSpecific.ts`, `src/private/scan/scanExtraneousCheckouts.ts`

**Bug 1.4: Clone custom location wrong name/path**

- **Symptom:** `clone Purrtrait bug-fix` → name `Purrtrait`, dir `bug-fix` (at repo root, not under repos/)
- **Expected:** name `Purrtrait-bug-fix`, dir `repos/bug-fix/`
- **Files:** `src/commands/clone/cloneSpecific.ts`, `src/private/store/safePath.ts`

**Bug 1.5: Clone refuses extraneous dir but no failure logged**

- **Symptom:** `clone Purrtrait bug-fix` when `repos/bug-fix` exists → refuses silently, no operation in report
- **Expected:** Should log clone failure operation
- **Files:** `src/commands/clone/cloneSpecific.ts`, `src/private/log/createOperationsLog.ts`

### Group 2: Sanity/Report Bugs

**Bug 2.1: Synthetic repo log noise**

- **Symptom:** `npm run workspace sanity` → console output before Checkout Report: `checkout Purrtrait: no matching repository record, using synthetic repository`
- **Expected:** No console output before Checkout Report
- **Files:** `src/commands/sanity/runSanity.ts`, `src/private/store/createCheckoutStore.ts`

**Bug 2.2: Operations Report missing outcome markers**

- **Symptom:** `npm run workspace clone --all` → no outcome markers (🟢/🔴) in Operations Report
- **Expected:** Column zero should show outcome markers
- **Files:** `src/private/present/presentOperationsReport.ts`

**Bug 2.3: Extraneous items in Checkout Report**

- **Symptom:** `npm run workspace sanity` → extraneous items appear in Checkout Report
- **Expected:** Extraneous checkouts should only appear in Extraneous Report
- **Files:** `src/private/present/presentCheckoutReport.ts`, `src/private/scan/scanExtraneousCheckouts.ts`

### Group 3: Extraneous Checkout Bugs

**Bug 3.1: Extraneous empty dir states**

- **Symptom:** `repos/blah` (no .git) → shows `unknown project; uncommitted files`
- **Expected:** Should show `unknown project; no git`
- **Files:** `src/private/scan/scanCheckoutState.ts`, `src/private/scan/scanExtraneousCheckouts.ts`

**Bug 3.2: Extraneous with file (no .git) shows "uncommitted files"**

- **Symptom:** `repos/blah` with a `foo` file → shows `unknown project; uncommitted files`
- **Expected:** Should show `unknown project; no git`
- **Files:** `src/private/scan/scanCheckoutState.ts`

## Investigation Instructions

### Phase 1: Reproduce and Document

For each bug:

1. Create a temporary branch: `git checkout -b tmp/bug-investigation`
2. Attempt to reproduce the bug using the exact commands in the bug description
3. Document the actual behavior vs expected behavior
4. If the bug cannot be reproduced, document what you tried and why it might have been fixed

### Phase 2: Verify Against BDD

For each reproducible bug:

1. Read the relevant BDD scenarios in `architecture/commands.md`
2. Read the pseudo-code in `architecture/_pseudo.md`
3. Determine if the bug is:
   - **Implementation bug** — code doesn't match BDD
   - **Test bug** — tests don't match BDD
   - **Specification bug** — BDD is unclear or wrong
   - **Already fixed** — bug was resolved in a previous commit

### Phase 3: Create Instructions

For bugs with clear root causes:

1. Create instruction file: `instructions/fix-{bug-id}.md`
2. Include:
   - Root cause analysis
   - Files to modify
   - Step-by-step fix instructions
   - Test updates (if needed)
   - **WARNING:** Do not modify tests outside the scope of this fix

For bugs with uncertainties:

1. Create question file: `instructions/questions-{bug-group}.md`
2. Include:
   - What was unclear
   - What you tried
   - What the BDD says
   - What the code does
   - Questions for the user

### Phase 4: Update Plan

After investigation:

1. Update this plan with findings
2. Mark bugs as:
   - **FIXED** — created instruction file
   - **QUESTION** — needs user input
   - **ALREADY FIXED** — could not reproduce
   - **SPEC ISSUE** — BDD needs update

## File Management

**CRITICAL:** Create files early and update often to allow session compaction.

- Create instruction files as soon as you identify a fix
- Update the plan file after each bug investigation
- Commit frequently with descriptive messages

## Worker Warnings

All instruction files must include this warning:

```
**WARNING:** This instruction is scoped to fix ONLY the specific bug described. Do NOT modify:
- Tests outside the scope of this fix
- Other commands or functions
- BDD scenarios or pseudo-code (unless explicitly instructed)
- Any files not listed in the "Files to modify" section

If you encounter issues outside this scope, REPORT A BLOCKER instead of attempting to fix them.
```

## Success Criteria

- All 11 bugs investigated
- Instruction files created for bugs with clear root causes
- Questions documented for bugs with uncertainties
- Plan updated with investigation results
- No regressions introduced

## Follow-ups

- After instructions are created, delegate to workers for implementation
- After fixes are implemented, verify all bugs are resolved
- Update BDD/pseudo if specification bugs are found
