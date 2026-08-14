# Plan: Workspace CLI — Links Command

**ID:** `implement-links`

**Status:** `DRAFT`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Implement `art-workspace links` for `@art-domains/workspace-cli`: scan the workspace root `node_modules` and every known repo's project `node_modules` for symlinks (including scoped `@scope/pkg` entries) and present the Symlink Report. Read-only — no operations are logged. Not wired yet: no command entry, no `src/commands/links/` directory.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md) → Milestone 1 — `links` was listed under "Later".

## Mandatory Reading

- `_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `architecture/commands.md` → `## Links` — designed behaviour and BDD scenarios.
- `architecture/_pseudo.md` → `### Command: links` — pseudo-code contract (incl. `scanNodeModules`).
- `architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, project records.
- `architecture/reports.md` → Symlink Report.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan and instruction definitions.

## SETUP

Before starting work, execute the setup steps defined in `_guide.md`:

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Iterations

### `implement-links-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement links command`

Implement `art-workspace links` end-to-end, tests first.

**Use case:**

- `art-workspace links` → scan workspace root `node_modules` + each checkout's project `node_modules`; present the Symlink Report with `package` and `location` entries.

**Responsibilities:**

- Create `src/commands/links/` with `runLinks(ctx)` following the existing command skeleton (load config → create context → hydrate → execute → present).
- Implement `scanNodeModules(dir, location)` per the pseudo contract: handle scoped `@scope/pkg` entries recursively; report each symlink with its location label ("workspace root" for the root, checkout location otherwise).
- Add `presentSymlinkReport(links)` following the report presentation patterns in `src/private/present/`.
- Wire `links` in `src/index.ts` (new commander entry, no args).
- Write tests first — no `it.todo()` left at the end (lesson from `plan-implement-pull-push-sync`).

**Edge cases:**

- Known repo without project records → warn, skip.
- Invalid project record → warn, skip the project.
- `node_modules` directory missing → return no entries (not an error).
- Scoped packages: check the `@scope/pkg` subdirectory entries, never the scope directory itself.
- `links` is read-only: no operations logged, per `architecture/_pseudo.md` → Operation Logs.

**BDD:** `architecture/commands.md` → `## Links`.

**Pseudo:** `architecture/_pseudo.md` → `### Command: links`.

## Final Verification

After implementation, execute the verification steps defined in `_guide.md`:

Run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

All steps MUST pass. No `it.todo()` tests may remain.

## Architect Prompt

This DRAFT is a self-contained slice. Launch one architect per slice to refine it to `READY` (write-plan skill), generate the implementation instruction, and hand off for delegation.

**Self-contained prompt:**

```prompt
::boot
You are working on `art-domains/cli/workspace/_backlog/4-next/plan-implement-links/plan.md` (ID `implement-links`) — Milestone 1 slice of `art-domains/cli/workspace/_backlog/_architect.md`.

Goal: implement the `art-workspace links` command for `@art-domains/workspace-cli` — a read-only scan of symlinks (workspace root + every checkout's project `node_modules`) presenting the Symlink Report. Not wired yet: create `src/commands/links/` and add the commander entry.

Use the **write-plan** skill to refine this DRAFT into a READY plan:
1. Compose scope and context: workspace `ops-workspace` (managed by `@art-domains/workspace-cli`); repository `artificial` at `$WORKSPACE/repos/artificial/art-domains/cli/workspace`; package `@art-domains/workspace-cli`.
2. Validate guides have setup/verification (`_guide.md` does).
3. Group work into commit(s), write the plan file, and generate instruction file(s) in this plan directory.
4. Enforce the project lesson: tests implemented first, no `it.todo()` left.
5. When READY, update `_backlog/_architect.md` → Milestone 1 status for this slice.

Report back: refined plan file path, commit blueprints, and the delegation prompt to relay.
```

## Follow ups

- Symlink Report presentation is a new report shape; coordinate with the `link`/`unlink` slices so the report stays consistent.
