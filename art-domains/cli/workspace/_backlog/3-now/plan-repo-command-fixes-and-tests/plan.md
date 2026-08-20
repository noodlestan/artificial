# Plan: Workspace CLI — Fixes and Test Coverage

**ID:** `plan-repo-command-fixes-and-tests`

**Status:** `DONE`

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

### `fix-repo-identify-checkout` - `COMMITTED`

**Commit:** `9c6c6c5`

**Report:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/fix-repo-identify-checkout.report.md`

**Bug.id:** `repo-identify-checkout`

**Commit Message:** `fix(workspace-cli): repo command does not find checkout by location`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/fix-repo-identify-checkout.md`

### `repo-state-report-under-its-repo-report` - `COMMITTED`

**Commit:** `9c6c6c5`

**Report:** Incorporated into `fix-repo-identify-checkout` and `repo-state-report-repeated-checkouts` reports.

**Note:** Fix was applied by the repeated-checkouts worker (merged presentation loops). No standalone report rendered.

**Bug.id:** `repo-state-report-under-its-repo-report`

**Commit Message:** `fix(workspace-cli): group package reports under repository reports`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/repo-state-report-under-its-repo-report.md`

### `repo-state-report-repeated-checkouts` - `COMMITTED`

**Commit:** `9c6c6c5`

**Report:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/repo-state-report-repeated-checkouts.report.md`

**Bug.id:** `repo-state-report-repeated-checkouts`

**Commit Message:** `fix(workspace-cli): avoid repeated repository reports for multiple checkouts`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/repo-state-report-repeated-checkouts.md`

### `fix-tests-and-update-plan` - `COMMITTED`

**Bug.id:** `repo-identify-checkout`, `repo-state-report-under-its-repo-report`, `repo-state-report-repeated-checkouts`

**Commit Message:** `test(workspace-cli): improve repo command test coverage`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/fix-tests-and-update-plan.md`

**Scope:** Add focused regression coverage for all three bugs, profile repeated setup, and remove only demonstrably redundant tests.

### `repo-state-report-under-its-repo-report`

**Root cause:** `repositoryStates` presented in one loop, then separate loop over `targets` for package reports, breaking association.

**Fix:** Incorporated into `repo-state-report-repeated-checkouts` — single presentation loop now shows each repo report followed immediately by its package report.

**Tests:** Covered by `groups each repository report with its package report` regression test (added in `fix-tests-and-update-plan`).

### `update-knowledge` - `COMMITTED`

**Commit:** `4eb0ce4`

**Report:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/update-knowledge__report.md`

**Commit Message:** `docs(workspace-cli): update repo command knowledge`

**Instructions File:** `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/instructions/update-knowledge.md`

**Scope:** Synchronize architecture, pseudo-code, and context knowledge with dynamic record discovery and checkout-keyed repository/package reports.

## Follow Ups

None.

## Milestone

Milestone 1 — Complete Workspace CLI (`$PACKAGE/_backlog/3-now/milestone-one/milestone.md`). This plan is Phase 14 and is now in the `3-now` execution queue.

## Feedback

### `fix-tests-and-update-plan`

**Test baseline:** 10 tests, 4.25s → **11 tests, 5.12s** (focused suite). Full suite: 228/228 passed.

**Coverage decisions:**

| Test                                                        | Decision                | Evidence                                                                                              |
| ----------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `lists a single checkout's packages`                        | Retained + consolidated | Refactored to shared `setupCheckoutWithPackages` helper; same assertions                              |
| `keeps two checkouts of one repository distinct`            | Retained as-is          | Unique setup (two same-repo checkouts); tests distinct package versions                               |
| `defaults to all checkouts when none specified`             | Retained as-is          | Unique setup (two different repos); tests default behavior                                            |
| `checkout has no project records`                           | Retained as-is          | Unique setup (no project records)                                                                     |
| `resolves checkout by location when name does not match`    | Retained                | Direct regression for `repo-identify-checkout`                                                        |
| `unknown checkout warns and skips`                          | Retained as-is          | Tests negative path (no records)                                                                      |
| `project references a missing namespace`                    | Retained as-is          | Unique setup (no packages)                                                                            |
| `namespace references a missing package`                    | Retained as-is          | Unique setup (no packages)                                                                            |
| `package path has no package.json`                          | Retained as-is          | Unique setup (no package.json file); cannot use shared helper                                         |
| `npm info fails`                                            | Retained + consolidated | Refactored to shared `setupCheckoutWithPackages` helper                                               |
| **`groups each repository report with its package report`** | **Added**               | **New focused regression for `repo-state-report-under-its-repo-report`; asserts contiguous ordering** |

**Consolidation:**

- Extracted `setupCheckoutWithPackages` helper for the single-checkout-with-packages pattern (used by 2 tests).
- Two tests remain with full inline setup because their setup differs meaningfully (no package.json, no packages at all).
- No tests removed — all existing tests cover unique behavior paths.

### `fix-repo-identify-checkout`

**Root cause:** `runRepo` only called `getCheckoutByName(name)`, never `getCheckoutForLocation(location)`.

**Fix:** Added `?? ctx.store.getCheckoutForLocation(name)` fallback after `getCheckoutByName`.

**Precedence:** Name lookup first (case-insensitive), then location (exact match), then `unknown checkout` warning.

**Tests:** 9/9 focused, 226/227 full suite (1 pre-existing unrelated failure).

### `repo-state-report-repeated-checkouts`

**Root cause:** Package states keyed by `checkout.record.name` caused collisions when multiple checkouts of one repo existed. Presentation split into two separate loops broke association.

**Fix:** Keyed by `checkout.record.location`; replaced flat arrays with Maps; merged into single presentation loop. Extracted helpers: `getRepositoryCheckoutPackages`, `createPackageStateRecord`, `scanPackageStateRecord`.

**Tests:** 10/10 focused, 227/227 full suite.

### `repo-state-report-under-its-repo-report`

**Root cause:** `repositoryStates` presented in one loop, then separate loop over `targets` for package reports, breaking association.

**Fix:** Incorporated into `repo-state-report-repeated-checkouts` — single presentation loop now shows each repo report followed immediately by its package report.

**Tests:** Covered by `groups each repository report with its package report` regression test (added in `fix-tests-and-update-plan`).

### `update-knowledge`

**Files updated:**

- `architecture/commands.md` — recursive record discovery, multiple-checkout scenario
- `architecture/_pseudo.md` — Map-based grouped reporting, new auxiliary functions
- `architecture/reports.md` — Repository State Report section, corrected Package State Report ordering

**Verification:** Lint clean, no broken local links.
