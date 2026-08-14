# Plan: Workspace CLI — Fix Reported Bugs

**ID:** `fix-reported-bugs`

**Status:** `DRAFT`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Fix bugs reported for `@art-domains/workspace-cli`. Source of work: bugs captured from user sessions (long-running architect session) and from the BUGS table in `_backlog/_parking-lot.md`. This is a long-running plan — new bugs are appended over time, always in the same format, and each bug becomes a fix iteration once captured.

## Bug Format

Every bug entry MUST follow this shape (see the example in `plan__bugs.md`):

1. **Scenario / Expected / Happened** — reproduce steps, expected behaviour, actual behaviour (with evidence when available).
2. **Description** — the short bug description in one sentence.

## Sources of work

- Plan attachment: `plan__bugs.md`
- `_backlog/_parking-lot.md` → BUGS table.

## Mandatory Reading

- `_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `architecture/commands.md` → `## Clone` — designed behaviour and BDD scenarios.
- `architecture/_pseudo.md` → `### Command: clone` and `### Function: scanAllCheckoutsStates`.
- `architecture/context-model.md` — `WorkspaceContext`, `CheckoutStore`, scanning.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan and instruction definitions.

## Setup

Before starting work, execute the setup steps defined in `_guide.md`:

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Iterations

### `fix-clone-scan-before-report` - `COMMITTED`

**Bug:** `clone` presents Checkout Report without scanning checkouts captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): scan checkouts before presenting clone report`

**Commit:** `b185ec1` — `fix(workspace-cli): in clone specifi use case, scan checkouts (only the cloned checkout is hydrated) before presenting checkout report`

**Feedback:**

- Fix landed in `src/commands/clone/cloneSpecific.ts` — the `clone <repo>` path only. `cloneStatus.ts` already scans; `cloneAll.ts` (`clone --all`) still presents the Checkout Report without scanning — see Follow ups.
- Commit message deviated from the blueprint (different wording, typo "specifi").
- No test added — no mocks exist for presenters (see `plan__bugs.md` Test field and parking lot PENDING "Injectable Presentation").

**Responsibility:** In `src/commands/clone/runClone.ts`, call `scanAllCheckoutsStates(ctx)` after hydration (and after cloning) so the Checkout Report reflects scanned git state — mirroring the `sanity` command flow. Applies to all three paths: `clone --all`, `clone <repo>`, and `clone` (status).

**Edge cases:**

- Uncloned (recorded but not on disk) checkout → not presented as a scanned checkout.
- Extraneous directory under the checkouts path → surfaced in the Extraneous Report, not as a scanned checkout.
- Scan failure → must not break the clone report; log/skip per existing scan behaviour.

**Tests:** tests first, reproducing the bug (recorded-but-uncloned checkout, clean cloned checkout) and asserting states are populated.

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

**Capture (long-running session):** append bugs captured from other sessions to `plan__bugs.md`, always in the **Bug Format** declared there (scenario/expected/happened + one-sentence description). Update the `_architect.md` → Milestone 1 bug list when the plan grows.

**Refine:** when bugs accumulate, refine this DRAFT into a READY plan (write-plan skill), one fix iteration per bug, generate implementation instructions, and hand off for delegation.

## Follow ups

- Verify the `clone --all` path: `cloneAll.ts` still presents the Checkout Report without scanning — the fix landed only in `cloneSpecific.ts`.
- Add bugs analysed but rejected for this plan back to `_backlog/_parking-lot.md`.
