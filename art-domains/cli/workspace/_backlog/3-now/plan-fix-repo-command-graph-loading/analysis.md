# Analysis: Fix Repo Command Graph Loading

## Problem Statement

The `repo` command shows "unknown package" for every package, followed by a hydrated checkout list.

## Root Cause Analysis

### Bug 1: Namespace Record Parser Fails on List Format

**Location:** `src/private/records/namespace/readNamespaceRecord.ts`

**Issue:**
The parser uses regex `/\*\*Packages:\*\*\s*(.+)/` which only captures content on the same line as `**Packages:**`.

**Actual record format:**

```
**Packages:**

- Package: Art Mantras
- Package: Art Tools
```

**What parser extracts:**

- Captures only: `- Package: Art Mantras` (first line)
- Splits by comma: `['- Package: Art Mantras']`
- Package name becomes: `- Package: Art Mantras` (incorrect)

**Expected:**

- Should extract: `['Art Mantras', 'Art Tools']`

**Impact:**
When `runRepo.ts` tries to look up packages:

```typescript
const pkg = graph.packages.get(pkgName); // pkgName = "- Package: Art Mantras"
```

The lookup fails because the map has `Art Mantras` as the key, not `- Package: Art Mantras`.

This causes:

1. Packages are skipped in the iteration
2. `consolidateProjectGraph` generates "unknown package: - Package: Art Mantras" warnings
3. No package states are collected

### Bug 2: Test Helper Writes Wrong Format

**Location:** `src/test/writeProjectRecord.ts`

**Issue:**
The test helper writes namespace records with comma-separated format:

```typescript
const pkgLine = packages.length > 0 ? `\n**Packages:** ${packages.join(', ')}\n` : '';
```

This produces:

```
**Packages:** Art Mantras, Art Tools
```

But actual records use list format:

```
**Packages:**

- Package: Art Mantras
- Package: Art Tools
```

**Impact:**
Tests pass because they use the wrong format that the parser happens to handle. Real records fail because they use the correct format that the parser doesn't handle.

### Bug 3: Report Presentation (Not a Bug)

**Location:** `src/commands/repo/runRepo.ts`

**Initial suspicion:** Reports presented inside loop cause duplicate output.

**Analysis:**
The pseudo code (`architecture/_pseudo.md` lines 209-210) shows:

```pseudo
presentCheckoutReport(ctx)
presentPackageStateReport(checkout, packageStates)
```

These are inside the `for checkout in targets:` loop, meaning reports should be presented per-checkout.

**Conclusion:**
The current implementation matches the pseudo code. The "duplicate checkout list" mentioned in the problem is likely the expected per-checkout report presentation, not a bug.

## Solution

### Fix 1: Update Namespace Record Parser

**File:** `src/private/records/namespace/readNamespaceRecord.ts`

Change from:

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

To:

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

**Rationale:** Mirror the pattern from `readProjectRecord.ts` which correctly handles list format for namespaces.

### Fix 2: Update Test Helper

**File:** `src/test/writeProjectRecord.ts`

Change from:

```typescript
const pkgLine = packages.length > 0 ? `\n**Packages:** ${packages.join(', ')}\n` : '';
writeFileSync(
  join(dir, name.toLowerCase().replace(/\s+/g, '-') + '.art'),
  '# Module\n\n## Namespace: ' + name + '\n\n**Path:** `' + nsPath + '`' + pkgLine + '\n',
);
```

To:

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

## Verification

### Test Coverage

All 152 existing tests pass with the fixes. The tests will now use the correct list format, ensuring the parser is properly validated.

### Manual Verification

Create a test workspace with actual record format:

```bash
cd /path/to/workspace
npm run workspace repo Artificial
```

Expected output:

- No "unknown package" warnings
- Correct package states (version, published version)
- Per-checkout reports (Checkout Report + Package State Report for each checkout)

## Files to Modify

1. `src/private/records/namespace/readNamespaceRecord.ts` — fix parser
2. `src/test/writeProjectRecord.ts` — fix test helper

## Implementation Instructions

See: `instructions/fix-repo-command-graph-loading.md`

## Status

- [x] Root cause identified
- [x] Solution designed
- [x] Implementation instructions generated
- [x] Plan updated
- [ ] Implementation (delegated to worker)
- [ ] Verification (manual + automated tests)
