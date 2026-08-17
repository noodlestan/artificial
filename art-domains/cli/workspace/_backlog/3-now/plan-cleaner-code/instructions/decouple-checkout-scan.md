# Instructions: `refactor(workspace-cli): decouple checkout scan state from stored Checkout`

**Plan:** `plan-cleaner-code`

**Commit.id:** `decouple-checkout-scan`

**Commit.message:** `refactor(workspace-cli): decouple checkout scan state from stored Checkout`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `decouple-checkout-scan`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Separate the scanned git state from the persisted `Checkout` so the store only holds identity (`repo`, `record`, `path`) and the scan is an optional, computed `CheckoutScan` field. No behaviour change — tests pass updated.

## Mandatory Reading

- `$PROJECT/architecture/context-model.md` — `Checkout`, `CheckoutStore`, scanning.
- `$PROJECT/architecture/_pseudo.md` — `### Function: scanCheckoutState`, `### Function: scanAllCheckoutsStates`, `### Function: scanExtraneousCheckouts`.
- `$PROJECT/_guide.md` — setup and verification commands.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # lint, build and test at repository level
```

If any of these fail, resolve the issue before proceeding with implementation.

## Changes

Tests are implemented first for every changed signature (project lesson — no `it.todo()` left). Steps:

1. Move `Checkout` interface into `src/private/store/types.ts` (identity-only)
2. Add `CheckoutScan` to `src/private/scan/types.ts`; delete `RepoStatus`
3. Remove `markExtraneous` + `getExtraneous` from the store
4. Add `createExtraneousCheckout`; rework `scanExtraneousCheckouts`
5. Make `scanCheckoutState` scan-only
6. Move the current-branch write out of the record
7. Switch blast-radius consumers to `checkout.scan.X`
8. Update architecture docs

## Rules

- RULE: Tests first — update/add tests before the implementation of each step.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Verification

Run after each step from `$PROJECT`:

```bash
npm run lint
npm run build
npm run test
```

## Verification

Run from `$PROJECT` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test at repository level
```

## Steps

### Step 1 / 8 — Move Checkout interface to store/types.ts (identity-only)

Move the `Checkout` interface from `$PROJECT/src/private/store/createCheckout.ts` into a new `$PROJECT/src/private/store/types.ts` (create the file, update imports and re-exports). Narrow it to identity-only:

```ts
export interface Checkout {
  repo?: RepositoryRecord;
  record: CheckoutRecord;
  path: string;
  scan?: CheckoutScan;
}
```

Note: there is NO `extraneous` field — extraneous are created, scanned, and presented only in sanity; they never live in the store.

Why: the store's Checkout no longer carries derived git state; scan is a separate, optional concern.

### Step 2 / 8 — Add CheckoutScan to scan/types.ts; delete RepoStatus

In `$PROJECT/src/private/scan/types.ts` add `CheckoutScan` and delete the unused `RepoStatus`:

```ts
export interface CheckoutScan {
  exists: boolean;
  hasRemote: boolean;
  remoteBranch: string | null;
  detached: boolean;
  conflicts: boolean;
  dirty: boolean;
  unpushed: number;
  isBehind: boolean;
  issues: string[];
}
```

Why: `RepoStatus` is dead; the scan type is the single home for scanned state.

### Step 3 / 8 — Remove markExtraneous and getExtraneous from the store

Remove `markExtraneous` AND `getExtraneous` from `$PROJECT/src/private/store/createCheckoutStore.ts` (no extraneous in the store at all). Update `createCheckoutStore.test.ts` accordingly (drop the `markExtraneous` tests and any `getExtraneous` assertions).

### Step 4 / 8 — Add createExtraneousCheckout; rework scanExtraneousCheckouts

Add `$PROJECT/src/private/scan/private/createExtraneousCheckout.ts` (creates a checkout for a location with no matching record).

Rework `$PROJECT/src/commands/sanity/private/scanExtraneousCheckouts.ts` (moved in the previous commit) to: `createExtraneousCheckout(config, location)` → `scanCheckoutState(checkout)`, collecting and returning the scanned list to `runSanity` — no `store.addCheckout`, no store mutation.

Why: extraneous becomes a creation concern (not a store mutation); the scan layer owns checkout construction, the store just persists.

### Step 5 / 8 — Make scanCheckoutState scan-only

`$PROJECT/src/private/scan/scanCheckoutState.ts` must not touch `repo`, `record`, or `path`; it only returns `{ ...checkout, scan: createCheckoutScan(checkout) }`. The dir-doesn't-exist early path returns `createCheckoutNoClonedScan()` (`exists: false`, `issues: ['not cloned']`).

### Step 6 / 8 — Move the current-branch write out of the record

`scanCheckoutState` currently writes the git branch into `checkout.record.branch`; under this model the observed branch belongs in `CheckoutScan.branch` (add `branch: string | null` to `CheckoutScan`). `record.branch` remains the configured pull/push target.

Why: "don't touch record" means the record is immutable identity; the current branch is observed state.

### Step 7 / 8 — Switch blast-radius consumers to checkout.scan.X

Update every consumer below to read the scanned fields from `checkout.scan` (use `scan?.` where the field is optional):

- `$PROJECT/src/private/present/presentCheckoutReport.ts` — `c.issues`, `c.record.branch` → `c.scan?.issues`, `c.scan?.branch`
- `$PROJECT/src/private/present/presentWorkspaceReport.ts` — `workspace.issues`, `record.branch` → `scan?.`
- `$PROJECT/src/private/present/presentExtraneousReport.ts` — `c.issues` → `c.scan?.issues`
- `$PROJECT/src/private/scan/isCleanCheckout.ts` — `exists`, `dirty`, `conflicts`, `detached`
- `$PROJECT/src/private/git/pullCheckout.ts`, `$PROJECT/src/commands/sanity/private/pullWorkspaceCheckout.ts`, `$PROJECT/src/commands/sanity/private/pushCheckout.ts` — `issues`
- `$PROJECT/src/commands/clone/private/cloneIfMissing.ts`, `$PROJECT/src/commands/branch/runBranch.ts` — `scanned.exists`
- `$PROJECT/src/commands/pull/runPull.ts`, `$PROJECT/src/commands/push/runPush.ts`, `$PROJECT/src/commands/sync/runSync.ts` — `isBehind`, `unpushed`
- `$PROJECT/src/commands/repo/runRepo.ts` — `checkout.issues` mutation → `checkout.scan.issues` (its channel is reworked in the next commit)
- `$PROJECT/src/commands/sanity/private/shouldPushCheckout.ts` — `exists`, `issues`, `unpushed`
- Update the corresponding `*.test.ts` call sites and assertions.

### Step 8 / 8 — Update architecture docs

Update `$PROJECT/architecture/context-model.md` (Checkout is identity-only; `CheckoutScan` is a computed field) and `$PROJECT/architecture/_pseudo.md` scan functions accordingly.

## Final Verification

**Sanity check:** no consumer reads `issues`/branch directly off `Checkout` anymore; `RepoStatus`, `markExtraneous`, and `getExtraneous` are gone; `npm run test` passes.

**Verification:**

Run from `$PROJECT` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `$PROJECT/_backlog/3-now/plan-cleaner-code/instructions/decouple-checkout-scan__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `decouple-checkout-scan`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
