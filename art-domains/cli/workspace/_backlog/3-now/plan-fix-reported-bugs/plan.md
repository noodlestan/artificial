# Plan: Workspace CLI — Fix Reported Bugs

**ID:** `fix-reported-bugs`

**Status:** `DRAFT`

**Template:** `.agents/domains/plans/templates/plan__template.md`

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

### `fix-sanity-extraneous-known-checkouts` - `READY`

**Bug:** `sanity` flags known checkouts as extraneous — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): skip known checkouts in extraneous scan`

**Responsibility:** In `src/commands/sanity/private/scanExtraneousCheckouts.ts`, accept the `CheckoutStore` (or a set of known locations) as a second parameter. Before adding a directory to the extraneous list, check `store.getCheckoutForLocation(location)` — skip directories that already have a store record. Update `runSanity.ts` to pass `ctx.store` to the call.

**Files:**

- `src/commands/sanity/private/scanExtraneousCheckouts.ts` — add store parameter, filter known locations
- `src/commands/sanity/runSanity.ts` — pass `ctx.store` to `scanExtraneousCheckouts`
- `src/commands/sanity/private/scanExtraneousCheckouts.test.ts` — add test: known checkout in store is not extraneous

**Tests:** Add a test that creates a config with a known checkout location in the store, creates a matching directory under `repos/`, and asserts `scanExtraneousCheckouts` returns an empty list.

**Edge cases:**

- Directory exists on disk but is not in the store → still flagged as extraneous (correct).
- Directory exists on disk and is in the store → not flagged (fix).
- Store has a record but directory does not exist → not scanned (correct — scan only reads directories).

### `fix-scan-checkout-state-wrong-branch-for-extraneous` - `READY`

**Bug:** Extraneous checkouts show "wrong branch" — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): skip wrong-branch check when expected branch is empty`

**Responsibility:** In `src/private/scan/scanCheckoutState.ts`, guard the "wrong branch" check (line 67) so it only fires when `checkout.record.branch` is non-empty. When the record branch is empty (extraneous or unrecorded checkout), there is no expected branch to compare against.

**Files:**

- `src/private/scan/scanCheckoutState.ts` — guard `isDifferentBranch` with `checkout.record.branch !== ''`
- `src/private/scan/scanCheckoutState.test.ts` — add test: checkout with empty record branch does not get "wrong branch"

**Tests:** Add a test that constructs a Checkout with `record.branch: ''` and `repo: undefined`, runs `scanCheckoutState`, and asserts issues contains `unknown project` but not `wrong branch`.

**Edge cases:**

- Record branch is `''`, actual branch is `main` → no `wrong branch` (fix).
- Record branch is `main`, actual branch is `develop` → still `wrong branch` (correct).
- Record branch is `main`, actual branch is `main` → no `wrong branch` (correct).

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

**Capture (long-running session):** append bugs captured from other sessions to `plan__bugs.md`, always in the **Bug Format** declared there.

**Refine:** when bugs accumulate, sugest refining this DRAFT into a READY plan (write-plan skill), one fix iteration per bug with its own instructions file.

## Follow ups

- Verify the `clone --all` path: `cloneAll.ts` still presents the Checkout Report without scanning — the fix landed only in `cloneSpecific.ts`.
- Add bugs analysed but rejected for this plan back to `_backlog/_parking-lot.md`.
