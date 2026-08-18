# Implementation Instruction: Skip npm info When package.json is Missing

**ID:** `skip-npm-info-without-package-json`

**Plan:** `fix-repo-command-issues`

**Commit Message:** `fix(workspace-cli): skip npm info when package.json is missing`

## Goal

Fix the `repo` command to skip `npm info` entirely when `package.json` is missing, and show only "no package.json" instead of "no package.json; npm info failed".

## Background

**Current Behavior:**

When a package has no `package.json`, the command:

1. Adds "no package.json" to states
2. Still attempts `npm info` (which fails)
3. Adds "npm info failed" to states
4. Shows: "no package.json; npm info failed"

**Expected Behavior:**

When a package has no `package.json`, the command should:

1. Add "no package.json" to states
2. Skip `npm info` entirely
3. Show only: "no package.json"

**Rationale:**

- Running `npm info` when there's no `package.json` is wasteful (adds latency)
- "npm info failed" is misleading — it's not a failure, it's expected
- Cleaner UX: show only the relevant state

## Mandatory Reading

- `$PROJECT/architecture/_pseudo.md` — repo command pseudo-code (lines 165-211)
- `$PROJECT/architecture/commands.md` — repo command BDD scenarios (lines 223-291)
- `$PROJECT/src/commands/repo/runRepo.ts` — current implementation (lines 56-104)
- `$PROJECT/src/commands/repo/runRepo.test.ts` — existing tests (lines 177-206)

## Root Cause

In `runRepo.ts` lines 69-93, the code checks for `package.json` existence and reads the version, but then unconditionally attempts `npm info` regardless of whether `package.json` exists.

**Current code (simplified):**

```typescript
if (existsSync(pkgJsonPath)) {
  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    version = pkgJson.version ?? null;
  } catch {
    states.push('no package.json');
  }
} else {
  states.push('no package.json');
}

// BUG: This runs even when package.json is missing
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

## Changes

### 1. Update `runRepo.ts` to Skip npm info When package.json is Missing

**File:** `$PROJECT/src/commands/repo/runRepo.ts`

**Location:** Lines 69-93 (package state collection loop)

**Current code:**

```typescript
let version: string | null = null;
const states: string[] = [];

if (existsSync(pkgJsonPath)) {
  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    version = pkgJson.version ?? null;
  } catch {
    states.push('no package.json');
  }
} else {
  states.push('no package.json');
}

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
let version: string | null = null;
const states: string[] = [];

if (existsSync(pkgJsonPath)) {
  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    version = pkgJson.version ?? null;
  } catch {
    states.push('no package.json');
  }
} else {
  states.push('no package.json');
}

// Only run npm info if package.json exists and has a version
let publishedVersion: string | null = null;
if (version !== null) {
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
}
```

**Rationale:**

- Wrap `npm info` in `if (version !== null)` to skip when package.json is missing or has no version
- This prevents unnecessary network calls and misleading error messages
- Cleaner state reporting: only "no package.json" when appropriate

### 2. Update Pseudo-Code

**File:** `$PROJECT/architecture/_pseudo.md`

**Location:** Lines 194-207 (repo command pseudo-code, package state collection)

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
  else:
    published = npmInfo(pkg.canonicalName)                      // try/catch -> null
    if published is null: published = "unknown"; states.push("npm info failed")
  packageStates.push({
    canonicalName: pkg.canonicalName, version, published,
    branch: checkout.record.branch, directory: pkgPath, states
  })
```

**Rationale:**

- Pseudo-code now matches the implementation: only call `npmInfo` when `version` is not null
- Clearer control flow with explicit `if/else`

### 3. Update or Add Tests

**File:** `$PROJECT/src/commands/repo/runRepo.test.ts`

**Action:** Update the existing test "package path has no package.json" (lines 177-206) to verify that "npm info failed" is NOT in the output.

**Current test (lines 177-206):**

```typescript
it('package path has no package.json', async () => {
  const tempDir = makeTempDir(tempDirs);
  const ctx = createCommandContext(tempDir);
  const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
  await initGitRepo(checkoutDir);

  writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
  writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

  writeProjectRecord(checkoutDir, 'Artificial', {
    remote: 'git@example.com:artificial.git',
    path: '.',
    namespaces: ['Art Domains'],
  });
  writeNamespaceRecord(checkoutDir, 'Art Domains', {
    path: 'artisans',
    packages: ['Art Mantras'],
  });
  writePackageRecord(checkoutDir, 'Art Mantras', {
    canonicalName: '@artisans/art-mantras',
    path: 'apps/art-mantras',
  });

  vi.mocked(execSync).mockReturnValue('1.0.0\n');

  await runRepo(ctx, { checkoutNames: ['Artificial'] });

  const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
  expect(output).toContain('no package.json');
});
```

**Updated test:**

```typescript
it('package path has no package.json', async () => {
  const tempDir = makeTempDir(tempDirs);
  const ctx = createCommandContext(tempDir);
  const checkoutDir = join(tempDir, ctx.config.clone.path, 'artificial');
  await initGitRepo(checkoutDir);

  writeRepoRecord(tempDir, 'Artificial', 'git@example.com:artificial.git');
  writeCheckoutRecord(tempDir, 'Artificial', 'Artificial', 'artificial');

  writeProjectRecord(checkoutDir, 'Artificial', {
    remote: 'git@example.com:artificial.git',
    path: '.',
    namespaces: ['Art Domains'],
  });
  writeNamespaceRecord(checkoutDir, 'Art Domains', {
    path: 'artisans',
    packages: ['Art Mantras'],
  });
  writePackageRecord(checkoutDir, 'Art Mantras', {
    canonicalName: '@artisans/art-mantras',
    path: 'apps/art-mantras',
  });

  vi.mocked(execSync).mockReturnValue('1.0.0\n');

  await runRepo(ctx, { checkoutNames: ['Artificial'] });

  const output = (console.info as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]).join('\n');
  expect(output).toContain('no package.json');
  expect(output).not.toContain('npm info failed'); // NEW: verify npm info is skipped

  // Verify execSync was NOT called (npm info skipped)
  expect(execSync).not.toHaveBeenCalled();
});
```

**Rationale:**

- Test now verifies that `npm info` is NOT called when package.json is missing
- Ensures the fix works as expected

## Workflow

1. **Read mandatory files** listed above
2. **Update `runRepo.ts`** — wrap npm info in `if (version !== null)` check
3. **Update pseudo-code** — reflect the new logic in `architecture/_pseudo.md`
4. **Update test** — verify npm info is skipped when package.json is missing
5. **Run tests:** `npm test` — all tests must pass
6. **Verify manually:** Run `npm run workspace repo` on a checkout with missing package.json files
7. **Commit** with message: `fix(workspace-cli): skip npm info when package.json is missing`
8. **Push** to remote

## Validation

- All existing tests pass: `npm test`
- New test verifies `execSync` is not called when package.json is missing
- Manual verification shows only "no package.json" state (no "npm info failed")
- Command runs faster (fewer npm info calls)

## Rules

- DO NOT modify unrelated code
- DO NOT add new features
- DO NOT refactor the entire function
- Follow existing code style
- Keep changes minimal and focused
- Update pseudo-code to match implementation

## Report Back

After completing the work, report:

- Files changed
- Tests status (pass/fail)
- Manual verification results
- Any issues or blockers encountered
