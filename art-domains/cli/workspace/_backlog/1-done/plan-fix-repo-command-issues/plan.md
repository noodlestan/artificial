# Plan: Fix Repo Command Issues

**ID:** `fix-repo-command-issues`

**Status:** `DONE`

## Summary

Fix five issues with the `repo` command: path resolution fails for many packages (shows "no package.json" when files exist), npm info noise (404 errors for unpublished packages), version display shows "-" for packages that have package.json, checkout name resolution fails (repo command doesn't accept checkout names), and npm info runs even when package.json is missing.

## Source Tasks

This plan derives from a direct user request (bug fixes), not from task files. No `task-{id}/task.md` attachments exist.

## Commits

### `investigate-checkout-name-resolution` - `DONE`

**Commit Message:** `docs(workspace-cli): document checkout name resolution logic in pseudo-code`

**Commit:** `040b07e`

**Instructions File:** `_backlog/3-now/plan-fix-repo-command-issues/instructions/investigate-checkout-name-resolution.md`

**Report:** `_backlog/3-now/plan-fix-repo-command-issues/instructions/investigate-checkout-name-resolution__report.md`

**CHANGELOG:**

- Added `resolveCheckoutByName(store, input)` function to `architecture/_pseudo.md` with 4-step resolution: exact match → strip prefix → slug format → location fallback
- Updated repo command pseudo-code to use `resolveCheckoutByName` instead of direct `getCheckoutByName`
- Created investigation findings document capturing current behavior, identified gaps, and proposed resolution logic

### `skip-npm-info-without-package-json` - `DONE`

**Commit Message:** `fix(workspace-cli): skip npm info when package.json is missing`

**Commit:** `3124e74`

**Instructions File:** `_backlog/3-now/plan-fix-repo-command-issues/instructions/skip-npm-info-without-package-json.md`

**Report:** `_backlog/3-now/plan-fix-repo-command-issues/instructions/skip-npm-info-without-package-json__report.md`

**CHANGELOG:**

- Wrapped npm info call in `if (version !== null)` check in `runRepo.ts` to skip when package.json is missing or has no version
- Updated test to verify `execSync` is not called when package.json is missing
- Updated pseudo-code to reflect new conditional logic

### `fix-path-resolution-and-npm-noise` - `DONE`

**Commit Message:** `fix(workspace-cli): resolve package paths correctly and reduce npm info noise`

**Commit:** `a2ff80c`

**Instructions File:** `_backlog/3-now/plan-fix-repo-command-issues/instructions/fix-path-resolution-and-npm-noise.md`

**Report:** `_backlog/3-now/plan-fix-repo-command-issues/instructions/fix-path-resolution-and-npm-noise__report.md`

**CHANGELOG:**

- Added fallback logic for path resolution in `runRepo.ts`: tries standard path first (`join(checkout.path, project.path, ns.path, pkg.path)`), then without namespace path if package.json doesn't exist
- Skip npm info for version "0.0.0" (unpublished marker)
- Suppress stderr in npm info calls to avoid 404 error noise
- Removed "npm info failed" from states array for cleaner UX
- Updated test to verify "npm info failed" is NOT shown in output
- Updated pseudo-code to match implementation

## Feedback

### investigate-checkout-name-resolution (delegatee)

- Instruction was clear and well-structured. The investigation steps were logical and the expected findings were accurate.

### skip-npm-info-without-package-json (delegatee)

- Instruction was clear and well-structured. The root cause analysis was accurate, and the proposed fix was straightforward.
- All 160 tests passing after the fix.

### fix-path-resolution-and-npm-noise (delegatee)

- The path resolution issue was more complex than initially anticipated — package paths in records are inconsistent (some include namespace path, others are relative to namespace).
- Fallback logic solution is pragmatic and handles both cases.
- All 160 tests passing after the fix.
