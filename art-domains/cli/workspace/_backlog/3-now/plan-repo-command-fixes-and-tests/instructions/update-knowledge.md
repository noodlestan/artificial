# Instructions: update repository command knowledge

**Plan:** `plan-repo-command-fixes-and-tests`

**Commit.id:** `update-knowledge`

**Commit.message:** `docs(workspace-cli): update repo command knowledge`

## Before you Start

::switch `agent-worker` — execute this instruction after the repository-command fixes and test-coverage work.

## Path Variables

| Variable     | Resolved Path                                  | Purpose                               |
| ------------ | ---------------------------------------------- | ------------------------------------- |
| `$WORKSPACE` | Current workspace root                         | Workspace-level verification context. |
| `$PROJECT`   | `$WORKSPACE/repos/artificial-discover-records` | Artificial repository root.           |
| `$PACKAGE`   | `$PROJECT/art-domains/cli/workspace`           | Workspace CLI package.                |

## Working Agreements

1. Keep documentation descriptive and aligned with implemented behavior.
2. Do not document speculative implementation details.
3. Do not commit or push without explicit approval.

## Goals

Synchronize repository-command architecture and pseudo-code with dynamic record discovery and checkout-keyed report presentation.

## Mandatory Reading

- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan.md`
- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`
- `$PACKAGE/architecture/commands.md`
- `$PACKAGE/architecture/_pseudo.md`
- `$PACKAGE/architecture/context-model.md`
- `$PACKAGE/_guide.md`

## Setup

From `$WORKSPACE/`:

```bash
npm ci
```

Run documentation checks from `$PACKAGE/`.

## Changes

1. Compare the final implementation with `architecture/commands.md`, `architecture/_pseudo.md`, and `architecture/context-model.md`.
2. Replace stale fixed-path record-discovery descriptions with the current recursive/co-located record loading model.
3. Document that each checkout has its own Repository State Report followed by its matching Package State Report.
4. Document that multiple checkout locations remain distinct.
5. Update the plan and bug attachment with exact knowledge files changed and any remaining documentation follow-ups.

## Verification

From `$PACKAGE/`:

```bash
npm run lint
```

Review the changed Markdown files for broken local links and stale `ops/records/{projects|namespaces|packages}` claims.

## Final Verification

Confirm the knowledge resources describe implemented behavior, contain no stale report-ordering or record-layout claims, and preserve the existing architecture terminology.

## How to Report Back

Render a report beside this instruction with changed knowledge files, stale claims corrected, link review, verification results, and remaining follow-ups.
