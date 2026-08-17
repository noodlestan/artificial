# Plan: Workspace CLI — Cleaner Code

**ID:** `plan-cleaner-code`

**Status:** `DRAFT`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Decouple the workspace CLI's private layer from `WorkspaceContext` and split scanned git state from persisted checkouts, so `src/private/` functions take explicit minimal inputs and the store only holds identity.

## Scope

- **Workspace:** `ops-workspace`, managed by `@art-domains/workspace-cli`; entry point `$WORKSPACE/_guide.md`.
- **Repository:** Artificial — checkout `$WORKSPACE/repos/artificial-pairing` on branch `pairing`. Backlog lives here; all commits land together when ready to delegate.
- **Package:** `@art-domains/workspace-cli` at `$PROJECT` (`art-domains/cli/workspace`); records via `$WORKSPACE/ops/records`.

## Context

- **Sources:** parking lot `_backlog/_parking-lot.md` → "Injectable Presentation" (tractable once presenters take explicit inputs); refactoring analysis captured during a manual iteration on `_backlog/4-next/plan-fix-reported-bugs/plan.md` — 7 of ~55 `src/private/` files thread the full `ctx`.
- **Guides:** `$PROJECT/_guide.md` — setup, verification, planning workflow.
- **Knowledge:** `$PROJECT/architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, scanning (updated by this plan); `$PROJECT/architecture/_pseudo.md` — `### Command: clone`, `### Function: scanAllCheckoutsStates` / `scanCheckoutState` (updated by this plan).

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, scanning.
- `$PROJECT/architecture/_pseudo.md` — `### Command: clone`, `### Function: scanAllCheckoutsStates`.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan and instruction definitions.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial-pairing` on branch `pairing`; working directory is `$PROJECT`.

## Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Verification

Run from this package directory:

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

All steps MUST pass. No `it.todo()` tests may remain.

## Commits

Commits execute strictly in sequence — the three DRAFT commits form a dependency chain:

`decouple-private-from-ctx` → `decouple-checkout-scan` → `decouple-checkout-scan-states`

### `scan-checkout-state-pure` - `COMMITTED`

**Commit Message:** `refactor(workspace-cli): move checkout store updates to scan call sites`

**Commit:** `b35f0e3` — `scanCheckoutState` made pure (returns updated checkout, no `ctx`/store mutation); store updates move to call sites; clone/sanity flows adapted; tests updated.

**Instructions:** none — executed during a pairing session; no instruction file created.

### `decouple-private-from-ctx` - `COMMITTED`

**Commit Message:** `refactor(workspace-cli): decouple private layer from WorkspaceContext`

**Commit:** `3682f28`

**Changes:** Move orchestration (store writes, ops logging, error handling) up to the command layer; narrow every `private/` function to explicit minimal inputs; tests pass unchanged. Resolved: `runSanity` sends the extraneous list to `presentExtraneousReport(extraneous)` (new param) — no store add, no re-run of `scanAllCheckoutsStates`.

**Instructions File:** `instructions/decouple-private-from-ctx.md`

**Report File:** `instructions/decouple-private-from-ctx__report.md`

### `decouple-checkout-scan` - `READY`

**Commit Message:** `refactor(workspace-cli): decouple checkout scan state from stored Checkout`

**Depends on:** `decouple-private-from-ctx`

Separate scanned git state from the persisted `Checkout`; the store only holds identity (`repo`, `record`, `path`) and the scan is an optional computed `CheckoutScan` field. Resolved: no `extraneous` flag — extraneous are created, scanned, and presented only in sanity; `markExtraneous`/`getExtraneous` removed from the store.

**Instructions File:** `instructions/decouple-checkout-scan.md`

### `decouple-checkout-scan-states` - `READY`

**Commit Message:** `refactor(workspace-cli): model CheckoutScan as operation guards over states`

**Depends on:** `decouple-checkout-scan`

Replace flat scan flags with a state-machine `CheckoutScan` (`should(op)` / `can(op)` guards, derived `issues()`, typed `state(type)` accessor); callers gate on guards; `isCleanCheckout` removed. Resolved: op flows re-scan what they mutate on success; `runRepo` presents `CheckoutRepositoryState` (`{target, issues, graph}`) via new `presentRepositoryState`; presenters read the observed branch from the state.

**Instructions File:** `instructions/decouple-checkout-scan-states.md`

## Follow ups

- The "Injectable Presentation" parking-lot item becomes tractable once presenters take explicit inputs.

## Feedback

None yet.
