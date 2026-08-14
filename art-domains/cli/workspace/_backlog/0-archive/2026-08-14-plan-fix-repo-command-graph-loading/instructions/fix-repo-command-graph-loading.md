# Implementation Instruction: Fix Repo Command Graph Loading

**ID:** `fix-repo-command-graph-loading`

**Plan:** `fix-repo-command-graph-loading`

**Commit Message:** `fix(workspace-cli): repo command resolves package states correctly`

## Goal

Fix the `repo` command to correctly parse namespace records and present reports without duplication.

## Root Cause

Two bugs identified:

1. **Namespace record parser fails on list format:**
   - `readNamespaceRecord.ts` uses regex `/\*\*Packages:\*\*\s*(.+)/` which only captures the first line
   - Actual record format uses multi-line list: `**Packages:**\n\n- Package: Name1\n- Package: Name2`
   - Parser extracts `- Package: Name1` instead of `Name1`
   - Package lookup fails because map keys don't match

2. **Checkout report presented inside loop:**
   - `runRepo.ts` calls `presentCheckoutReport(ctx)` inside the per-checkout loop (line 104)
   - Should be called once after processing all checkouts
   - Causes duplicate checkout list output

## Mandatory Reading

- `$PROJECT/architecture/commands.md` — Repo command BDD scenarios
- `$PROJECT/architecture/_pseudo.md` — repo command pseudo-code (lines 165-211)
- `$PROJECT/src/private/records/project/readProjectRecord.ts` — reference for list parsing pattern
- `$PROJECT/src/private/records/namespace/readNamespaceRecord.ts` — file to fix
- `$PROJECT/src/commands/repo/runRepo.ts` — file to fix
- `$PROJECT/src/test/writeProjectRecord.ts` — test helper to fix

## Changes

### 1. Fix `readNamespaceRecord.ts`

**File:** `$PROJECT/src/private/records/namespace/readNamespaceRecord.ts`

**Current code (lines 19-30):**

```typescript
const packagesMatch = content.match(/\*\*Packages:\*\*\s*(.+)/);

return {
  kind: 'namespace',
  name: nameMatch[1].trim(),
  path: pathMatch?.[1]?.trim() ?? '.',
  packageNames: packagesMatch
    ? packagesMatch[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : [],
};
```

**Fix:** Mirror the pattern from `readProjectRecord.ts` (lines 19-27):

```typescript
const packagesMatch = content.match(/\*\*Packages:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/);

let packageNames: string[] = [];
if (packagesMatch) {
  packageNames = packagesMatch[1]
    .split('\n')
    .map(line => line.replace(/^-\s*Package:\s*/, '').trim())
    .filter(Boolean);
}

return {
  kind: 'namespace',
  name: nameMatch[1].trim(),
  path: pathMatch?.[1]?.trim() ?? '.',
  packageNames,
};
```

**Rationale:** The regex `[\s\S]*?` captures multi-line content until the next section. The parsing extracts package names from `- Package: {name}` lines.

### 2. Fix `runRepo.ts` report presentation

**File:** `$PROJECT/src/commands/repo/runRepo.ts`

**Current code (lines 41-106):**

```typescript
for (const checkout of targets) {
  const graph = loadProjectGraph(checkout.path);
  // ... process packages ...

  presentCheckoutReport(ctx); // BUG: inside loop
  presentPackageStateReport(checkout, packageStates); // BUG: inside loop
}
```

**Fix:** Move report presentation outside the loop:

```typescript
const allPackageStates = new Map<string, PackageStateRecord[]>();

for (const checkout of targets) {
  const graph = loadProjectGraph(checkout.path);
  // ... process packages ...

  allPackageStates.set(checkout.record.name, packageStates);
}

// Present reports once after processing all checkouts
presentCheckoutReport(ctx);
for (const checkout of targets) {
  const packageStates = allPackageStates.get(checkout.record.name) ?? [];
  presentPackageStateReport(checkout, packageStates);
}
```

**Rationale:** Reports should be presented once after all data is collected, not per-checkout.

### 3. Fix test helper `writeNamespaceRecord.ts`

**File:** `$PROJECT/src/test/writeProjectRecord.ts`

**Current code (lines 50-56):**

```typescript
const pkgLine = packages.length > 0 ? `\n**Packages:** ${packages.join(', ')}\n` : '';
writeFileSync(
  join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
  '# Module\n\n## Namespace: ' + name + '\n\n**Path:** `' + nsPath + '`' + pkgLine + '\n',
);
```

**Fix:** Use list format to match actual records:

```typescript
const pkgLines =
  packages.length > 0
    ? '\n**Packages:**\n' + packages.map(pkg => `- Package: ${pkg}`).join('\n') + '\n'
    : '';
writeFileSync(
  join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
  '# Module\n\n## Namespace: ' + name + '\n\n**Path:** `' + nsPath + '`' + pkgLines + '\n',
);
```

**Rationale:** Test helper should write the same format as actual records to catch parsing bugs.

### 4. Update tests

**File:** `$PROJECT/src/private/records/projectGraph/loadProjectGraph.test.ts`

The existing tests should continue to pass after the fixes. No test changes required unless tests fail.

**File:** `$PROJECT/src/commands/repo/runRepo.test.ts`

The existing tests should continue to pass after the fixes. No test changes required unless tests fail.

## Workflow

1. **Read mandatory files** listed above
2. **Fix `readNamespaceRecord.ts`** — update parser to handle list format
3. **Fix `runRepo.ts`** — move report presentation outside loop
4. **Fix `writeProjectRecord.ts`** — update test helper to write list format
5. **Run tests:** `npm test` — all tests must pass
6. **Verify manually:** Create a test workspace with actual record format and run `npm run workspace repo`
7. **Commit** with message: `fix(workspace-cli): repo command resolves package states correctly`
8. **Push** to remote

## Validation

- All existing tests pass: `npm test`
- Manual verification with actual record format shows correct package states
- No "unknown package" warnings for valid packages
- No duplicate checkout list output

## Rules

- DO NOT modify architecture docs
- DO NOT modify pseudo-code
- DO NOT add new features
- DO NOT refactor unrelated code
- Follow existing code style
- Keep changes minimal and focused

## Report Back

After completing the work, report:

- Files changed
- Tests status (pass/fail)
- Manual verification results
- Any issues or blockers encountered
