# Plan: Fix Repo Command Issues

**ID:** `fix-repo-command-issues`

**Status:** `DRAFT`

## Summary

Fix five issues with the `repo` command:

1. Path resolution fails for many packages (shows "no package.json" when files exist)
2. npm info noise (404 errors for unpublished packages)
3. Version display shows "-" for packages that have package.json
4. Checkout name resolution fails (repo command doesn't accept checkout names)
5. npm info runs even when package.json is missing (should skip entirely)

## Issues

### Issue 1: Path Resolution Problem (Critical)

**Symptom:** Many packages show "no package.json" even though they exist:

- `@art-js/artificials-language-server` → "no package.json"
- `@artisans/art-mantras` → "no package.json"
- All Conventions packages → "no package.json"

**Root Cause:** The path resolution logic in `runRepo.ts` is not correctly resolving package paths from the project graph.

**Investigation Needed:**

- Check how `package.path` is being resolved from namespace and project paths
- Verify the path concatenation logic
- Check if the issue is in `loadProjectGraph.ts` or `runRepo.ts`

### Issue 2: npm info Noise (UX)

**Symptom:** The command tries to fetch npm info for packages that don't exist on npm yet, resulting in 404 errors. This is noisy and slow.

**Root Cause:** The command runs `npm info` for every package regardless of whether it has a package.json or version.

**Solution:** Only run `npm info` if:

1. package.json exists
2. package.json has a version field

### Issue 3: Version Display (Minor)

**Symptom:** Some packages show "-" for version even though they have package.json files.

**Root Cause:** Likely related to Issue 1 - if the path is wrong, the package.json can't be read.

**Solution:** Fix Issue 1 first, then verify if this persists.

### Issue 4: Checkout Name Resolution (Critical)

**Symptom:** The repo command fails when trying to specify a checkout by name:

- `npm run workspace repo "Repository: No Comply"` → fails
- `npm run workspace repo "No Comply"` → fails
- `npm run workspace repo no-comply` → fails

**Expected Behavior:** According to `architecture/commands.md` and `architecture/_pseudo.md`, the repo command should accept checkout names and resolve them correctly. The checkout record exists at `ops/records/checkouts/no-comply.art`.

**Investigation Needed:**

- Check how checkout names are resolved in `runRepo.ts`
- Verify the name matching logic (case-insensitive, with/without "Repository:" prefix)
- Check if the issue is in name parsing or checkout lookup
- Review existing tests to understand expected behavior

**Architect Action Required:**

1. **Investigate first:** Look at the code and tests to understand current behavior
2. **Update pseudo-code:** Create new pseudo functions in `architecture/_pseudo.md` to document the checkout resolution logic
3. **Document the fix:** Add a new `### Function: resolveCheckoutByName` section to the pseudo-code

### Issue 5: npm info Runs Without package.json (UX)

**Symptom:** The command shows "no package.json; npm info failed" - it tries to run npm info even when package.json doesn't exist.

**Root Cause:** The logic doesn't check for package.json existence before attempting npm info.

**Solution:** If package.json is missing, skip npm info entirely. Don't show "npm info failed" - just show "no package.json".

## Proposed Solutions

### Solution 1: Fix Path Resolution

**Files to investigate:**

- `src/commands/repo/runRepo.ts` - main command logic
- `src/private/records/projectGraph/loadProjectGraph.ts` - graph loading
- `src/private/records/projectGraph/consolidateProjectGraph.ts` - path consolidation

**Steps:**

1. Add debug logging to see what paths are being resolved
2. Check the path concatenation: `project.path + namespace.path + package.path`
3. Verify that paths are relative to the checkout root
4. Fix any path resolution bugs

### Solution 2: Skip npm info for unpublished packages

**File:** `src/commands/repo/runRepo.ts`

**Steps:**

1. Check if package.json exists before running npm info
2. Check if package.json has a version field
3. Only run npm info if both conditions are met
4. Update the state to "not published" instead of "npm info failed" when appropriate

### Solution 3: Better error messages

**File:** `src/commands/repo/runRepo.ts`

**Steps:**

1. When package.json is missing, show the path that was checked
2. Add a `--verbose` flag to show more debug information
3. Add a `--skip-npm-info` flag for development

### Solution 4: Fix Checkout Name Resolution

**Files to investigate:**

- `src/commands/repo/runRepo.ts` - main command logic
- `src/private/store/createCheckoutStore.ts` - checkout lookup methods
- `architecture/_pseudo.md` - needs new pseudo functions

**Steps:**

1. **Investigate current behavior:** Review code and tests to understand how checkout names should be resolved
2. **Update pseudo-code:** Add new `### Function: resolveCheckoutByName` section to `architecture/_pseudo.md`
3. **Implement fix:** Update `runRepo.ts` to correctly resolve checkout names (case-insensitive, handle "Repository:" prefix)
4. **Add tests:** Ensure tests cover various name formats

### Solution 5: Skip npm info when package.json is missing

**File:** `src/commands/repo/runRepo.ts`

**Steps:**

1. Check if package.json exists before attempting npm info
2. If package.json is missing, set state to "no package.json" and skip npm info
3. Only run npm info if package.json exists and has a version field
4. Update state messages to be clearer: "no package.json" instead of "no package.json; npm info failed"

## Implementation Order

1. **Fix checkout name resolution** (Issue 4) - This is a separate investigation task that requires pseudo-code updates
2. **Fix path resolution** (Issue 1) - This is blocking everything else
3. **Skip npm info when package.json is missing** (Issue 5) - Improves UX and reduces noise
4. **Skip npm info for unpublished packages** (Issue 2) - Further reduces noise
5. **Better error messages** (Issue 3) - Helps with debugging

## Commits

### Commit 1: Investigate Checkout Name Resolution

**Status:** `PLANNED`

**Instruction:** `./instructions/investigate-checkout-name-resolution.md`

**Message:** `docs(workspace-cli): document checkout name resolution logic in pseudo-code`

**Scope:** Investigation task — update architecture pseudo-code with `resolveCheckoutByName` function, document findings.

**Issues Addressed:** Issue 4 (Checkout Name Resolution)

---

### Commit 2: Skip npm info Without package.json

**Status:** `PLANNED`

**Instruction:** `./instructions/skip-npm-info-without-package-json.md`

**Message:** `fix(workspace-cli): skip npm info when package.json is missing`

**Scope:** Fix the repo command to skip `npm info` entirely when `package.json` is missing. Show only "no package.json" instead of "no package.json; npm info failed".

**Issues Addressed:** Issue 5 (npm info Without package.json)

---

### Commit 3: Fix Path Resolution and npm Info Noise

**Status:** `PLANNED`

**Instruction:** `./instructions/fix-path-resolution-and-npm-noise.md`

**Message:** `fix(workspace-cli): resolve package paths correctly and reduce npm info noise`

**Scope:** Fix path resolution for packages, reduce npm info noise (skip for unpublished packages, suppress 404 errors), and verify version display.

**Issues Addressed:** Issues 1, 2, 3 (Path Resolution, npm Info Noise, Version Display)

---

## Success Criteria

- Checkout names are resolved correctly (with/without "Repository:" prefix, case-insensitive)
- All packages show correct version from package.json
- No 404 errors for unpublished packages
- No "npm info failed" when package.json is missing
- Clear error messages when package.json is missing
- Command runs faster (fewer npm info calls)
- Pseudo-code updated with new checkout resolution function

## Follow-ups

- Consider adding `--skip-npm-info` flag for development
- Consider caching npm info results
- Consider adding `--verbose` flag for debugging
