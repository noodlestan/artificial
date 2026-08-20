# Instructions: avoid repeated repository reports for multiple checkouts

**Plan:** `plan-repo-command-fixes-and-tests`

**Commit.id:** `repo-state-report-repeated-checkouts`

**Commit.message:** `fix(workspace-cli): avoid repeated repository reports for multiple checkouts`

## Before you Start

::switch `agent-worker` — execute this instruction in worker mode.

Use `plan__bugs.md` for the detailed scenario. Keep implementation reporting concise and evidence-based.

## Path Variables

| Variable   | Resolved Path                        | Purpose                     |
| ---------- | ------------------------------------ | --------------------------- |
| `$PROJECT` | Provided project checkout            | Artificial repository root. |
| `$PACKAGE` | `$PROJECT/art-domains/cli/workspace` | Workspace CLI package.      |

## Working Agreements

1. Keep this instruction and its report self-contained.
2. Work only on checkout-keyed repository/package state and regression coverage.
3. Do not commit or push without explicit approval.

## Goals

Ensure multiple checkouts of one repository remain distinct in `repo` output, without duplicate or cross-associated Repository and Package State Reports.

## Mandatory Reading

- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`
- `$PACKAGE/src/commands/repo/runRepo.ts`
- `$PACKAGE/src/commands/repo/runRepo.test.ts`
- `$PACKAGE/src/private/store/`
- `$PACKAGE/src/private/resources/`

## Setup

From `$WORKSPACE/`:

```bash
npm ci
```

## Changes

### Step 1 — Confirm the root cause

1. Inspect the keys used by `allPackageStates` and the entries in `repositoryStates`.
2. Confirm package states are keyed by `checkout.record.name` while targets may contain multiple checkouts of one repository and reporting is not keyed by location.
3. Create a fixture with two checkout locations for one repository, each with distinguishable package state, and capture the duplicate or cross-associated output.
4. Confirm the bug is distinct from simple report ordering: the same repository can legitimately have multiple checkout sections.

### Step 2 — Apply the fix

1. Key checkout-specific state by canonical checkout location or another stable unique checkout identity.
2. Use the same key for repository states, package states, and final presentation.
3. Present one section per checkout, followed by only that checkout's package states.
4. Extract package traversal/state helpers only when it improves testability without changing state semantics.
5. Add regression coverage for two checkouts of one repository and retain single-checkout coverage.

### Step 3 — Follow-up improvements

- Consider a typed `CheckoutReportSection` structure to prevent mismatched state maps.
- Consider a dedicated report assembler so presentation ordering is independently testable.

## Verification

Run focused verification before the full suite:

```bash
npm run test -- runRepo.test
```

From `$PACKAGE/`:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

## Final Verification

Confirm each checkout appears exactly once, state/package data stays associated with its location, and existing single-checkout behavior remains unchanged.

## How to Report Back

Render a report beside this instruction with root-cause evidence, fixture details, changed files, verification results, and follow-ups. Report a blocker if the existing test fixtures cannot represent multiple checkouts safely.
