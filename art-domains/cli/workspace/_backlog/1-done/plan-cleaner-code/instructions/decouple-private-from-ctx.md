# Instructions: `refactor(workspace-cli): decouple private layer from WorkspaceContext`

**Plan:** `plan-cleaner-code`

**Commit:** `decouple-private-from-ctx`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `decouple-private-from-ctx`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Remove `WorkspaceContext` from the `src/private/` layer: move orchestration (store writes, ops logging, error handling) up to the command layer and narrow every `private/` function to explicit minimal inputs. Behaviour preserved — tests pass unchanged.

## Mandatory Reading

- `$PROJECT/architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, scanning.
- `$PROJECT/architecture/_pseudo.md` — `### Function: scanWorkspaceState`, `### Function: scanCheckoutState`, `### Function: scanAllCheckoutsStates`, `### Function: scanExtraneousCheckouts`.
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

1. Eliminate `scanWorkspaceState`
2. Move `scanAllCheckoutsStates` into the store
3. Make `scanExtraneousCheckouts` sanity-private
4. Extract `doPullCheckout` shared helper
5. Move `createOrSwitchBranch` to `private/git`
6. Narrow `hydrateStoreFromRecords`
7. Narrow `presentCheckoutReport`
8. Narrow `presentWorkspaceReport`
9. Update architecture docs

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

## Steps

### Step 1 / 9 — Eliminate scanWorkspaceState

Delete `$PROJECT/src/private/scan/scanWorkspaceState.ts` and `$PROJECT/src/private/scan/scanWorkspaceState.test.ts`.

Update `$PROJECT/src/commands/sanity/runSanity.ts`: instead of `scanWorkspaceState(ctx)`, create the workspace `Checkout` first (see `$PROJECT/src/private/store/createCheckout.ts` — the workspace checkout is built from the config clone path and the workspace record), then call `scanCheckoutState(workspaceCheckout)`. Set `ctx.workspace = workspace`.

Why: the workspace is just another checkout — one scan path, less duplication, one less `ctx`.

### Step 2 / 9 — Move scanAllCheckoutsStates into the store

Relocate `$PROJECT/src/private/scan/scanAllCheckoutsStates.ts` (and `scanAllCheckoutsStates.test.ts`) to `$PROJECT/src/private/store/`. New signature: `scanAllCheckoutsStates(store: CheckoutStore)`. Update all call sites and imports.

Why: pure store iteration + update — a store capability; removes `ctx` from the scan layer.

### Step 3 / 9 — Make scanExtraneousCheckouts sanity-private

Move `$PROJECT/src/private/scan/scanExtraneousCheckouts.ts` (and test) under `$PROJECT/src/commands/sanity/private/`. New signature: `scanExtraneousCheckouts(config: WorkspaceConfig)` returning the extraneous checkouts it creates.

Update `$PROJECT/src/commands/sanity/runSanity.ts`: `const extraneous = await scanExtraneousCheckouts(ctx.config);` then `presentExtraneousReport(extraneous);`. Do NOT add them to the store and do NOT call `scanAllCheckoutsStates` again with them — extraneous are listed only in the Extraneous Report.

Update `$PROJECT/src/private/present/presentExtraneousReport.ts`: change signature from `(store: CheckoutStore)` to `(extraneous: Checkout[])` (new param); drop the `store.getExtraneous()` lookup.

Why: sanity is the only caller; returning results keeps the function pure w.r.t. the store and lets the caller own mutations.

### Step 4 / 9 — Extract doPullCheckout shared helper

Strip error handling and ops logging from `$PROJECT/src/private/git/pullCheckout.ts` (keep the pure git operation). Add `$PROJECT/src/commands/shared/doPullCheckout.ts` handling errors and ops logging; called by `runPull` and `runSync`. Update `pullCheckout.test.ts` call sites to the new signature.

Why: error handling and ops logging are command-layer concerns, not git-layer.

### Step 5 / 9 — Move createOrSwitchBranch to private/git

Move `$PROJECT/src/commands/branch/private/createOrSwitchBranch.ts` (and test) to `$PROJECT/src/private/git/createOrSwitchBranch.ts`. Update imports in `runBranch.ts`.

Why: pure git operation; belongs with the git helpers.

### Step 6 / 9 — Narrow hydrateStoreFromRecords

`$PROJECT/src/private/store/hydrateStoreFromRecords.ts`: change signature from `(ctx, records)` to `(config: WorkspaceConfig, store: CheckoutStore, records)`. Update call sites (`runSanity`, `runRepo`, clone flows).

### Step 7 / 9 — Narrow presentCheckoutReport

`$PROJECT/src/private/present/presentCheckoutReport.ts`: change signature from `(ctx: WorkspaceContext, checkouts?)` to `(config: WorkspaceConfig, checkouts: Checkout[])`. Callers already call `getAllCheckouts()` before presenting — update call sites (`runSanity`, clone flows) to pass the checkout list explicitly.

### Step 8 / 9 — Narrow presentWorkspaceReport

`$PROJECT/src/private/present/presentWorkspaceReport.ts`: change signature from `(ctx)` to `(workspace?: Checkout)`. Only needs the workspace checkout; drops the last `present/` ctx coupling.

### Step 9 / 9 — Update architecture docs

Update `$PROJECT/architecture/context-model.md` and `$PROJECT/architecture/_pseudo.md`: drop `### Function: scanWorkspaceState`, move `scanAllCheckoutsStates` to the store, and update the scan function signatures (no `ctx`).

## Final Verification

**Sanity check:** `npm run test` passes with all call sites updated; the touched `private/` functions no longer take or use `ctx`.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `$PROJECT/_backlog/3-now/plan-cleaner-code/instructions/decouple-private-from-ctx__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `decouple-private-from-ctx`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
