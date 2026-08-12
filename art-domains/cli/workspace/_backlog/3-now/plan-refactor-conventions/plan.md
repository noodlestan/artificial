# Plan: Refactor Conventions

**ID:** `refactor-conventions`

**Status:** `READY`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Enforce file naming conventions in `@art-domains/workspace-cli` source and tests: camelCase filenames matching the exported function name, one function per file, one function tested per file, test filename matching the tested file. The pre-plan scan also found latent test skips (`describe.only`, `it.only`) and stray comments; they are bundled into the respective commits. Pure refactor — zero behavior changes.

## Source Tasks

This plan derives from a direct user request (conventions enforcement), not from task files. No `task-{id}/task.md` attachments exist.

## Mandatory Reading

- `_backlog/_architect.md` — package briefing and approach
- `_backlog/3-now/plan-workspace-cli/plan.md` — the workspace CLI plan that produced the current codebase
- `package.json` — scripts: `lint`, `build`, `test`, `test:coverage`
- `src/index.ts`, `src/config/index.ts` — entry points wiring the renamed modules

## Commits

### `rename-source-files` - `COMMITTED`

**Commit Message:** `refactor(workspace-cli): rename source files to camelCase matching exported function names`

**Commit:** `ee2d6ed`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/rename-source-files.md`

**Report:** `_backlog/3-now/plan-refactor-conventions/instructions/rename-source-files__report.md`

**CHANGELOG:**

- Rename 51 kebab-case source files under `src/` to camelCase matching their single exported function
- Fix filename typo `load-repository-rercords.ts` → `loadRepositoryRecords.ts`
- Update all import statements across `src/`

### `split-test-files` - `COMMITTED`

**Commit Message:** `refactor(workspace-cli): rename and split test files, one function tested per file`

**Commit:** `65ad001`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/split-test-files.md`

**Report:** `_backlog/3-now/plan-refactor-conventions/instructions/split-test-files__report.md`

**CHANGELOG:**

- Split `git.test.ts` into 8 per-function test files; remove `describe.only` (was silencing 12 tests)
- Split `branch.test.ts` into `runBranch.test.ts`, `createBranchSuccess.test.ts`, `createBranchFailure.test.ts`; remove `it.only` (was silencing 6 tests)
- Split `checkout-record.test.ts` into `readCheckoutRecord.test.ts` and `saveCheckoutRecord.test.ts`
- Split `config.test.ts` into `defineConfig.test.ts` and `loadWorkspaceConfig.test.ts`
- Rename remaining test files to match the tested file

### `cleanup-comments` - `COMMITTED`

**Commit Message:** `chore(workspace-cli): remove commented-out code and stray comments`

**Commit:** `c4f819b`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/cleanup-comments.md`

**Report:** `_backlog/3-now/plan-refactor-conventions/instructions/cleanup-comments__report.md`

**CHANGELOG:**

- Remove commented-out code and `// expected conflict` in `runSanity.test.ts`
- Remove section-separator comments in `src/private/operations/types.ts`
- Keep explanatory comments and `eslint-disable` directives (still required by stub commands)

### `rename-remaining-files` - `PLANNED`

**Commit Message:** `refactor(workspace-cli): rename remaining kebab-case files to camelCase`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/rename-remaining-files.md`

**CHANGELOG:**

- Rename 9 files missed by `rename-source-files` (planner classification error): `define-config.ts`, `has-remote.ts`, `is-dirty.ts`, `format-table.ts`, `create-checkout.ts` + `create-checkout.test.ts`, `commit-file.ts`, `create-command-context.ts`, `make-config.ts`
- Update all import statements across `src/`

## Follow ups

- Stub commands `runLink`, `runPublish`, `runUnlink` remain TODO stubs; their `eslint-disable-next-line` directives stay until implementation lands.
- `architecture/commands.md` carries uncommitted WIP for the link/unlink/repo redesign (not part of this plan) — left untouched.

## Feedback

### rename-source-files (delegatee)

- Instructions were clear and complete; per-step lint validation caught import ordering issues early.
- The pre-existing `describe.only`/`it.only` continued to silence 18 tests — covered by `split-test-files`.

### split-test-files (delegatee)

- Fixed two pre-existing test bugs while splitting: `getRemoteBranch`/`getUnpushedCount` tests needed an initial commit before pushing; `createBranchSuccess` expectation corrected to `'<empty>'`.
- Coverage rose from 89.85% to 92.47% once silenced tests ran.

### cleanup-comments (delegatee)

- Comment-only deletions; `commitFile` import retained (still used by 8 call sites).
- Prettier fix for `split-test-files__report.md` folded into this commit (pre-commit hook requirement).

### Planner reflection

- `rename-source-files` misclassified 9 kebab-case files as conformant (hyphenated names are not camelCase). Corrected via `rename-remaining-files`.
- Verified independently: 26 test files, 82 tests pass (0 skipped), renames in place.
