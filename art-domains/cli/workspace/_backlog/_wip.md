# WIP: Workspace CLI

## Current Issues

### BLOCKER: Repo command bugs

**Issue:** Repo command shows "unknown namespace" errors when running `npm run workspace repo`.

**Root Cause:**

1. Regex `/\*\*Namespaces:\*\*\s*(.+)/` only captures first line of multi-line namespace lists
2. Namespace names include `- Namespace: ` prefix but namespace record `name` field is just `Art JS`
3. Missing `kind` field on all record types

**Impact:** Repo command is broken and cannot list packages correctly.

**Plan:** `_backlog/3-now/implement-command-repo/plan.md` (iteration `fix-repo-record-parsing`)

**Instruction:** `_backlog/3-now/implement-command-repo/instructions/fix-repo-record-parsing.md`

### BLOCKER: 35 todo tests from repo command

**Issue:** Worker created test scaffolds with `it.todo()` but never implemented actual tests.

**Impact:** No test coverage for repo command core functions.

**Plan:** `_backlog/3-now/implement-command-repo/plan.md` (iteration `repo-test-coverage`)

**Instruction:** `_backlog/3-now/implement-command-repo/instructions/repo-test-coverage.md`

## Recent Committed Work

- `76cd4b4` — feat(workspace-cli): implement repo command (DONE but has bugs)
- `702c438` — docs(workspace-cli): update architecture and backlog to reflect current state

## Next Steps

1. Fix record parsing bugs (implement-command-repo, iteration `fix-repo-record-parsing`)
2. Implement 35 missing tests for repo command (implement-command-repo, iteration `repo-test-coverage`)
3. Implement pull/push/sync commands (implement-pull-push-sync)
