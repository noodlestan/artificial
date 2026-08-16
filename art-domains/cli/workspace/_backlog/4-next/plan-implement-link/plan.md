# Plan: Workspace CLI — Link Command

**ID:** `implement-link`

**Status:** `DRAFT`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Implement `art-workspace link <location> <package> [<target>]` for `@art-domains/workspace-cli`: symlink a source package from a repo checkout into a target `node_modules` for local development, replacing the stub at `src/commands/link/runLink.ts`.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md) → Milestone 1 — `link` was listed under "Later".

## Mandatory Reading

- `_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `architecture/commands.md` → `## Link` — designed behaviour and BDD scenarios.
- `architecture/_pseudo.md` → `### Command: link` — pseudo-code contract.
- `architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, project records.
- `architecture/reports.md` — Operations Report.
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

### `implement-link-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement link command`

Implement `art-workspace link <location> <package> [<target>]` end-to-end, tests first.

**Use case:**

- `art-workspace link Artificial @artisans/art-mantras` → symlink at workspace root `node_modules/@artisans/art-mantras` pointing to the resolved package path in checkout "Artificial".
- `art-workspace link Artificial @artisans/art-mantras Purrception` → symlink at `repos/purrception/node_modules/@artisans/art-mantras`.

**Responsibilities:**

- Resolve source checkout by `<location>`; resolve package via existing `readProjectRecords` + `findPackage` (already implemented for the `repo` command).
- Resolve `packagePath` and `linkTarget` per the pseudo contract; `ensureDir` scoped `@scope` directories; remove existing symlink or npm-installed dir; create the symlink.
- Add `createLinkedSuccess` / `createLinkedFailure` operation factories in `src/private/operations/`; log outcomes; present Operations Report.
- Wire `<location> <package> [<target>]` args in `src/index.ts` (currently `link` takes no args).
- Write tests first — no `it.todo()` left at the end (lesson from `plan-implement-pull-push-sync`).

**Edge cases:**

- Unknown location → `linked` failure "unknown location {location}".
- Unknown package → `linked` failure "unknown package".
- Existing symlink or npm-installed directory at `linkTarget` → replace.
- Scoped name needs intermediate `@scope` directory → ensure it before creating the basename link.

**BDD:** `architecture/commands.md` → `## Link`.

**Pseudo:** `architecture/_pseudo.md` → `### Command: link`.

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
You are working on `art-domains/cli/workspace/_backlog/4-next/plan-implement-link/plan.md` (ID `implement-link`) — Milestone 1 slice of `art-domains/cli/workspace/_backlog/_architect.md`.

Goal: implement the `art-workspace link <location> <package> [<target>]` command for `@art-domains/workspace-cli`, replacing the stub at `src/commands/link/runLink.ts`.

Use the **write-plan** skill to refine this DRAFT into a READY plan:
1. Compose scope and context: workspace `ops-workspace` (managed by `@art-domains/workspace-cli`); repository `artificial` at `$WORKSPACE/repos/artificial/art-domains/cli/workspace`; package `@art-domains/workspace-cli`.
2. Validate guides have setup/verification (`_guide.md` does).
3. Group work into commit(s), write the plan file, and generate instruction file(s) in this plan directory.
4. Enforce the project lesson: tests implemented first, no `it.todo()` left.
5. When READY, update `_backlog/_architect.md` → Milestone 1 status for this slice.

Report back: refined plan file path, commit blueprints, and the delegation prompt to relay.
```

## Follow ups

- `link` is the base capability for `links` and `unlink` — shared helpers (package resolution, target resolution, symlink ops) should be reused.
