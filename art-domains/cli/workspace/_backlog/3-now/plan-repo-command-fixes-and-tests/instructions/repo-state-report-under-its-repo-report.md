# Instructions: group package reports under repository reports

**Plan:** `plan-repo-command-fixes-and-tests`

**Commit.id:** `repo-state-report-under-its-repo-report`

**Commit.message:** `fix(workspace-cli): group package reports under repository reports`

## Before you Start

::switch `agent-worker` — execute this instruction in worker mode.

Use `plan__bugs.md` as the source of the detailed scenario and avoid duplicating its full bug narrative.

## Path Variables

| Variable   | Resolved Path                        | Purpose                     |
| ---------- | ------------------------------------ | --------------------------- |
| `$PROJECT` | Provided project checkout            | Artificial repository root. |
| `$PACKAGE` | `$PROJECT/art-domains/cli/workspace` | Workspace CLI package.      |

## Working Agreements

1. Keep this instruction and its report self-contained.
2. Work only on report ordering and its regression coverage.
3. Do not commit or push without explicit approval.

## Goals

Present each Repository State Report immediately followed by the matching Package State Report, preserving formatting and empty-package behavior.

## Mandatory Reading

- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`
- `$PACKAGE/src/commands/repo/runRepo.ts`
- `$PACKAGE/src/commands/repo/runRepo.test.ts`
- `$PACKAGE/src/private/present/presentCheckoutRepositoryState.ts`
- `$PACKAGE/src/private/present/presentPackageStateReport.ts`
- `$PACKAGE/architecture/_pseudo.md`

## Setup

From `$WORKSPACE/`:

```bash
npm ci
```

## Changes

### Step 1 — Confirm the root cause

1. Inspect the final presentation loops in `runRepo`.
2. Confirm `repositoryStates` are presented in one loop, followed by a separate loop over `targets` for package reports.
3. Reproduce with at least two targets and capture the output order; verify all repository reports appear before package reports.
4. Identify the association key currently used by `allPackageStates` and verify whether it can select the wrong checkout.

### Step 2 — Apply the fix

1. Build a presentation structure that retains the repository state and its package states together.
2. Present each repository state followed immediately by its associated package report.
3. Preserve report presenters, headers, spacing, no-project behavior, and empty package arrays.
4. Add a regression test that spies on or captures presentation calls and asserts contiguous ordering.

### Step 3 — Follow-up improvements

- Extract a small report-section presenter if ordering logic remains embedded in `runRepo`.
- Add a contract-level architecture example showing repository/package report adjacency.

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

Confirm no global batch of repository reports is emitted, each package report follows its repository report, and repositories without packages remain correctly represented.

## How to Report Back

Render a report beside this instruction with root-cause evidence, changed files, ordering-test evidence, verification results, and follow-ups. Report a blocker if output capture or existing test seams prevent reliable verification.
