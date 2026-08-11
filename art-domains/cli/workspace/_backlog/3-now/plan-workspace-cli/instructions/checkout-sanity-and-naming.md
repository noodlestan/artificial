# Instruction: Checkout Sanity and Naming

**Plan:** `workspace-cli`

**commit.Id:** `checkout-sanity-and-naming`

**Package:** `$PACKAGE` = `repos/artificial/art-domains/cli/workspace` (relative to the workspace root). All file paths in this instruction are relative to `$PACKAGE`; run npm commands in `$PACKAGE`.

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `checkout-sanity-and-naming`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Fix four sanity-reporting issues and adopt a consistent checkout naming convention.

**Sanity fixes:**

| scenario | current | desired |
| --- | --- | --- |
| checkout record exists, directory missing (Conventions, Purrpose) | `repo not cloned` | `no checkout` |
| checkout record exists, repo record missing (Purrtrait) | `clean` (synthetic repo) | `unknown project` — project column empty, states shows `unknown project` |
| directory exists, repo record exists, no checkout record (Purrception) | not listed | shown in Extraneous Report |
| directory exists, no records at all (repos/blah) | not listed | shown in Extraneous Report |

**Naming convention:**

- **checkout name** = `{repo-name}` when at default location, or `{repo-name}-{location}` when at a custom location
- **directory** = `repos/{checkout name}/`
- **record file** = `ops/records/checkouts/{checkout name}.art`
- **record heading** = `## Checkout: {Repository Name}` (the human-readable repo name)
- **record fields**: `**Repository:**`, `**Location:**` (full path), `**Branch:**`

## Mandatory Reading

- `architecture/_pseudo.md` — Use Cases → clone command, sanity command; Auxiliary Functions → `scanCheckout`, `scanExtraneousCheckouts`
- `architecture/commands.md` — Clone section (usage, edge cases), Sanity section
- `architecture/context-model.md` — Checkout, CheckoutStore, Records
- `_backlog/3-now/plan-workspace-cli/plan.md` → `### checkout-sanity-and-naming` — scope, naming convention, states fixes
- `src/shared/scan-checkout.ts` — `scanCheckout`, `scanExtraneousCheckouts` (the two functions you fix)
- `src/private/present/present-checkout-report.ts` — the presenter you adjust for synthetic repos
- `src/commands/clone/clone-specific.ts` — the clone command you update for naming
- `src/commands/clone/private/clone-if-missing.ts` — record saving with new convention
- `src/commands/clone/private/default-location.ts` — location derivation
- `src/shared/checkout.ts` — the `Checkout` shape (`repo`, `record`, `issues`)
- `src/config/types.ts` — `CheckoutRecord`, `RepositoryRecord`
- `src/config/load-checkouts.ts` — checkout hydration (synthetic repo creation)
- patterns: `src/commands/sanity/sanity.test.ts` — temp-dir + real-git test setup
- patterns: `src/commands/clone/clone.test.ts` — clone test setup

## Changes

### Step 1 — Fix scanCheckout states

In `src/shared/scan-checkout.ts`, update the `!dirExists` branch (line 27):

```ts
// Before:
issues: ['repo not cloned']

// After:
issues: ['no checkout']
```

Also, after the git-state scan block (after line 54), add a check for synthetic repos:

```ts
// After the catch block, before the if (detached) checks:
if (checkout.repo.remote === '') {
    issues.unshift('unknown project');
}
```

This sets "unknown project" for checkouts whose repo record is missing (synthetic repo with `remote: ''`). The `unshift` puts it at the front of the issues list so it appears first in the states column.

### Step 2 — Fix scanExtraneousCheckouts path

In `src/shared/scan-checkout.ts`, the `scanExtraneousCheckouts` function (line 96) scans the wrong directory. It uses `ctx.config.records.checkouts.path` (the records directory `ops/records/checkouts/`) instead of the actual checkout directories.

Fix: change line 96 from:

```ts
const checkoutsPath = join(ctx.root, ctx.config.records.checkouts.path);
```

to:

```ts
const checkoutsPath = join(ctx.root, ctx.config.clone.path);
```

This makes it scan `repos/` (where checkout directories live) instead of `ops/records/checkouts/` (where record files live).

### Step 3 — Fix presentCheckoutReport for synthetic repos

In `src/private/present/present-checkout-report.ts`, update the row mapping (line 10–15) to leave the repo column empty for synthetic repos:

```ts
const rows = checkouts.map(c => [
    c.repo.remote === '' ? '' : c.repo.name,
    c.record.location,
    c.branch,
    c.issues.join('; ') || 'clean',
]);
```

Also update the sort (line 7) to handle empty repo names — synthetic repos sort last:

```ts
checkouts.sort((a, b) => {
    if (a.repo.remote === '' && b.repo.remote !== '') return 1;
    if (a.repo.remote !== '' && b.repo.remote === '') return -1;
    return a.repo.name.localeCompare(b.repo.name);
});
```

### Step 4 — Update clone naming convention

In `src/commands/clone/clone-specific.ts`, update the location and checkout-name derivation.

Current flow (line 39–41):

```ts
const override = existingRecords.find(r => r.repo.name === repo.name);
const location = target ?? override?.location ?? defaultLocation(repo);
checkout = ctx.store.addCheckout(repo, location);
```

New flow:

```ts
// Derive checkout name: repo-name (default) or repo-name-location (custom)
const locationBasename = target ? basename(target) : repo.name.toLowerCase().replace(/\s+/g, '-');
const checkoutName = target ? `${repo.name}-${locationBasename}` : repo.name;
const resolvedLocation = target
    ? join(ctx.config.clone.path, locationBasename)
    : defaultLocation(repo);

// Find existing by checkout name
let checkout = ctx.store.findCheckout(checkoutName);
if (checkout && checkout.record.location !== resolvedLocation) {
    const msg = `checkout for '${repo.name}' exists at ${checkout.record.location}. Cannot clone to ${resolvedLocation}.`;
    ctx.log.log(createCloneFailure(checkout, msg));
    return;
}
if (!checkout) {
    // Check if location is taken by a different checkout
    const allCheckouts = ctx.store.getAllCheckouts();
    const conflicting = allCheckouts.find(c => c.record.location === resolvedLocation);
    if (conflicting) {
        const msg = `location ${resolvedLocation} is already used by checkout '${conflicting.record.name}'.`;
        ctx.log.log(createCloneFailure(conflicting, msg));
        return;
    }
    checkout = ctx.store.addCheckout(repo, resolvedLocation);
}
```

Also add `import { basename, join } from 'node:path';` at the top (add `basename` to the existing `join` import).

### Step 5 — Update cloneIfMissing record saving

In `src/commands/clone/private/clone-if-missing.ts`, update the record filename and heading.

Current (line 32–36):

```ts
const recordFile = join(
    ctx.root,
    ctx.config.records.checkouts.path,
    `${rescan.repo.name.toLowerCase().replace(/\s+/g, '-')}.art`,
);
```

New — derive filename from the checkout name (which may include the location suffix). The checkout name is stored in `rescan.record.name` after Step 4 sets it via `addCheckout`. But `addCheckout` currently uses `repo.name` as the record name. You need to ensure the record name matches the checkout name.

This requires updating `createCheckout` in `src/shared/checkout.ts` to accept an optional `name` parameter:

```ts
export function createCheckout(
    repo: RepositoryRecord,
    location: string,
    branch: string,
    name?: string,
): Checkout {
    return {
        repo,
        record: { name: name ?? repo.name, location, branch },
        // ... rest unchanged
    };
}
```

And updating `addCheckout` in `src/shared/checkout-store.ts` to pass it through:

```ts
addCheckout(repo: RepositoryRecord, location: string, name?: string): Checkout {
    const checkout = createCheckout(repo, location, 'main', name);
    checkouts.set(checkout.record.name.toLowerCase(), checkout);
    return checkout;
}
```

Then in `clone-specific.ts`, pass the checkout name:

```ts
checkout = ctx.store.addCheckout(repo, resolvedLocation, checkoutName);
```

Back in `clone-if-missing.ts`, the filename becomes:

```ts
const recordFile = join(
    ctx.root,
    ctx.config.records.checkouts.path,
    `${rescan.record.name.toLowerCase().replace(/\s+/g, '-')}.art`,
);
```

And the saved record heading uses the repo name (not the checkout name):

```ts
saveCheckoutRecord(
    recordFile,
    {
        name: rescan.repo.name,  // heading: ## Checkout: {repo.name}
        repository: `Repository: ${rescan.repo.name}`,
        location: rescan.record.location,
        branch: actualBranch || 'main',
    },
    ctx.config,
    ctx.root,
);
```

### Step 6 — Update tests

Update existing tests and add new ones:

- `src/shared/scan-checkout.test.ts`: test "no checkout" message (record exists, dir missing); test "unknown project" issue (synthetic repo)
- `src/commands/sanity/sanity.test.ts`: test extraneous detection for directories under `repos/` without checkout records
- `src/commands/clone/clone.test.ts`: test new naming convention — `clone Artificial foo` creates checkout named `Artificial-foo` at `repos/foo`; test idempotency; test location conflict; test checkout-name conflict

### Step 7 — Update pseudo and commands.md

- `architecture/_pseudo.md` → clone use case: update checkout name derivation to `{repo-name}` or `{repo-name}-{location}`
- `architecture/_pseudo.md` → `scanCheckout`: update `!dirExists` branch to `"no checkout"`, add `"unknown project"` for synthetic repos
- `architecture/_pseudo.md` → `scanExtraneousCheckouts`: note it scans `config.clone.path` (not `config.records.checkouts.path`)
- `architecture/commands.md` → Clone section: update naming convention description, update edge cases

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: Touch ONLY the files listed under `## Changes`. Do not modify other commands or the shared data model beyond the scope described.
- RULE: Keep the repo conventions: one function per file, tabs, no unused imports (lint enforces), no `console.log` in source (use `console.warn` for warnings; presenters own `console.info`).
- RULE: All existing tests must still pass; coverage must stay above thresholds (lines 70 / functions 70 / branches 60 / statements 70).
- RULE: Do not run commands against real checkouts. Verification is test-driven plus `--help` and `npm run workspace sanity`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Fix scanCheckout states
Step 2. Fix scanExtraneousCheckouts path
Step 3. Fix presentCheckoutReport for synthetic repos
Step 4. Update clone naming convention
Step 5. Update cloneIfMissing record saving
Step 6. Update tests
Step 7. Update pseudo and commands.md

Execute all the steps autonomously, one by one, including running the validation commands.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `$PACKAGE` to validate format and typecheck
- Execute `npm run build` in `$PACKAGE` to build
- Execute `npm run test` in `$PACKAGE` to run the unit tests
- Execute `npm run test:coverage` in `$PACKAGE` to verify coverage thresholds

## Steps

### Step 1 / 7 — Fix scanCheckout states

Update `src/shared/scan-checkout.ts` as described in `## Changes` → Step 1. Change `"repo not cloned"` to `"no checkout"`, and add `"unknown project"` for synthetic repos.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 2 / 7 — Fix scanExtraneousCheckouts path

Update `src/shared/scan-checkout.ts` as described in `## Changes` → Step 2. Change the scanned path from `config.records.checkouts.path` to `config.clone.path`.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 3 / 7 — Fix presentCheckoutReport for synthetic repos

Update `src/private/present/present-checkout-report.ts` as described in `## Changes` → Step 3. Empty repo column for synthetic repos; sort synthetic repos last.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 4 / 7 — Update clone naming convention

Update `src/commands/clone/clone-specific.ts` as described in `## Changes` → Step 4. Also update `src/shared/checkout.ts` (`createCheckout` optional name) and `src/shared/checkout-store.ts` (`addCheckout` optional name).

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 5 / 7 — Update cloneIfMissing record saving

Update `src/commands/clone/private/clone-if-missing.ts` as described in `## Changes` → Step 5. Use `record.name` for filename, `repo.name` for heading, add `**Repository:**` field.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 6 / 7 — Update tests

Add and update tests as described in `## Changes` → Step 6. Cover: "no checkout" state, "unknown project" state, extraneous detection, new naming convention, idempotency, conflicts.

**Extra validation commands:**

- Execute `npm run test` in `$PACKAGE` — all tests pass
- Execute `npm run test:coverage` in `$PACKAGE` — thresholds hold (70/60/70/70)

### Step 7 / 7 — Update pseudo and commands.md

Update `architecture/_pseudo.md` and `architecture/commands.md` as described in `## Changes` → Step 7. Ensure consistency between the two files.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

## Final Verification

**Sanity check**

Run `npm run workspace sanity` from the workspace root and verify:

- `Conventions` shows `no checkout` in states (not `repo not cloned`)
- `Purrtrait` shows empty repo column and `unknown project` in states (not `clean`)
- `Purrception` appears in the Extraneous Report
- `blah` appears in the Extraneous Report

**Verification steps**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Execute `npm run test:coverage` in `$PACKAGE` — thresholds 70/60/70/70
- Execute `npm run workspace sanity` from the workspace root — verify the four scenarios above
- Commit the changes in the artificial repo with the single message `feat(workspace-cli): checkout naming convention, sanity states corrections, extraneous detection` and push to `origin main`. If the pre-commit hook blocks, fix the issue and create a new commit — do not amend.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `_backlog/3-now/plan-workspace-cli/instructions/checkout-sanity-and-naming__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `checkout-sanity-and-naming`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
