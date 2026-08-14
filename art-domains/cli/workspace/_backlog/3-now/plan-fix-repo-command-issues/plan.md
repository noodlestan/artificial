# Plan: Fix Repo Command Issues

**ID:** `fix-repo-command-issues`

**Status:** `DRAFT`

## Summary

Fix three issues with the `repo` command:

1. Path resolution fails for many packages (shows "no package.json" when files exist)
2. npm info noise (404 errors for unpublished packages)
3. Version display shows "-" for packages that have package.json

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

## Implementation Order

1. **Fix path resolution** (Issue 1) - This is blocking everything else
2. **Skip npm info for unpublished packages** (Issue 2) - Improves UX
3. **Better error messages** (Issue 3) - Helps with debugging

## Success Criteria

- All packages show correct version from package.json
- No 404 errors for unpublished packages
- Clear error messages when package.json is missing
- Command runs faster (fewer npm info calls)

## Follow-ups

- Consider adding `--skip-npm-info` flag for development
- Consider caching npm info results
- Consider adding `--verbose` flag for debugging
