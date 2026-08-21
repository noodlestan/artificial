# Milestone: Complete Workspace CLI

**ID:** `complete-workspace-cli`

**Status:** `ACTIVE`

## Summary

Complete the workspace CLI with remaining commands and infrastructure. This milestone delivers the full command surface (pull, push, sync, link, links, unlink, publish) and critical infrastructure (repository-command bug fixes, regression test coverage, dynamic record discovery, and knowledge/code quality improvements).

## Source

`_backlog/_architect.md` — Architect Briefing: Workspace CLI (Milestone 1)

## Phase Plans

| Phase                                 | Plan                                                                           | Status      |
| ------------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| 0 — Workspace split                   | `_backlog/0-archive/2026-08-10-plan-workspace-split/plan.md`                   | `ARCHIVED`  |
| 1 — Workspace sanity clone branch     | `_backlog/0-archive/2026-08-12-plan-workspace-sanity-clone-branch/plan.md`     | `ARCHIVED`  |
| 2 — Refactor conventions              | `_backlog/0-archive/2026-08-13-plan-refactor-conventions/plan.md`              | `ARCHIVED`  |
| 3 — Implement command repo            | `_backlog/0-archive/2026-08-14-plan-implement-command-repo/plan.md`            | `ARCHIVED`  |
| 4 — Implement sanity workspace report | `_backlog/0-archive/2026-08-14-plan-implement-sanity-workspace-report/plan.md` | `ARCHIVED`  |
| 5 — Fix repo command issues           | `_backlog/0-archive/2026-08-18-plan-fix-repo-command-issues/plan.md`           | `ARCHIVED`  |
| 6 — Implement pull/push/sync          | `_backlog/0-archive/2026-08-18-plan-implement-pull-push-sync/plan.md`          | `ARCHIVED`  |
| 7 — Cleaner code                      | `_backlog/0-archive/2026-08-18-plan-cleaner-code/plan.md`                      | `ARCHIVED`  |
| 8 — Discover records dynamically      | `_backlog/1-done/plan-discover-records/plan.md`                                | `DONE`      |
| 9 — Fix reported bugs                 | `_backlog/0-archive/2026-08-19-plan-fix-reported-bugs/plan.md`                 | `ARCHIVED`  |
| 10 — Implement link                   | `_backlog/4-next/plan-implement-link/plan.md`                                  | `DRAFT`     |
| 11 — Implement links                  | `_backlog/4-next/plan-implement-links/plan.md`                                 | `DRAFT`     |
| 12 — Implement publish                | `_backlog/4-next/plan-implement-publish/plan.md`                               | `DRAFT`     |
| 13 — Implement unlink                 | `_backlog/4-next/plan-implement-unlink/plan.md`                                | `DRAFT`     |
| 14 — Fixes and test coverage          | `_backlog/1-done/plan-repo-command-fixes-and-tests/plan.md`                    | `DONE`      |
| 15 — Update knowledge resources       | `_backlog/4-next/update-knowledge-resources/plan.md`                           | `PREPARING` |

**Next step:** Phase 10 — execute `plan-implement-link`.

## Follow-ups

- `plan-fix-reported-bugs` — bug fixes sourced from reported bugs (first bug: `clone` presents Checkout Report without scanning checkouts). See `_backlog/4-next/plan-fix-reported-bugs/plan.md`.
- `plan-implement-publish` — depends on `pull`/`push` from `plan-implement-pull-push-sync`. See `_backlog/4-next/plan-implement-publish/plan.md`.
- Each DRAFT plan embeds a self-contained **Architect Prompt** — copy it to launch one architect per slice.
