# Plan: Workspace CLI — Fixes and Test Coverage

**ID:** `plan-repo-command-fixes-and-tests`

**Status:** `READY`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Path Variables

| Variable     | Resolved Path                        | Purpose                                                |
| ------------ | ------------------------------------ | ------------------------------------------------------ |
| `$WORKSPACE` | Current workspace root               | Workspace managed by `@art-domains/workspace-cli`.     |
| `$PROJECT`   | Provided by Prompt                   | Artificial repository checkout containing the package. |
| `$PACKAGE`   | `$PROJECT/art-domains/cli/workspace` | `@art-domains/workspace-cli` package.                  |

## Summary

Fix the three reported `@art-domains/workspace-cli` repository-command bugs, add focused regression coverage, remove only demonstrably redundant test work, and update the affected architecture knowledge. Bug details and reproduction evidence are maintained in `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`; this plan contains five executable commit blueprints covering the complete scope.

## Scope

- Fixes from `$PACKAGE/_backlog/_parking-lot.md` and `plan__bugs.md`.
- Repository command reporting and checkout identification.
- Redundant or slow tests identified during test-suite analysis.
- Missing regression coverage for reported bugs.

## Context

### Sources

- Bugs attachment: `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md` — authoritative bug scenarios and evidence.
- Parking lot: `$PACKAGE/_backlog/_parking-lot.md` — actionable fixes and test follow-ups.
- Architect briefing: `$PACKAGE/_backlog/_architect.md` — command and records principles.

### Guides

- `$WORKSPACE/_guide.md` — workspace setup, records, and verification commands.
- `$PROJECT/art-domains/cli/workspace/_guide.md` — package workflow and architecture references.

### Knowledge

- `$PACKAGE/architecture/context-model.md` — repository, checkout, and package report relationships.
- `$PACKAGE/architecture/_pseudo.md` — command and reporting responsibilities.
- `$PACKAGE/src/commands/repo/runRepo.ts` — current repository reporting flow.

## Mandatory Reading

- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`
- `$PACKAGE/architecture/context-model.md`
- `$PACKAGE/architecture/_pseudo.md`
- `$PACKAGE/src/commands/repo/runRepo.ts`

## Execution Context

Work from `$PACKAGE/`. The plan affects the Artificial repository checkout and the workspace CLI package; use `$WORKSPACE` for workspace-level command verification where required.

## Setup

From `$WORKSPACE/`:

```bash
npm ci
```

## Verification

From `$PACKAGE/`:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

Run focused regression tests for each bug before the full package suite.

## Commits

All bug details remain in `plan__bugs.md`; commit entries below carry only the stable bug reference and implementation intent.

### `fix-repo-identify-checkout` - `PLANNED`

**Bug.id:** `repo-identify-checkout`

**Commit Message:** `fix(workspace-cli): repo command does not find checkout by location`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/fix-repo-identify-checkout.md`

### `repo-state-report-under-its-repo-report` - `PLANNED`

**Bug.id:** `repo-state-report-under-its-repo-report`

**Commit Message:** `fix(workspace-cli): group package reports under repository reports`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/repo-state-report-under-its-repo-report.md`

### `repo-state-report-repeated-checkouts` - `PLANNED`

**Bug.id:** `repo-state-report-repeated-checkouts`

**Commit Message:** `fix(workspace-cli): avoid repeated repository reports for multiple checkouts`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/repo-state-report-repeated-checkouts.md`

### `fix-tests-and-update-plan` - `PLANNED`

**Commit Message:** `test(workspace-cli): improve repo command test coverage`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/fix-tests-and-update-plan.md`

**Scope:** Add focused regression coverage for all three bugs, profile repeated setup, and remove only demonstrably redundant tests.

### `update-knowledge` - `PLANNED`

**Commit Message:** `docs(workspace-cli): update repo command knowledge`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/update-knowledge.md`

**Scope:** Synchronize architecture, pseudo-code, and context knowledge with dynamic record discovery and checkout-keyed repository/package reports.

## Follow Ups

None.

## Milestone

Milestone 1 — Complete Workspace CLI (`$PACKAGE/_backlog/3-now/milestone-one/milestone.md`). This plan is Phase 14 and is now in the `3-now` execution queue.

## Feedback

No implementation feedback yet; all five commits are planned for Milestone 1 execution.
