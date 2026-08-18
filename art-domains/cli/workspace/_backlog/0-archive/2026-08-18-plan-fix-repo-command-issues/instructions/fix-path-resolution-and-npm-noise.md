# Implementation Instruction: Fix Path Resolution and npm Info Noise

**ID:** `fix-path-resolution-and-npm-noise`

**Plan:** `fix-repo-command-issues`

**Commit Message:** `fix(workspace-cli): resolve package paths correctly and reduce npm info noise`

## Goal

Fix three related issues in the `repo` command:

1. **Issue 1 (Critical):** Path resolution fails for many packages (shows "no package.json" when files exist)
2. **Issue 2 (UX):** npm info noise (404 errors for unpublished packages)
3. **Issue 3 (Minor):** Version display shows "-" for packages that have package.json

These issues are related: if the path is wrong (Issue 1), the package.json can't be read, causing version display to fail (Issue 3).

## Background

### Issue 1: Path Resolution Problem

**Symptom:** Many packages show "no package.json" even though they exist:

- `@art-js/artificials-language-server` → "no package.json"
- `@artisans/art-mantras` → "no package.json"
- All Conventions packages → "no package.json"

**Root Cause Hypothesis:** The path resolution logic in `runRepo.ts` is not correctly resolving package paths from the project graph. The path concatenation `join(checkout.path, project.path, ns.path, pkg.path)` may be incorrect.

### Issue 2: npm info Noise

**Symptom:** The command tries to fetch npm info for packages that don't exist on npm yet, resulting in 404 errors. This is noisy and slow.

**Root Cause:** The command runs `npm info` for every package regardless of whether it has a version or is likely published.

**Solution:** Only run `npm info` if:

1. package.json exists
2. package.json has a version field
3. (Optional) Version is not "0.0.0" or similar unpublished marker

### Issue 3: Version Display

**Symptom:** Some packages show "-" for version even though they have package.json files.

**Root Cause:** Likely related to Issue 1 — if the path is wrong, the package.json can't be read.

**Solution:** Fix Issue 1 first, then verify if this persists.

## Mandatory Reading

- `$PROJECT/architecture/_pseudo.md` — repo command pseudo-code (lines 165-211)
- `$PROJECT/architecture/commands.md` — repo command BDD scenarios (lines 223-291)
- `$PROJECT/src/commands/repo/runRepo.ts` — current implementation (lines 56-104)
- `$PROJECT/src/private/records/projectGraph/loadProjectGraph.ts` — graph loading logic
- `$PROJECT/src/private/records/projectGraph/consolidateProjectGraph.ts` — path consolidation
- `$PROJECT/src/commands/repo/runRepo.test.ts` — existing tests

## Investigation Steps

### Step 1: Debug Path Resolution

**Goal:** Understand why paths are resolving incorrectly.

**Actions:**

1. Add temporary debug logging to `runRepo.ts` to print:
   - `checkout.path`
   - `project.path`
   - `ns.path`
   - `pkg.path`
   - Final `pkgPath`
   - Whether `pkgJsonPath` exists

2. Run `npm run workspace repo` on a real checkout and observe the paths

3. Check if the issue is in:
   - `loadProjectGraph.ts` — are paths being read correctly from records?
   - `consolidateProjectGraph.ts` — are paths being consolidated correctly?
   - `runRepo.ts` — is the path concatenation correct?

4. Verify that paths in records are relative to the checkout root

**Expected Findings:**

- Paths in records may be absolute or relative to different bases
- Path concatenation may be doubling up segments
- Some paths may be empty strings or "."

### Step 2: Fix Path Resolution

**Goal:** Correct the path resolution logic.

**Potential Fixes:**

1. **If paths are relative to checkout root:**

   ```typescript
   const pkgPath = join(checkout.path, project.path, ns.path, pkg.path);
   ```

   This should work if all paths are relative to checkout root.

2. **If namespace path is relative to project path:**

   ```typescript
   const nsPath = join(project.path, ns.path);
   const pkgPath = join(checkout.path, nsPath, pkg.path);
   ```

3. **If package path is relative to namespace path:**
   ```typescript
   const pkgPath = join(checkout.path, project.path, ns.path, pkg.path);
   ```
   (Same as current, but verify the record structure)

**Action:** Based on investigation, update the path concatenation logic in `runRepo.ts`.

### Step 3: Reduce npm info Noise

**Goal:** Only run `npm info` for packages that are likely published.

**Proposed Logic:**

```typescript
// Only run npm info if package.json exists and has a version
let publishedVersion: string | null = null;
if (version !== null && version !== '0.0.0') {
  try {
    const output = execSync(`npm info ${pkg.canonicalName} version`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr (404 errors)
    });
    publishedVersion = output.trim() || null;
  } catch {
    publishedVersion = 'unknown';
    // Don't add "npm info failed" to states — it's noisy
    // Only show "not published" or similar
  }
}
```

**Rationale:**

- Skip npm info for version "0.0.0" (unpublished marker)
- Suppress stderr to avoid 404 error noise
- Don't add "npm info failed" to states — just show "not published" or leave publishedVersion as null

### Step 4: Verify Version Display

**Goal:** Ensure version is displayed correctly when package.json exists.

**Actions:**

1. After fixing path resolution, verify that version is read correctly
2. Check if the issue was purely due to wrong paths
3. If version still shows "-", add debug logging to see what's being read from package.json

## Changes

### 1. Fix Path Resolution in `runRepo.ts`

**File:** `$PROJECT/src/commands/repo/runRepo.ts`

**Location:** Line 66 (package path calculation)

**Current code:**

```typescript
const pkgPath = join(checkout.path, project.path, ns.path, pkg.path);
```

**Updated code (based on investigation):**

```typescript
// DEBUG: Log paths to understand the issue
console.debug(
  `Path resolution: checkout=${checkout.path}, project=${project.path}, ns=${ns.path}, pkg=${pkg.path}`,
);

const pkgPath = join(checkout.path, project.path, ns.path, pkg.path);
const pkgJsonPath = join(pkgPath, 'package.json');

console.debug(`Resolved pkgPath: ${pkgPath}, exists: ${existsSync(pkgJsonPath)}`);
```

**Action:** Based on investigation, update the path concatenation logic. Remove debug logging after fixing.

### 2. Reduce npm info Noise

**File:** `$PROJECT/src/commands/repo/runRepo.ts`

**Location:** Lines 83-93 (npm info call)

**Current code:**

```typescript
let publishedVersion: string | null = null;
try {
  const output = execSync(`npm info ${pkg.canonicalName} version`, {
    encoding: 'utf-8',
    timeout: 10000,
  });
  publishedVersion = output.trim() || null;
} catch {
  publishedVersion = 'unknown';
  states.push('npm info failed');
}
```

**Updated code:**

```typescript
let publishedVersion: string | null = null;
if (version !== null && version !== '0.0.0') {
  try {
    const output = execSync(`npm info ${pkg.canonicalName} version`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
    });
    publishedVersion = output.trim() || null;
  } catch {
    publishedVersion = 'unknown';
    // Don't add "npm info failed" — it's noisy
    // Package is likely not published yet
  }
}
```

**Rationale:**

- Skip npm info for version "0.0.0" (unpublished marker)
- Suppress stderr to avoid 404 error noise
- Don't add "npm info failed" to states — cleaner UX

### 3. Update Pseudo-Code

**File:** `$PROJECT/architecture/_pseudo.md`

**Location:** Lines 194-207 (repo command pseudo-code)

**Current pseudo-code:**

```pseudo
for pkg in ns.packages:
  pkgPath = join(checkout.path, project.path, ns.path, pkg.path)
  version = readPackageVersion(join(pkgPath, "package.json"))   // null if missing
  published = npmInfo(pkg.canonicalName)                        // try/catch -> null
  states = []
  if version is null:  states.push("no package.json")
  if published is null: published = "unknown"; states.push("npm info failed")
  packageStates.push({
    canonicalName: pkg.canonicalName, version, published,
    branch: checkout.record.branch, directory: pkgPath, states
  })
```

**Updated pseudo-code:**

```pseudo
for pkg in ns.packages:
  pkgPath = join(checkout.path, project.path, ns.path, pkg.path)
  version = readPackageVersion(join(pkgPath, "package.json"))   // null if missing
  states = []
  if version is null:
    states.push("no package.json")
    published = null
  else if version === "0.0.0":
    published = null                                            // skip npm info for unpublished marker
  else:
    published = npmInfo(pkg.canonicalName)                      // try/catch -> null, suppress stderr
    if published is null: published = "unknown"                 // don't add to states
  packageStates.push({
    canonicalName: pkg.canonicalName, version, published,
    branch: checkout.record.branch, directory: pkgPath, states
  })
```

**Rationale:**

- Pseudo-code now matches the implementation
- Clearer control flow with explicit conditions
- No "npm info failed" state — cleaner UX

### 4. Update Tests

**File:** `$PROJECT/src/commands/repo/runRepo.test.ts`

**Action:** Update the "npm info fails" test (lines 208-244) to verify that "npm info failed" is NOT in the output.

**Current test (lines 208-244):**

```typescript
it('npm info fails', async () => {
  // ... setup ...
  vi.mocked(execSync).mockImplementation(() => {
    throw new Error('npm info failed');
  });

  await runRepo(ctx, { checkoutNames: ['Artificial'] });

  const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
  expect(output).toContain('unknown');
  expect(output).toContain('npm info failed');
});
```

**Updated test:**

```typescript
it('npm info fails', async () => {
  // ... setup ...
  vi.mocked(execSync).mockImplementation(() => {
    throw new Error('npm info failed');
  });

  await runRepo(ctx, { checkoutNames: ['Artificial'] });

  const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
  expect(output).toContain('unknown');
  expect(output).not.toContain('npm info failed'); // CHANGED: verify noise is reduced
});
```

**Rationale:**

- Test now verifies that "npm info failed" is NOT shown (noise reduction)
- Published version still shows as "unknown" when npm info fails

## Workflow

1. **Read mandatory files** listed above
2. **Add debug logging** to understand path resolution
3. **Run manually** to observe path resolution behavior
4. **Fix path resolution** based on findings
5. **Reduce npm info noise** — skip for version "0.0.0", suppress stderr
6. **Update pseudo-code** to match implementation
7. **Update tests** to verify noise reduction
8. **Run tests:** `npm test` — all tests must pass
9. **Verify manually:** Run `npm run workspace repo` and check:
   - Packages show correct versions (not "-")
   - No "no package.json" for packages that exist
   - No "npm info failed" messages
   - No 404 errors in output
10. **Remove debug logging** after verification
11. **Commit** with message: `fix(workspace-cli): resolve package paths correctly and reduce npm info noise`
12. **Push** to remote

## Validation

- All existing tests pass: `npm test`
- Manual verification shows correct package paths
- No "no package.json" for packages that exist
- No "npm info failed" messages in output
- No 404 errors in output
- Command runs faster (fewer npm info calls)

## Rules

- DO NOT modify unrelated code
- DO NOT add new features
- DO NOT refactor the entire function
- Follow existing code style
- Keep changes minimal and focused
- Update pseudo-code to match implementation
- Remove debug logging before committing

## Report Back

After completing the work, report:

- Files changed
- Path resolution findings (what was wrong, how it was fixed)
- Tests status (pass/fail)
- Manual verification results
- Any issues or blockers encountered
