# Instructions: `refactor(workspace-cli): model CheckoutScan as operation guards over states`

**Plan:** `plan-cleaner-code`

**Commit.id:** `decouple-checkout-scan-states`

**Commit.message:** `refactor(workspace-cli): model CheckoutScan as operation guards over states`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `decouple-checkout-scan-states`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Replace the flat scan flags with a state-machine `CheckoutScan` exposing `should(op)` / `can(op)` guards and a derived `issues()`. Callers gate on guards, never on raw fields; `isCleanCheckout` is removed; `runRepo` presents repository state via a new `presentRepositoryState` report. Tests pass updated; no behaviour change.

## Mandatory Reading

- `$PROJECT/architecture/context-model.md` — `Checkout`, `CheckoutStore`, scanning.
- `$PROJECT/architecture/_pseudo.md` — `### Function: scanAllCheckoutsStates` / `scanCheckoutState`.
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

1. Define `CheckoutOp` in `src/private/operations/types.ts`
2. Redefine `CheckoutScan` as states + guards
3. Define the `CheckoutState` discriminated union + factories
4. Define the guard contract (`can` / `should` / `issues`)
5. Gate every caller on guards; remove `isCleanCheckout`; delete `doesIssueBlockPush`
6. Make `scanCheckoutState` compose the states
7. Mutation consumers re-scan, not mutate
8. `runRepo` → `CheckoutRepositoryState` + new `presentRepositoryState`
9. Presenters read branch from the state
10. Update architecture docs

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

### Step 1 / 10 — Define CheckoutOp in operations/types.ts

In `$PROJECT/src/private/operations/types.ts` add:

```ts
type CheckoutOp = 'clone' | 'push' | 'pull' | 'branch';
```

### Step 2 / 10 — Redefine CheckoutScan as states + guards

In `$PROJECT/src/private/scan/types.ts` redefine `CheckoutScan`:

```ts
export interface CheckoutScan {
  states: CheckoutState[];
  state: (type: string) => T; // inferred by state type
  should: (op: CheckoutOp) => boolean;
  can: (op: CheckoutOp) => boolean;
  issues: () => string[];
}
```

The typed accessor contract is confirmed: `state<'sync'>('sync')` returns the `sync` state variant (see Step 3).

### Step 3 / 10 — Define the CheckoutState discriminated union + factories

Define a discriminated `CheckoutState` union with the seven variants and one `create*State()` factory each:

- `CheckoutStateRepo` (type: 'repo' → unknown repo)
- `CheckoutStateExists` (type: 'exists' → not cloned)
- `CheckoutStateRemote` (type: 'remote'; branch → no remote, wrong branch)
- `CheckoutStateSync` (type: 'sync'; delta: number → {n} ahead, {n} behind)
- `CheckoutStateCommitted` (type: 'committed' → uncommitted files)
- `CheckoutStateNoConflicts` (type: 'no-conflicts' → merge conflicts)
- `CheckoutStateNoDetached` (type: 'no-detached' → detached HEAD)

Why: `issues` and operation eligibility are derived from states, not stored flat flags.

### Step 4 / 10 — Define the guard contract

- `can(op)` — checkout is in a state permitting the op (≈ old isCleanCheckout: exists, not dirty/conflicted/detached, has remote where required).
- `should(op)` — the op has work to do (pull if behind, push if ahead).
- `issues()` — derived string list from the states.

### Step 5 / 10 — Gate every caller on guards

Gate every caller on guards; remove `$PROJECT/src/private/scan/isCleanCheckout.ts` (and test); delete `$PROJECT/src/commands/sanity/private/doesIssueBlockPush.ts` (and test) — it becomes dead:

| Caller                                    | Guard                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `pull/runPull.ts`                         | `scan.can('pull') && scan.should('pull')`                                       |
| `push/runPush.ts`                         | `scan.can('push') && scan.should('push')`                                       |
| `sync/runSync.ts`                         | `can('pull') && should('pull')` → pull → `can('push') && should('push')` → push |
| `sanity/private/shouldPushCheckout.ts`    | `scan.can('push') && scan.should('push')`                                       |
| `sanity/private/pullWorkspaceCheckout.ts` | `workspace.scan.can('pull') && workspace.scan.should('pull')`                   |
| `clone/private/cloneIfMissing.ts`         | `scan.should('clone')` / `scan.can('clone')`                                    |
| `branch/runBranch.ts`                     | branch guard (`OPERATION_BRANCH`)                                               |

### Step 6 / 10 — Make scanCheckoutState compose the states

`$PROJECT/src/private/scan/scanCheckoutState.ts` composes the states (`createCheckoutScan(checkout)`; the dir-missing path returns `createCheckoutNoClonedScan()`), returning `{ ...checkout, scan }`.

### Step 7 / 10 — Mutation consumers re-scan, not mutate

`$PROJECT/src/private/git/pullCheckout.ts`, `$PROJECT/src/commands/sanity/private/pushCheckout.ts`, `$PROJECT/src/commands/sanity/private/pullWorkspaceCheckout.ts` currently do `{ ...checkout, issues: [...], isBehind: false, unpushed: 0 }`. Under derived states they must NOT mutate scan fields. The op flows (runPull / runPush / runSync / sanity auto) rescan what they mutate, when needed: these flows use the `create{op}Success` operations (which are injected with `ctx`); on success, after (eventual) `updateCheckout` mutations, call `scanCheckoutState` again and update the store.

### Step 8 / 10 — runRepo → CheckoutRepositoryState + presentRepositoryState

`$PROJECT/src/commands/repo/runRepo.ts`: make `targets` instances of a new `CheckoutRepositoryState` interface:

```ts
export interface CheckoutRepositoryState {
  target: Checkout;
  branch: string | null;
  issues: string[];
  graph: ProjectGraph;
}
```

The non-git issues ('no project records', 'unknown project') go into `state.issues` — not into `checkout.scan.issues`. Present via a new report `$PROJECT/src/private/present/presentRepositoryState.ts` (`presentRepositoryState(state: CheckoutRepositoryState)`).

### Step 9 / 10 — Presenters read branch from the state

Presenters read the observed branch through the typed state accessor: `(checkout.state('branch') as CheckoutRepositoryState).branch`. `record.branch` stays the pull/push target. Update:

- `present/checkoutReport.ts` — `c.scan.issues().join('; ')`; branch via the state accessor
- `present/workspaceReport.ts` — `ctx.workspace.scan?.issues()`
- `present/extraneousReport.ts` — `c.scan?.issues()`
- `present/packageStateReport.ts` — unaffected (identity only)

### Step 10 / 10 — Update architecture docs

Update `$PROJECT/architecture/context-model.md` and `$PROJECT/architecture/_pseudo.md` to the state-machine `CheckoutScan` (states, guards, derived `issues()`).

## Final Verification

**Sanity check:** no caller reads raw scan fields; `isCleanCheckout.ts` and `doesIssueBlockPush.ts` are gone; `runRepo` presents via `presentRepositoryState`; `npm run test` passes.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `$PROJECT/_backlog/3-now/plan-cleaner-code/instructions/decouple-checkout-scan-states__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `decouple-checkout-scan-states`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
