# Instruction: Branch Command

**Plan:** `workspace-cli`

**commit.Id:** `branch-command`

**Package:** `$PACKAGE` = `repos/artificial/art-domains/cli/workspace` (relative to the workspace root). All file paths in this instruction are relative to `$PACKAGE`; run npm commands in `$PACKAGE`.

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `branch-command`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement the `art-workspace branch` command end to end: wire the CLI arguments, create or switch the same branch across the specified **checkouts** (all checkouts when none specified), log typed `branch created` or `branch checked-out` operations (success and failure), update the checkout state, and present the Checkout Report + Operations Report.

Checkout names are the identity: the command resolves targets by checkout record name (`## Checkout:`), never by repository name. To make that work, checkout resolution must include records that have no matching repository record (e.g. `conventions`), hydrating them with a synthetic repository — see Step 5.

Two record-layer cleanup steps (Steps 1–2) come first: remove the duplicated `CheckoutRecord` type (including the inline `record` shape in `Checkout`) and the duplicated `loadCheckouts` loader so the checkout-name resolution lands on a single source of truth.

This is the first command built on the structured `Operation` model's branch types — do not change the shared data model.

## Mandatory Reading

- `architecture/_pseudo.md` — **the contract**: Data Structures (Checkout, OperationsLog, Operation), Use Cases → branch command, Auxiliary Functions → `hasLocalBranch`, `createWorkspaceContext`
- `architecture/commands.md` — Branch section (usage, procedure, edge cases)
- `architecture/context-model.md` — WorkspaceContext, CheckoutStore, Checkout
- `architecture/operations-log.md` — how operations are logged
- `architecture/reports.md` — Checkout Report and Operations Report formats
- `_backlog/3-now/plan-workspace-cli/plan.md` → `### branch-command` — scope, use case, responsibilities
- `src/private/operations/types.ts` — `BranchSuccess` / `BranchFailure` type definitions (read-only — do not modify)
- `src/shared/checkout.ts` — the `Checkout` shape (`record`, `branch`, `remoteBranch`, `issues`)
- `src/shared/checkout-store.ts` — `loadExistingCheckouts`, `findCheckout`, `getAllCheckouts`, `setCheckout` (how checkouts are keyed and resolved)
- `src/config/types.ts` — the canonical `CheckoutRecord` definition you extend in Step 1
- `src/private/records/checkout-record.ts` — the record serializer/parser; holds the duplicates you remove in Steps 1–2
- `src/config/load-checkouts.ts` — the single checkout hydration path you adjust in Steps 2 and 5
- `src/private/records/checkout-record.test.ts` — the `loadCheckouts` tests you move in Step 2
- patterns: `src/commands/clone/private/clone-if-missing.ts` — real user of `saveCheckoutRecord`; your dedup must not break it
- patterns: `src/index.ts` — the `sanity` action shows the ctx wiring to replicate (config → store → log → ctx)
- patterns: `src/private/operations/create-push-success.ts` and `create-push-failure.ts` — the factory pattern for `create-branch-*`
- patterns: `src/private/git/get-current-branch.ts` — simple-git helper pattern (one function per file, `dir` argument, try/catch)
- patterns: `src/commands/sanity/sanity.test.ts` — temp-dir + real-git test setup, manifest/record writers, ctx construction, console spies
- patterns: `src/config/config.test.ts` — config-level test setup (for the Step 2 test file)
- `src/commands/branch/branch.ts` and `src/commands/branch/branch.test.ts` — the stubs you replace

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Dedup the CheckoutRecord type

`CheckoutRecord` appears three times: `src/config/types.ts` (without `repository`), `src/private/records/checkout-record.ts` (with `repository?`), and as an inline `record` shape in `src/shared/checkout.ts`. Keep one — in `config/types.ts`, the home of config/record types:

- In `src/config/types.ts`, add `repository?: string;` to the `CheckoutRecord` interface.
- In `src/private/records/checkout-record.ts`, delete the local `CheckoutRecord` interface and extend the existing type-only import from `'../../config/types'` with `CheckoutRecord`.
- In `src/shared/checkout.ts`, replace the inline `record: { name; location; branch }` with `record: CheckoutRecord`, adding `CheckoutRecord` to the existing type-only import from `'../config/types'`. `createCheckout` needs no change — `record: { name: repo.name, location, branch }` already satisfies `CheckoutRecord`.

`saveCheckoutRecord`, `readCheckoutRecord`, and the two other `Checkout` literal constructors (`markExtraneous` in `checkout-store.ts`, the `scanCheckout` update in `scan-checkout.ts`) must keep working unchanged — their `record` literals already satisfy the type. Note: `**Repository:** Repository: Artificial` is intentional — the value is a resource reference (kind `Repository`, name `Artificial`). `readCheckoutRecord` captures it raw into `repository`; nothing resolves or parses it — the loader matches by checkout name (Step 5). Do not add resource-reference parsing.

### Step 2 — Dedup the loadCheckouts loader

Two `loadCheckouts` exist: `src/config/load-checkouts.ts` (used by the store and clone) and `src/private/records/checkout-record.ts` (used only by its own test). Keep the config one — it is the live path:

- In `src/private/records/checkout-record.ts`, delete the `loadCheckouts` function and the imports it alone used: `readdirSync` (from `node:fs`), `RepositoryCheckout` (from `'../../config/types'`), `loadRepositories` (from `'./repository-record'`). Keep `saveCheckoutRecord` (used by `src/commands/clone/private/clone-if-missing.ts`) and `readCheckoutRecord`.
- Create `src/config/load-checkouts.test.ts`: move the `loadCheckouts` describe block from `src/private/records/checkout-record.test.ts` verbatim — the four cases (resolves repos by name; warns and skips a checkout for an unknown repo; empty dir → `[]`; two records referencing the same repo) — with their local helpers (`writeRepoRecord`, `writeCheckoutRecordFile`, `makeConfig`, `makeTempDir`). Follow the setup style of `src/config/config.test.ts`.
- In `src/private/records/checkout-record.test.ts`, remove the moved describe block and `loadCheckouts` from its import.

The moved "warns and skips a checkout for an unknown repo" case documents the **current** behavior; Step 5 changes it. Do not reorder or modify the cases during the move — the worker must not return to this step afterwards.

### Step 3 — Add the branch operation factories

Create `src/private/operations/create-branch-success.ts` and `src/private/operations/create-branch-failure.ts`, mirroring the push factories:

- `createBranchSuccess(checkout: Checkout, branch: string, message?: string): BranchSuccess` — `operation: 'branch created'`, `outcome: 'success'`, `message()` returns the passed `message` or `` `created ${branch}` `` by default.
- `createBranchFailure(checkout: Checkout, branch: string, error: unknown): BranchFailure` — mirror `createPushFailure` exactly: `operation: 'branch created'`, `outcome: 'failure'`, `error` holds the raw error string, `message()` extracts the reason (regex `/\(([^)]+)\)/` match, else first trimmed line, else `'unknown error'`), `errorSerialized()` renders `` `BranchError: ${checkout.repo.name} on ${branch} — ${this.message()}\n\n${raw error indented}` ``.

Do not modify `src/private/operations/types.ts`.

### Step 4 — Add the has-local-branch git helper

Create `src/private/git/has-local-branch.ts`:

```ts
export async function hasLocalBranch(dir: string, branch: string): Promise<boolean> {
	const git = simpleGit(dir);
	try {
		await git.raw(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]);
		return true;
	} catch {
		return false;
	}
}
```

Add cases to `src/private/git/git.test.ts` following the existing patterns: a repo with a branch → `true`; a repo without it → `false`.

### Step 5 — Resolve checkouts by record name

Adjust `src/config/load-checkouts.ts` so every checkout record hydrates by its own name, not by repository record name:

- Keep the existing `repo = repos.find(r => r.name === record.name)` match for records that do have a repository.
- When no repository matches, **do not skip** — include the checkout with a synthetic repository `{ name: record.name, remote: '' }` and `console.warn('checkout ' + record.name + ': no matching repository record, using synthetic repository')`. This makes `findCheckout('conventions')`-style lookups resolve.
- Skip records with an empty name (the default from `readCheckoutRecord`) with a warn — an unnamed checkout cannot be addressed.

Rationale: branch operates on checkout names; the store keys checkouts by `record.name` (lowercased) and `findCheckout` resolves case-insensitively. The synthetic repository is inert — `remote: ''` is never used by branch. Clone's `existingRecords.find(r => r.repo.name === repo.name)` lookups are unaffected because synthetic names never match manifest repos.

Extend `src/config/load-checkouts.test.ts` (created in Step 2):

- Update the moved "warns and skips a checkout for an unknown repo" case — it must now expect the checkout to be **included** with a synthetic repository (same name/location/branch; the warn is still emitted).
- Add: record with missing location/branch → defaults applied (`branch` = `'main'`).
- Add: record with an empty name → skipped with a warn.

### Step 6 — Implement the branch command

Rewrite `src/commands/branch/branch.ts`. Replace the `({ root })` options signature with the ctx signature, per the pseudo use case:

```ts
export async function runBranch(
	ctx: WorkspaceContext,
	branch: string,
	checkoutNames: string[],
): Promise<void>
```

Flow:

1. `ctx.store.loadExistingCheckouts();`
2. `const checkouts = ctx.store.getAllCheckouts();`
3. `const targets = checkoutNames.length > 0 ? checkoutNames : checkouts.map(c => c.record.name);` — no checkouts → all checkouts
4. For each `checkoutName`:
   - `let checkout = ctx.store.findCheckout(checkoutName);` — resolves by record name, case-insensitive; none → `console.warn('unknown checkout: ' + checkoutName)`, `continue`
   - `checkout = await scanCheckout(ctx, checkout);` — `!checkout.exists` → `ctx.log.log(createBranchFailure(checkout, branch, new Error('checkout not cloned')))`, `continue`
   - `const dir = join(ctx.root, checkout.record.location);` — call the private helper (Step 6a)
   - helper resolved `'created'` → `ctx.log.log(createBranchSuccess(checkout, branch))`; resolved `'switched'` → `ctx.log.log(createBranchSuccess(checkout, branch, \`switched to ${branch}\`))`
   - helper threw → `ctx.log.log(createBranchFailure(checkout, branch, error))`, `continue`
   - On success update the store: `ctx.store.setCheckout({ ...checkout, branch, record: { ...checkout.record, branch } })`
5. `presentCheckoutReport(ctx.store);` then `presentOperationsReport(ctx.log);` then `ctx.store.syncRecords();`

**Step 6a — private helper** (one function per file, in `src/commands/branch/private/`):

- `create-or-switch-branch.ts` — `createOrSwitchBranch(dir: string, branch: string): Promise<'created' | 'switched'>`: if `await hasLocalBranch(dir, branch)` → `await git.checkout(branch)` (simple-git on `dir`), return `'switched'`; else `await git.checkoutLocalBranch(branch)`, return `'created'`. Let git errors propagate to the caller (Step 6 wraps them in a failure operation).

Note: `ctx.store.syncRecords()` is currently a no-op (see plan Follow-ups — "Checkouts as CLI-managed records"): the branch lands in the in-memory checkout record; persisting checkout records to disk is deferred with that item. Do NOT wire `saveCheckoutRecord` in this command.

### Step 7 — Wire the CLI arguments

In `src/index.ts`, replace the `branch` command block (currently takes no arguments) with:

```ts
program
	.command('branch')
	.description('Branch across checkouts')
	.argument('<branch>', 'branch name to create or switch to')
	.argument('[checkouts...]', 'checkouts to branch (default: all checkouts)')
	.action(async (branch: string, checkoutNames: string[]) => {
		const root = process.cwd();
		const config = await (await import('./config/load-config')).loadWorkspaceConfig(root);
		const { createCheckoutStore } = await import('./shared/checkout-store');
		const { createOperationsLog } = await import('./shared/operations-log');
		const { createWorkspaceContext } = await import('./shared/workspace-context');
		const store = createCheckoutStore(config, root);
		const log = createOperationsLog();
		const ctx = createWorkspaceContext(config, root, store, log);
		await runBranch(ctx, branch, checkoutNames);
	});
```

### Step 8 — Write the command tests

Rewrite `src/commands/branch/branch.test.ts`, following `src/commands/sanity/sanity.test.ts` (temp dirs, real git, `writeManifest`/`writeRepoRecord` writers, ctx construction, `console` spies, cleanup in `afterEach`). Replace the placeholder test with:

- creates and checks out a new branch in a single specified checkout; the store checkout has `branch` and `record.branch` updated; a `branch created` success operation is logged
- branches all checkouts when `checkoutNames` is empty (two checkouts → both branched)
- unknown checkout → `console.warn` called, no operation logged
- checkout record exists but directory missing → `branch created` failure operation logged (`message()` contains `checkout not cloned`), flow continues to next checkout
- checkout record with no matching repository record → still resolved by name (synthetic repository) and branched
- branch already exists → switches to it; success operation message is `switched to {branch}`
- factory unit checks: `createBranchSuccess` default message is `` `created {branch}` ``, `createBranchFailure.errorSerialized()` contains the raw error text

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: Touch ONLY the files listed under `## Changes`. Do not modify other commands, the shared data model, `src/private/operations/types.ts`, or docs.
- RULE: Keep the repo conventions: one function per file, tabs, no unused imports (lint enforces), no `console.log` in source (use `console.warn` for warnings; presenters own `console.info`).
- RULE: All existing tests must still pass; coverage must stay above thresholds (lines 70 / functions 70 / branches 60 / statements 70).
- RULE: Do not run the `branch` command against real checkouts. Verification is test-driven plus `--help`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Dedup the CheckoutRecord type
Step 2. Dedup the loadCheckouts loader
Step 3. Add the branch operation factories
Step 4. Add the has-local-branch git helper
Step 5. Resolve checkouts by record name
Step 6. Implement the branch command
Step 7. Wire the CLI arguments
Step 8. Write the command tests

Execute all the steps autonomously, one by one, including running the validation commands.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `$PACKAGE` to validate format and typecheck
- Execute `npm run build` in `$PACKAGE` to build
- Execute `npm run test` in `$PACKAGE` to run the unit tests
- Execute `npm run test:coverage` in `$PACKAGE` to verify coverage thresholds

## Steps

### Step 1 / 8 — Dedup the CheckoutRecord type

Update `src/config/types.ts` and `src/private/records/checkout-record.ts` as described in `## Changes` → Step 1. The record serializer/parser and `saveCheckoutRecord` callers must be unaffected.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 2 / 8 — Dedup the loadCheckouts loader

Update `src/private/records/checkout-record.ts`, create `src/config/load-checkouts.test.ts`, and prune `src/private/records/checkout-record.test.ts` as described in `## Changes` → Step 2. The store and clone must keep loading checkouts from the config loader.

**Extra validation commands:**

- Execute `npm run test` in `$PACKAGE` (the moved load-checkouts cases must pass)
- Execute `npm run test:coverage` in `$PACKAGE`

### Step 3 / 8 — Add the branch operation factories

Create the two factory files described in `## Changes` → Step 3, following the push factory pattern from mandatory reading.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 4 / 8 — Add the has-local-branch git helper

Create `src/private/git/has-local-branch.ts` and extend `src/private/git/git.test.ts` as described in `## Changes` → Step 4.

**Extra validation commands:**

- Execute `npm run test` in `$PACKAGE` (the new git helper cases must pass)

### Step 5 / 8 — Resolve checkouts by record name

Adjust `src/config/load-checkouts.ts` and extend `src/config/load-checkouts.test.ts` as described in `## Changes` → Step 5. Existing clone/sanity tests must still pass — the synthetic repository must not change their behavior.

**Extra validation commands:**

- Execute `npm run test` in `$PACKAGE` (the updated and new load-checkouts cases must pass)
- Execute `npm run test:coverage` in `$PACKAGE`

### Step 6 / 8 — Implement the branch command

Rewrite `src/commands/branch/branch.ts` and add the private helper as described in `## Changes` → Step 6. Wire imports (presenters, `scanCheckout`, factories, `join`).

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`

### Step 7 / 8 — Wire the CLI arguments

Update the `branch` command block in `src/index.ts` per `## Changes` → Step 7. The old stub signature `runBranch({ root })` no longer exists — the action must build the ctx exactly like the `sanity` action.

**Extra validation commands:**

- Execute `npm run build` in `$PACKAGE`
- Execute `node dist/index.js branch --help` in `$PACKAGE` — output shows `<branch>` and `[checkouts...]` arguments

### Step 8 / 8 — Write the command tests

Rewrite `src/commands/branch/branch.test.ts` per `## Changes` → Step 8. Use the sanity test file as the skeleton (temp dirs, real git, ctx). The test must cover the seven scenarios listed.

**Extra validation commands:**

- Execute `npm run test` in `$PACKAGE` — all tests pass, including the new branch suite
- Execute `npm run test:coverage` in `$PACKAGE` — thresholds hold (70/60/70/70)

## Final Verification

**Sanity check**

`npm run ci` passes and the branch command creates the same branch across multiple checkouts, warns on unknown checkouts, logs failures for uncloned checkouts, switches to existing branches, and renders both reports.

**Verification steps**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Execute `npm run test:coverage` in `$PACKAGE` — thresholds 70/60/70/70
- Execute `npm run ci` in `$PACKAGE`
- Execute `node dist/index.js branch --help` in `$PACKAGE` — shows `<branch>` and `[checkouts...]`
- Commit the changes in the artificial repo with the single message `feat(workspace-cli): implement branch command` (stage only the files under `## Changes`) and push to `origin main`. If the pre-commit hook blocks, fix the issue and create a new commit — do not amend.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `_backlog/3-now/plan-workspace-cli/instructions/branch-command__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `branch-command`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
