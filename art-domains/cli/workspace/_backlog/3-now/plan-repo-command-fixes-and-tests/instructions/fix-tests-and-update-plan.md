# Instructions: improve repository command test coverage

**Plan:** `plan-repo-command-fixes-and-tests`

**Commit.id:** `fix-tests-and-update-plan`

**Commit.message:** `test(workspace-cli): improve repo command test coverage`

## Before you Start

::switch `agent-worker` — execute this instruction in worker mode.

Execute this instruction after the three repository-command fixes have been implemented or their regression seams are known.

## Path Variables

| Variable     | Resolved Path                                  | Purpose                                           |
| ------------ | ---------------------------------------------- | ------------------------------------------------- |
| `$WORKSPACE` | Current workspace root                         | Install dependencies from the workspace lockfile. |
| `$PROJECT`   | `$WORKSPACE/repos/artificial-discover-records` | Artificial repository root.                       |
| `$PACKAGE`   | `$PROJECT/art-domains/cli/workspace`           | Workspace CLI package.                            |

## Working Agreements

1. Keep this instruction and its report self-contained.
2. Preserve unique regression coverage; remove tests only with evidence of equivalent behavior.
3. Do not commit or push without explicit approval.

## Goals

Add missing repository-command regression coverage and remove only demonstrably redundant or inefficient test setup.

## Mandatory Reading

- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan.md`
- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`
- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/`
- `$PACKAGE/src/commands/repo/runRepo.ts`
- `$PACKAGE/src/commands/repo/runRepo.test.ts`
- `$PACKAGE/_guide.md`

## Setup

From `$WORKSPACE/`:

```bash
npm ci
```

Run package commands from `$PACKAGE/`.

## Changes

1. Validate that the three bug instructions have matching IDs and focused regression expectations.
2. Run `npm run test -- runRepo.test` and record the baseline test count and duration.
3. Add focused coverage for checkout lookup by location, repository/package report ordering, and multiple checkout association.
4. Review repeated setup and assertions in `runRepo.test.ts`; consolidate only when equivalent coverage remains.
5. Record retained, added, removed, or consolidated tests and the evidence for each decision in the report.
6. Update this plan and `plan__bugs.md` with implementation feedback and remaining test follow-ups.

## Verification

From `$PACKAGE/`:

```bash
npm run lint
npm run test -- runRepo.test
```

## Final Verification

Confirm each reported bug has focused regression coverage, no unique behavior was removed, and the focused suite passes.

## How to Report Back

Render a report beside this instruction with baseline/comparison test evidence, changed files, coverage decisions, verification results, and remaining follow-ups.
