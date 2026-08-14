# Implementation Instruction: Investigate and Document Checkout Name Resolution

**ID:** `investigate-checkout-name-resolution`

**Plan:** `fix-repo-command-issues`

**Commit Message:** `docs(workspace-cli): document checkout name resolution logic in pseudo-code`

## Goal

Investigate the current checkout name resolution behavior in the `repo` command, document the findings, and update the architecture pseudo-code with a new `resolveCheckoutByName` function that captures the expected behavior.

## Background

The `repo` command fails when trying to specify a checkout by name:

- `npm run workspace repo "Repository: No Comply"` → fails
- `npm run workspace repo "No Comply"` → fails
- `npm run workspace repo no-comply` → fails

The checkout record exists at `ops/records/checkouts/no-comply.art`, but the command doesn't resolve it correctly.

## Mandatory Reading

- `$PROJECT/architecture/_pseudo.md` — current pseudo-code (lines 165-211 for repo command)
- `$PROJECT/architecture/commands.md` — repo command BDD scenarios (lines 223-291)
- `$PROJECT/src/commands/repo/runRepo.ts` — current implementation (lines 24-39)
- `$PROJECT/src/private/store/createCheckoutStore.ts` — checkout store methods (lines 43-48)
- `$PROJECT/src/commands/repo/runRepo.test.ts` — existing tests
- `$PROJECT/ops/records/checkouts/no-comply.art` — example checkout record (if exists)

## Investigation Steps

### Step 1: Understand Current Behavior

**Goal:** Document how checkout names are currently resolved.

**Actions:**

1. Read `runRepo.ts` lines 24-39 to see how `checkoutNames` are processed
2. Read `createCheckoutStore.ts` lines 43-48 to see `getCheckoutByName` implementation
3. Trace the flow:
   - User provides: `"Repository: No Comply"`, `"No Comply"`, or `"no-comply"`
   - `runRepo.ts` calls: `ctx.store.getCheckoutByName(name)`
   - `getCheckoutByName` does: `checkout.record.name.toLowerCase() === n.toLowerCase()`
4. Check what `checkout.record.name` actually contains by reading a checkout record file
5. Run the existing tests to see what name formats they use

**Expected Findings:**

- `getCheckoutByName` does exact case-insensitive match on `checkout.record.name`
- Checkout record names may be stored as `"No Comply"` (without "Repository:" prefix)
- User input may include "Repository:" prefix which needs to be stripped
- Need to handle multiple name formats: full name, short name, slug

### Step 2: Identify the Gap

**Goal:** Document what's missing in the current implementation.

**Questions to Answer:**

1. Does `getCheckoutByName` handle the "Repository:" prefix?
2. Does it handle slug format (e.g., "no-comply" vs "No Comply")?
3. Should it match against `checkout.record.name`, `checkout.record.location`, or both?
4. What does the pseudo-code say vs what does the code do?

**Expected Gap:**

- Current `getCheckoutByName` only does exact match on `record.name`
- No prefix stripping logic
- No slug-to-name conversion
- No fallback to location matching

### Step 3: Design the Resolution Logic

**Goal:** Define the expected behavior for checkout name resolution.

**Proposed Logic:**

```
resolveCheckoutByName(store, input):
  // Try exact match first (case-insensitive)
  checkout = store.getCheckoutByName(input)
  if checkout: return checkout

  // Strip "Repository:" prefix if present
  normalized = input.replace(/^Repository:\s*/i, '').trim()
  checkout = store.getCheckoutByName(normalized)
  if checkout: return checkout

  // Try slug format (lowercase, spaces to dashes)
  slug = normalized.toLowerCase().replace(/\s+/g, '-')
  checkout = store.getCheckoutByName(slug)
  if checkout: return checkout

  // Try location match
  checkout = store.getCheckoutForLocation(slug)
  if checkout: return checkout

  return null
```

**Rationale:**

- Exact match first for performance and predictability
- Prefix stripping handles "Repository: No Comply" format
- Slug format handles "no-comply" input
- Location fallback provides flexibility

### Step 4: Update Pseudo-Code

**Goal:** Add a new `### Function: resolveCheckoutByName` section to `architecture/_pseudo.md`.

**Location:** Add after the `### Command: repo` section (after line 211) or in the Auxiliary Functions section.

**Content to Add:**

````markdown
### Function: resolveCheckoutByName(store, input)

**Responsibility:** Resolve a checkout by name, handling multiple input formats (exact name, "Repository:" prefix, slug format, location). Returns the matching checkout or null.

**Pseudo:**

```pseudo
resolveCheckoutByName(store, input)
  // Try exact match first (case-insensitive)
  checkout = store.getCheckoutByName(input)
  if checkout: return checkout

  // Strip "Repository:" prefix if present
  normalized = input.replace(/^Repository:\s*/i, '').trim()
  if normalized !== input:
    checkout = store.getCheckoutByName(normalized)
    if checkout: return checkout

  // Try slug format (lowercase, spaces to dashes)
  slug = normalized.toLowerCase().replace(/\s+/g, '-')
  checkout = store.getCheckoutByName(slug)
  if checkout: return checkout

  // Try location match as fallback
  checkout = store.getCheckoutForLocation(slug)
  if checkout: return checkout

  return null
```
````

**Usage:** The `repo` command uses this function to resolve checkout names provided by the user.

````

### Step 5: Update Repo Command Pseudo-Code

**Goal:** Update the `repo` command pseudo-code to use `resolveCheckoutByName`.

**Current pseudo-code (lines 176-185):**

```pseudo
if checkoutNames is empty:
  targets = ctx.store.getAllCheckouts()
else:
  targets = []
  for name in checkoutNames:
    checkout = ctx.store.getCheckoutByName(name)
    if not checkout:
      warn "unknown checkout: {name}"
      continue
    targets.push(checkout)
````

**Updated pseudo-code:**

```pseudo
if checkoutNames is empty:
  targets = ctx.store.getAllCheckouts()
else:
  targets = []
  for name in checkoutNames:
    checkout = resolveCheckoutByName(ctx.store, name)
    if not checkout:
      warn "unknown checkout: {name}"
      continue
    targets.push(checkout)
```

**Rationale:** Delegates name resolution to a dedicated function that handles multiple formats.

## Changes

### 1. Update `architecture/_pseudo.md`

**File:** `$PROJECT/architecture/_pseudo.md`

**Action:** Add new section after line 211 (after the `repo` command pseudo-code):

````markdown
### Function: resolveCheckoutByName(store, input)

**Responsibility:** Resolve a checkout by name, handling multiple input formats (exact name, "Repository:" prefix, slug format, location). Returns the matching checkout or null.

**Pseudo:**

```pseudo
resolveCheckoutByName(store, input)
  // Try exact match first (case-insensitive)
  checkout = store.getCheckoutByName(input)
  if checkout: return checkout

  // Strip "Repository:" prefix if present
  normalized = input.replace(/^Repository:\s*/i, '').trim()
  if normalized !== input:
    checkout = store.getCheckoutByName(normalized)
    if checkout: return checkout

  // Try slug format (lowercase, spaces to dashes)
  slug = normalized.toLowerCase().replace(/\s+/g, '-')
  checkout = store.getCheckoutByName(slug)
  if checkout: return checkout

  // Try location match as fallback
  checkout = store.getCheckoutForLocation(slug)
  if checkout: return checkout

  return null
```
````

**Usage:** The `repo` command uses this function to resolve checkout names provided by the user.

````

### 2. Update Repo Command Pseudo-Code

**File:** `$PROJECT/architecture/_pseudo.md`

**Action:** Update lines 176-185 to use `resolveCheckoutByName`:

**Before:**

```pseudo
if checkoutNames is empty:
  targets = ctx.store.getAllCheckouts()
else:
  targets = []
  for name in checkoutNames:
    checkout = ctx.store.getCheckoutByName(name)
    if not checkout:
      warn "unknown checkout: {name}"
      continue
    targets.push(checkout)
````

**After:**

```pseudo
if checkoutNames is empty:
  targets = ctx.store.getAllCheckouts()
else:
  targets = []
  for name in checkoutNames:
    checkout = resolveCheckoutByName(ctx.store, name)
    if not checkout:
      warn "unknown checkout: {name}"
      continue
    targets.push(checkout)
```

### 3. Document Findings

**File:** `$PROJECT/_backlog/3-now/plan-fix-repo-command-issues/instructions/investigate-checkout-name-resolution__findings.md`

**Action:** Create a findings document with:

- Current behavior analysis
- Identified gaps
- Proposed resolution logic
- Test cases to cover

**Template:**

```markdown
# Checkout Name Resolution — Investigation Findings

## Current Behavior

- `getCheckoutByName` does exact case-insensitive match on `checkout.record.name`
- No prefix stripping
- No slug conversion
- No location fallback

## Identified Gaps

1. User input "Repository: No Comply" doesn't match record name "No Comply"
2. User input "no-comply" (slug) doesn't match record name "No Comply"
3. No fallback to location matching

## Proposed Resolution Logic

1. Exact match (case-insensitive)
2. Strip "Repository:" prefix, then exact match
3. Convert to slug format, then exact match
4. Fallback to location match

## Test Cases

- `repo "No Comply"` → matches checkout with record.name = "No Comply"
- `repo "Repository: No Comply"` → matches checkout with record.name = "No Comply"
- `repo "no-comply"` → matches checkout with record.name = "No Comply" or location = "no-comply"
- `repo "Unknown"` → warns "unknown checkout: Unknown"
```

## Workflow

1. **Read mandatory files** listed above
2. **Investigate current behavior** — trace the code flow, check record files
3. **Identify the gap** — document what's missing
4. **Design resolution logic** — define expected behavior
5. **Update pseudo-code** — add `resolveCheckoutByName` function
6. **Update repo command pseudo-code** — use new function
7. **Document findings** — create findings document
8. **Commit** with message: `docs(workspace-cli): document checkout name resolution logic in pseudo-code`
9. **Push** to remote

## Validation

- Pseudo-code is syntactically correct
- New function is clearly documented
- Repo command pseudo-code references the new function
- Findings document captures the investigation

## Rules

- DO NOT modify source code (this is an investigation task)
- DO NOT modify tests
- DO NOT implement the resolution logic yet
- DO update architecture documentation
- DO document findings thoroughly
- Follow existing pseudo-code style

## Report Back

After completing the work, report:

- Files changed
- Investigation findings summary
- Pseudo-code changes made
- Any issues or blockers encountered
