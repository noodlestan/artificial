# Plan: Update Knowledge Resources

**ID:** `update-knowledge-resources`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Update the workspace CLI architecture knowledge resources to reflect implemented commands (pull, push, sync), planned configuration changes (dynamic record discovery, top-level checkouts), and updated function signatures (data-first `saveCheckoutRecord`). The architecture docs currently describe an earlier state of the codebase; this plan brings them current with the actual `src/` structure, completed plans, and planned changes.

## Source Tasks

- Milestone: `_backlog/3-now/milestone-one/milestone.md` — defines this plan as part of the Complete Workspace CLI milestone.
- Architect briefing: `_backlog/_architect.md` — establishes records as the source of truth and the imperative command model.

## Files to Update

### 1. `architecture/index.md`

**Current state:** References a stale plan (`_backlog/3-now/plan-workspace-cli/plan.md`). Lists `pull`, `push`, `sync`, `link`, `unlink`, `publish` as commands without distinguishing implemented from planned.

**Update strategy:**

- Replace the stale plan reference with the current milestone reference (`_backlog/3-now/milestone-one/milestone.md`).
- Update the "CLI Execution Model" section to reflect that `pull`, `push`, and `sync` are now implemented alongside `clone`, `branch`, `repo`, and `sanity`.
- Clarify that `link`, `unlink`, and `publish` remain designed/draft.
- Review the "Data Model" section against `context-model.md` updates — ensure consistency on `CheckoutStore` semantics and record-mutation pattern.

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/src/commands/` — directory listing shows `pull/`, `push/`, `sync/` alongside `clone/`, `branch/`, `repo/`, `sanity/`.
- `$PROJECT/art-domains/cli/workspace/src/index.ts` — registered command list.

### 2. `architecture/config.md`

**Current state:** The `WorkspaceConfig` interface shows `records.repositories.path` and `records.checkouts.{path,template}`. The authoring example uses this old shape. Does not reflect the planned restructuring from `plan-discover-records`.

**Update strategy:**

- Update the `WorkspaceConfig` interface to show the planned shape: top-level `checkouts.path` and `checkouts.template`, and `records.pattern` (defaulting to `*.art`). Keep the current shape documented as "current" until the plan lands, or document both as "current" and "planned".
- Update the authoring example to match the new config shape.
- Add a note that `records.checkouts` is being restructured to top-level `checkouts` — reference `plan-discover-records` for the transition.
- Verify the "Source of Truth" section still accurately describes the records-first philosophy.

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/_backlog/4-next/plan-discover-records/plan.md` — "Decisions and Assumptions" section defines the new config shape.
- `$PROJECT/art-domains/cli/workspace/src/config/` — actual `WorkspaceConfig` type and `defineConfig` to verify current vs planned state.

### 3. `architecture/context-model.md`

**Current state:** The reader organization shows a flat structure without `shared/` or `checkout/private/` subdirectories. `loadProjectGraph` signature is `(checkoutPath)` without `config`. `saveCheckoutRecord` uses the old `(config, name, record)` signature. No mention of `filename` on checkout records or `findRecordFiles`.

**Update strategy:**

- Update the "Reader Organization" directory tree to match the actual `src/private/records/` structure, including `shared/findRecordFiles.ts` and `checkout/private/` if they exist.
- Update `saveCheckoutRecord` signature to data-first: `saveCheckoutRecord(config, data, filename?)`. Document that loaded records call `saveCheckoutRecord(config, record.record, record.filename)` and new records call `saveCheckoutRecord(config, data)`.
- Add `filename` field to `RepositoryCheckoutRecord` (or note it is planned via `plan-discover-records`).
- Update `loadProjectGraph` to show it will accept `(config, checkoutPath)` once dynamic discovery lands.
- Update `loadCheckoutRecords` to show it pairs records with repository records.
- Review `hydrateStoreFromRecords` against the actual implementation.
- Ensure the `Checkout` interface matches `src/private/store/createCheckout.ts` — verify `isBehind` is documented.

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/src/private/records/` — actual directory structure.
- `$PROJECT/art-domains/cli/workspace/src/private/records/checkout/saveCheckoutRecord.ts` — current signature.
- `$PROJECT/art-domains/cli/workspace/src/private/store/createCheckout.ts` — `Checkout` interface.
- `$PROJECT/art-domains/cli/workspace/_backlog/4-next/plan-discover-records/plan.md` — planned changes to records layer.

### 4. `architecture/commands.md`

**Current state:** Command surface table lists `pull`, `push`, `sync` as `planned`. The `repo` command status is `implemented` but the bottom "Implementation Status" section is stale. BDD scenarios for `pull`, `push`, `sync` are already present and accurate.

**Update strategy:**

- Update the command surface table: `pull`, `push`, `sync` → `implemented`.
- Update the "Implementation Status" section at the bottom to reflect all implemented commands: `clone`, `sanity`, `branch`, `repo`, `pull`, `push`, `sync`.
- Note that `link`, `unlink`, `publish` remain `designed` (stubbed entry points).
- Verify BDD scenarios for `pull`, `push`, `sync` against actual test files — they should already match since they were the source of truth during implementation.
- Add any edge cases discovered during implementation feedback (e.g., `git fetch` needed for behind detection in tests, `simple-git` blocks `git config` writes).

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/src/commands/` — directory listing for implemented commands.
- `$PROJECT/art-domains/cli/workspace/_backlog/1-done/plan-implement-pull-push-sync/plan.md` — Feedback section documents implementation learnings.

### 5. `architecture/operations-log.md`

**Current state:** Lists operation kinds as `clone`, `push`, `publish`, `branch created`, `linked`, `unlink`. Missing `pull`.

**Update strategy:**

- Add `pull` to the operation kinds list.
- Verify the `Operation` kind field matches what `src/private/operations/` actually exports (e.g., `createPullSuccess`, `createPullFailure`).
- Confirm no other new operation kinds were introduced during `pull`/`push`/`sync` implementation.

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/src/private/operations/` — actual operation factory files.

### 6. `architecture/_pseudo.md`

**Current state:** `saveCheckoutRecord` uses old signature `(config, name, record)`. `loadCheckoutRecords` takes `(config, repos)`. `loadRepositoryRecords` takes `(config)`. Missing `resolveCheckoutByName` (was added during `fix-repo-command-issues`). Missing `pull` command pseudo-code. `pull`, `push`, `sync` pseudo-code references functions that may have shifted.

**Update strategy:**

- Add `resolveCheckoutByName(store, input)` function (already landed in `fix-repo-command-issues`).
- Update `saveCheckoutRecord` to data-first signature: `saveCheckoutRecord(config, data, filename?)`.
- Update `loadCheckoutRecords` to show it pairs records with repository records.
- Add the `pull` command pseudo-code if not already present (verify — it may already be there from the `pull-push-sync` plan).
- Review `pull`, `push`, `sync` pseudo-code against the actual implementations in `src/commands/pull/`, `src/commands/push/`, `src/commands/sync/` — ensure function names and flow match.
- Update operation kind factories list to include `createPullSuccess`, `createPullFailure`.
- Note any auxiliary functions added during implementation (e.g., `isCleanCheckout`, `pullCheckout`).

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/src/commands/pull/runPull.ts` — actual pull implementation.
- `$PROJECT/art-domains/cli/workspace/src/commands/push/runPush.ts` — actual push implementation.
- `$PROJECT/art-domains/cli/workspace/src/commands/sync/runSync.ts` — actual sync implementation.
- `$PROJECT/art-domains/cli/workspace/src/private/git/pullCheckout.ts` — pull checkout helper.
- `$PROJECT/art-domains/cli/workspace/src/private/scan/isCleanCheckout.ts` — clean checkout check.

### 7. `architecture/reports.md`

**Current state:** Reports documentation appears accurate based on the implemented commands.

**Update strategy:**

- Verify that the Workspace Report, Checkout Report, Operations Report, Extraneous Report, Package State Report, and Symlink Report match actual presentation code in `src/private/present/`.
- Check if any report columns or formatting changed during implementation.
- This file may need no changes — verify and confirm.

**Evidence to consult:**

- `$PROJECT/art-domains/cli/workspace/src/private/present/` — actual presentation functions.

### 8. `architecture/records/adr/` (if ADRs exist)

**Current state:** Referenced in `config.md` and `_pseudo.md` but not inspected.

**Update strategy:**

- List files in `architecture/records/adr/`.
- For each ADR, verify its status (proposed, accepted, superseded) reflects actual implementation decisions.
- Update any ADR that references old function signatures or config shapes.

## Commits

Draft — commit strategy and implementation instructions to be defined during planning.

## Follow-ups

- After this plan lands, the architecture docs will reflect the current state. Future plans (`plan-discover-records`, `plan-implement-link`, etc.) should update the docs as part of their own commits rather than creating separate knowledge-update plans.
- Consider adding a "last verified" timestamp or commit hash to each architecture file so staleness is easier to detect.

## Feedback

No implementation feedback yet.
