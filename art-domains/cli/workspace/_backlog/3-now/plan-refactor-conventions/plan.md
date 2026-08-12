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

### `rename-source-files` - `PLANNED`

**Commit Message:** `refactor(workspace-cli): rename source files to camelCase matching exported function names`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/rename-source-files.md`

**CHANGELOG:**

- Rename 45 kebab-case source files under `src/` to camelCase matching their single exported function
- Fix filename typo `load-repository-rercords.ts` → `loadRepositoryRecords.ts`
- Update all import statements across `src/`

### `split-test-files` - `PLANNED`

**Commit Message:** `refactor(workspace-cli): rename and split test files, one function tested per file`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/split-test-files.md`

**CHANGELOG:**

- Split `git.test.ts` into 8 per-function test files; remove `describe.only` (currently silences 12 tests)
- Split `branch.test.ts` into `runBranch.test.ts`, `createBranchSuccess.test.ts`, `createBranchFailure.test.ts`; remove `it.only` (currently silences 6 tests)
- Split `checkout-record.test.ts` into `readCheckoutRecord.test.ts` and `saveCheckoutRecord.test.ts`
- Split `config.test.ts` into `defineConfig.test.ts` and `loadWorkspaceConfig.test.ts`
- Rename remaining test files to match the tested file

### `cleanup-comments` - `PLANNED`

**Commit Message:** `chore(workspace-cli): remove commented-out code and stray comments`

**Instructions File:** `_backlog/3-now/plan-refactor-conventions/instructions/cleanup-comments.md`

**CHANGELOG:**

- Remove commented-out code and `// expected conflict` in `runSanity.test.ts`
- Remove section-separator comments in `src/private/operations/types.ts`
- Keep explanatory comments and `eslint-disable` directives (still required by stub commands)

## Follow ups

- Stub commands `runLink`, `runPublish`, `runUnlink` remain TODO stubs; their `eslint-disable-next-line` directives stay until implementation lands.
- After the `git.test.ts` split, verify all 8 git test files actually run (the `describe.only` currently silences 12 tests).
- After the `branch.test.ts` split, verify the full branch suite runs (the `it.only` currently silences 6 tests).

## Feedback

No delegations yet — no feedback collected.
