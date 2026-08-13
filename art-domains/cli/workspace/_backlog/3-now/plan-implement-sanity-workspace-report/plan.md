# Plan: Workspace CLI — Sanity Workspace Report

**ID:** `implement-sanity-workspace-report`

**Status:** `READY`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Treat workspace as a first-class checkout in sanity command. Show "Workspace:" report before "Checkouts:". Store workspace in `ctx.workspace` (not `ctx.store`). Update context constructor and `createCommandContext.ts`. Unit test.

## Source Tasks

- Parking lot bug: "Workspace not first in Checkout Report"
- Parking lot pending feature: "Workspace as first-class checkout in sanity"

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `architecture/reports.md` — How state and operation logs are presented

## Iterations

### `implement-sanity-workspace-report` - `PLANNED`

**Commit Message:** `feat(workspace-cli): show workspace report before checkouts in sanity`

Treat workspace as a checkout for scanning purposes, but store in `ctx.workspace` (small API with function that returns record). Initialize on every command. Update `src/test/createCommandContext.ts`. Presentation: "Workspace:" followed by workspace row (repo, location, branch, states). Unit test.

**Use case:**

- `npm run workspace sanity` shows "Workspace:" section first, then "Checkouts:" section
- Workspace is scanned like a checkout but not stored in `ctx.store`
- `ctx.workspace` provides workspace record (repo, location, branch, states)

**Responsibilities:**

- Add `workspace` field to `WorkspaceContext` contract
- Initialize `ctx.workspace` in context constructor
- Update `createCommandContext.ts` test helper
- Scan workspace like a checkout (git status, branch, etc.)
- Present "Workspace:" report before "Checkouts:" report
- Unit test workspace scanning and presentation

**Edge cases:**

- Workspace not a git repo
- Workspace has uncommitted changes
- Workspace on detached HEAD

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → sanity command.

**BDD:** `architecture/commands.md` → Sanity section.

## Follow ups

- None.
