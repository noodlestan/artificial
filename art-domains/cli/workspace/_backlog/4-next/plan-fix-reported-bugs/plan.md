# Plan: Workspace CLI — Fix Reported Bugs

**ID:** `fix-reported-bugs`

**Status:** `DRAFT`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Fix bugs reported for `@art-domains/workspace-cli`. Source of work: bugs captured from user sessions (long-running architect session) and from the BUGS table in `_backlog/_parking-lot.md`. This is a long-running plan — new bugs are appended over time, always in the same format, and each bug becomes a fix iteration once captured.

## Bug Format

Every bug entry MUST follow this shape (the first bug below is the example):

1. **Scenario / Expected / Happened** — reproduce steps, expected behaviour, actual behaviour (with evidence when available).
2. **Description** — the short bug description in one sentence.

## Source Tasks

- `_backlog/_parking-lot.md` → BUGS table.
- Architect sessions capturing bugs from other sessions (long-running).
- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md) → Milestone 1.

All Consolidated in the below "## Bugs Section".

## Mandatory Reading

- `_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `architecture/commands.md` → `## Clone` — designed behaviour and BDD scenarios.
- `architecture/_pseudo.md` → `### Command: clone` and `### Function: scanAllCheckoutsStates`.
- `architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, scanning.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan and instruction definitions.

## Bugs

### Bug: `clone` presents Checkout Report without scanning checkouts

**Scenario:** On a workspace with recorded checkouts, run `npm run workspace clone artificial` (fresh workspace; checkouts recorded, not yet scanned).

**Expected:** After cloning, the Checkout Report reflects the scanned git state of checkouts on disk — states populated for cloned checkouts, uncloned checkouts not presented as scanned.

**Happened:** The Checkout Report listed all 9 recorded checkouts (Artificial, Conventions, No Comply, Projects, Purrception, Purrpose, Purrtrait, Terraform, Workspace Tooling) with blank `states` (`-`) — the report was presented straight from the store without any git scan.

**Description:** `clone` presents the Checkout Report straight from the store without scanning checkouts, listing every recorded checkout with blank states instead of their actual git state.

## Setup

Before starting work, execute the setup steps defined in `_guide.md`:

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Iterations

### `fix-clone-scan-before-report` - `DRAFT`

**Commit Message:** `fix(workspace-cli): scan checkouts before presenting clone report`

**Responsibility:** In `src/commands/clone/runClone.ts`, call `scanAllCheckoutsStates(ctx)` after hydration (and after cloning) so the Checkout Report reflects scanned git state — mirroring the `sanity` command flow. Applies to all three paths: `clone --all`, `clone <repo>`, and `clone` (status).

**Edge cases:**

- Uncloned (recorded but not on disk) checkout → not presented as a scanned checkout.
- Extraneous directory under the checkouts path → surfaced in the Extraneous Report, not as a scanned checkout.
- Scan failure → must not break the clone report; log/skip per existing scan behaviour.

**Tests:** tests first, reproducing the bug (recorded-but-uncloned checkout, clean cloned checkout) and asserting states are populated; no `it.todo()` left at the end (lesson from `plan-implement-pull-push-sync`).

**Pseudo:** `architecture/_pseudo.md` → `### Function: scanAllCheckoutsStates`.

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

This DRAFT is a long-running bug-capture and fix plan. Two roles:

**Capture (long-running session):** append bugs captured from other sessions under `## Bugs`, always in the **Bug Format** above (scenario/expected/happened + one-sentence description). Update the `_architect.md` → Milestone 1 bug list when the plan grows.

**Refine:** when bugs accumulate, refine this DRAFT into a READY plan (write-plan skill), one fix iteration per bug, generate implementation instructions, and hand off for delegation.

## Follow ups

- Add bugs analysed but rejected for this plan back to `_backlog/_parking-lot.md`.
