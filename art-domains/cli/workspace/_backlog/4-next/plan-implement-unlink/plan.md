# Plan: Workspace CLI — Unlink Command

**ID:** `implement-unlink`

**Status:** `DRAFT`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Implement `art-workspace unlink <location> <package> [<target>]` for `@art-domains/workspace-cli`: remove a package symlink created by `link` and restore the published version with `npm install`, replacing the stub at `src/commands/unlink/runUnlink.ts`. Params mirror `link`; default target is the workspace root `node_modules/`.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md) → Milestone 1 — `unlink` was listed under "Later".

## Mandatory Reading

- `_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `architecture/commands.md` → `## Unlink` — designed behaviour and BDD scenarios.
- `architecture/_pseudo.md` → `### Command: unlink` — pseudo-code contract.
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

### `implement-unlink-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement unlink command`

Implement `art-workspace unlink <location> <package> [<target>]` end-to-end, tests first.

**Use case:**

- `art-workspace unlink Artificial @artisans/art-mantras Purrception` → remove the symlink at `repos/purrception/node_modules/@artisans/art-mantras`, run `npm install` in "Purrception", log an `unlink` success.
- `art-workspace unlink Artificial @artisans/art-mantras` → same against the workspace root `node_modules/`.

**Responsibilities:**

- Resolve source checkout by `<location>`; resolve package via existing `readProjectRecords` + `findPackage` (reuse the `link` command resolution; coordinate with the `plan-implement-link` slice).
- Resolve `linkTarget` per pseudo; only remove when the entry is a symlink (npm-installed or absent → skip, no operation).
- Run `npm install` in the target dir after removing the symlink.
- Add `createUnlinkSuccess` / `createUnlinkFailure` operation factories in `src/private/operations/`; log outcomes; present Operations Report.
- Wire `<location> <package> [<target>]` args in `src/index.ts` (currently `unlink` takes no args).
- Write tests first — no `it.todo()` left at the end (lesson from `plan-implement-pull-push-sync`).

**Edge cases:**

- Unknown location → `unlink` failure "unknown location {location}".
- Unknown package → `unlink` failure "unknown package".
- Target entry is npm-installed (not a symlink) → skip, no operation logged.
- Symlink does not exist → skip, no operation logged.
- `npm install` fails → report error, continue.

**BDD:** `architecture/commands.md` → `## Unlink`.

**Pseudo:** `architecture/_pseudo.md` → `### Command: unlink`.

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
You are working on `art-domains/cli/workspace/_backlog/4-next/plan-implement-unlink/plan.md` (ID `implement-unlink`) — Milestone 1 slice of `art-domains/cli/workspace/_backlog/_architect.md`.

Goal: implement the `art-workspace unlink <location> <package> [<target>]` command for `@art-domains/workspace-cli`, replacing the stub at `src/commands/unlink/runUnlink.ts`. Reuse the package/target resolution shared with the `link` command; coordinate with `plan-implement-link` if both slices land together.

Use the **write-plan** skill to refine this DRAFT into a READY plan:
1. Compose scope and context: workspace `ops-workspace` (managed by `@art-domains/workspace-cli`); repository `artificial` at `$WORKSPACE/repos/artificial/art-domains/cli/workspace`; package `@art-domains/workspace-cli`.
2. Validate guides have setup/verification (`_guide.md` does).
3. Group work into commit(s), write the plan file, and generate instruction file(s) in this plan directory.
4. Enforce the project lesson: tests implemented first, no `it.todo()` left.
5. When READY, update `_backlog/_architect.md` → Milestone 1 status for this slice.

Report back: refined plan file path, commit blueprints, and the delegation prompt to relay.
```

## Follow ups

- Depends on the same package/target resolution helpers as `link` — avoid duplicating resolution logic across slices.
