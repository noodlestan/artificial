# Plan: Workspace CLI — Publish Command

**ID:** `implement-publish`

**Status:** `DRAFT`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Implement `art-workspace publish [--auto]` for `@art-domains/workspace-cli`: push repos and publish unpublished packages to npm, replacing the stub at `src/commands/publish/runPublish.ts`. Depends on the `push` capabilities from `plan-implement-pull-push-sync` (`shouldPushCheckout`, `pushCheckout`) and on the project-record reading already implemented for the `repo` command.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md) → Milestone 1 — `publish` was listed under "Later".
- ADR: `architecture/records/adr/publish.art` — publish-then-symlink pattern, npm registry, workspace-level symlinks.

## Mandatory Reading

- `_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `architecture/commands.md` → `## Publish` — designed behaviour and BDD scenarios.
- `architecture/_pseudo.md` → `### Command: publish` — pseudo-code contract.
- `architecture/records/adr/publish.art` — publish decisions.
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

### `implement-publish-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement publish command`

Implement `art-workspace publish [--auto]` end-to-end, tests first.

**Use case:**

- `art-workspace publish --auto` → for each checkout: push clean unpushed repos (reuse `shouldPushCheckout` / `pushCheckout` from the pull-push-sync work), read project records, check each package's npm published version, publish unpublished packages, present Checkout Report + Operations Report.

**Responsibilities:**

- Resolve packages per checkout via existing `readProjectRecords` (project → namespaces → packages); reuse `presentPackageStateReport` if it fits, otherwise read `package.json` directly per the pseudo contract.
- Implement `npmIsPublished(canonicalName, version)` (npm registry lookup) and the `npm publish --access public` step in the package dir; skip `private` packages.
- Add `createPublishSuccess` / `createPublishFailure` operation factories in `src/private/operations/`; log push and publish outcomes; present Operations Report.
- Wire `--auto` option in `src/index.ts` (already parsed; keep behaviour).
- Write tests first — no `it.todo()` left at the end (lesson from `plan-implement-pull-push-sync`).

**Edge cases:**

- Repo not cloned → skip with warning.
- No remote configured → skip push, log issue.
- Package already published → skip.
- `npm publish` fails → log `publish` failure, continue with other packages.
- OTP required → error if `--auto`.
- Registry unreachable / never published → treat as unpublished per the pseudo contract.

**BDD:** `architecture/commands.md` → `## Publish`.

**Pseudo:** `architecture/_pseudo.md` → `### Command: publish` and auxiliary `shouldPushCheckout` / `pushCheckout`.

**Dependency note:** this slice consumes `pushCheckout` and `shouldPushCheckout` landed in `plan-implement-pull-push-sync` (commit `ef8a2cf`). Reuse those functions — do not scaffold them.

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
You are working on `art-domains/cli/workspace/_backlog/4-next/plan-implement-publish/plan.md` (ID `implement-publish`) — Milestone 1 slice of `art-domains/cli/workspace/_backlog/_architect.md`.

Goal: implement the `art-workspace publish [--auto]` command for `@art-domains/workspace-cli`, replacing the stub at `src/commands/publish/runPublish.ts`. It pushes clean unpushed repos and publishes unpublished packages to npm.

Context: this slice depends on `shouldPushCheckout`/`pushCheckout` landed in `plan-implement-pull-push-sync` (commit `ef8a2cf`) and reuses `readProjectRecords` from the `repo` command.

Use the **write-plan** skill to refine this DRAFT into a READY plan:
1. Compose scope and context: workspace `ops-workspace` (managed by `@art-domains/workspace-cli`); repository `artificial` at `$WORKSPACE/repos/artificial/art-domains/cli/workspace`; package `@art-domains/workspace-cli`.
2. Validate guides have setup/verification (`_guide.md` does).
3. Group work into commit(s), write the plan file, and generate instruction file(s) in this plan directory.
4. Enforce the project lesson: tests implemented first, no `it.todo()` left.
5. When READY, update `_backlog/_architect.md` → Milestone 1 status for this slice.

Report back: refined plan file path, commit blueprints, and the delegation prompt to relay.
```

## Follow ups

- `publish` completes the publish-then-symlink loop with `link`/`unlink`; the Formalized Publishing Workflow follow-up in `_backlog/_architect.md` should be revisited once this lands.
