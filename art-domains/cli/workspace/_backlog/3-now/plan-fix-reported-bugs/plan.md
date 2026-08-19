# Plan: Workspace CLI — Fix Reported Bugs

**ID:** `fix-reported-bugs`

**Status:** `READY`

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

### `fix-sanity-extraneous-known-checkouts` - `COMMITTED`

**Bug:** `sanity` flags known checkouts as extraneous — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): skip known checkouts in extraneous scan`

**Commit:** `8556c7a` — `fix(workspace-cli): skip known checkouts in extraneous scan`

**Feedback:**

- Worker executed all 3 steps: added store parameter to `scanExtraneousCheckouts`, updated `runSanity` call, added test.

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-sanity-extraneous-known-checkouts.md`

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

### `fix-scan-checkout-state-wrong-branch-for-extraneous` - `COMMITTED`

**Bug:** Extraneous checkouts show "wrong branch" — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): skip wrong-branch check when expected branch is empty`

**Commit:** `6750885` — `fix(workspace-cli): skip wrong-branch check when expected branch is empty`

**Feedback:**

- Worker executed successfully. All tests passed.

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-scan-checkout-state-wrong-branch-for-extraneous.md`

**Responsibility:** In `src/private/scan/scanCheckoutState.ts`, guard the "wrong branch" check (line 67) so it only fires when `checkout.record.branch` is non-empty. When the record branch is empty (extraneous or unrecorded checkout), there is no expected branch to compare against.

**Files:**

- `src/private/scan/scanCheckoutState.ts` — guard `isDifferentBranch` with `checkout.record.branch !== ''`
- `src/private/scan/scanCheckoutState.test.ts` — add test: checkout with empty record branch does not get "wrong branch"

**Tests:** Add a test that constructs a Checkout with `record.branch: ''` and `repo: undefined`, runs `scanCheckoutState`, and asserts issues contains `unknown project` but not `wrong branch`.

**Edge cases:**

- Record branch is `''`, actual branch is `main` → no `wrong branch` (fix).
- Record branch is `main`, actual branch is `develop` → still `wrong branch` (correct).
- Record branch is `main`, actual branch is `main` → no `wrong branch` (correct).

### `fix-clone-wrong-remote` - `COMMITTED`

**Bug:** Checkout report fails to detect wrong remote — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): detect wrong remote in checkout scan`

**Commit:** `6d665a6` — `fix(workspace-cli): detect wrong remote in checkout scan`

**Feedback:**

- Worker executed successfully. Added `getRemoteUrl` helper, `wrong remote` state type, and 2 tests.

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-clone-wrong-remote.md`

**Responsibility:** In `src/private/scan/scanCheckoutState.ts`, after reading git state, compare the checkout's actual remote URL against the record's repository remote. When they differ, add a `wrong remote` issue to the checkout's issues list.

**Files:**

- `src/private/scan/scanCheckoutState.ts` — add remote comparison against record
- `src/private/scan/scanCheckoutState.test.ts` — add test: checkout with mismatched remote shows "wrong remote"

**Tests:** Add a test that constructs a Checkout with a repository record pointing to one remote, while the actual git remote differs, and asserts `wrong remote` appears in issues.

**Edge cases:**

- Checkout remote matches record → no `wrong remote` issue.
- Checkout remote differs from record → `wrong remote` issue surfaced.
- Checkout has no remote → `no remote` issue surfaced (existing behaviour).

### `fix-clone-ignores-record-branch` - `COMMITTED`

**Bug:** `cloneIfMissing` ignores the record branch — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): use recorded branch when cloning missing checkout`

**Commit:** `e74693e` — `fix(workspace-cli): use recorded branch when cloning missing checkout`

**Feedback:**

- Worker executed successfully. Added branch checkout after clone and updated record with actual branch.

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-clone-ignores-record-branch.md`

**Responsibility:** In `src/commands/clone/private/cloneIfMissing.ts`, after cloning, check out the branch from `checkout.record.branch` instead of relying on the default branch. After the checkout, update the record with the actual branch on disk (preserving the record's branch when it matches, or reflecting the actual branch when it differs).

**Files:**

- `src/commands/clone/private/cloneIfMissing.ts` — checkout recorded branch after clone
- `src/commands/clone/private/cloneIfMissing.test.ts` — add test: clone respects record branch

**Tests:** Add a test that clones a missing checkout where the record has a non-main branch, and asserts the cloned checkout lands on the recorded branch.

**Edge cases:**

- Record branch exists on remote → clone checks out that branch.
- Record branch does not exist on remote → clone lands on default branch, record updated.
- Record branch is `main` → existing behaviour preserved.

### `fix-clone-refuses-second-checkout` - `COMMITTED`

**Bug:** Clone refuses second checkout of same repo — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): allow second checkout of same repo at different location`

**Commit:** `754a08f` — `fix(workspace-cli): allow second checkout of same repo at different location`

**Feedback:**

- Guard removal already done; only test coverage was added. 197/197 tests pass.

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-clone-refuses-second-checkout.md`

**Responsibility:** In `src/commands/clone/cloneSpecific.ts`, when a checkout for the same repo already exists at a different location, allow the clone to proceed instead of refusing. Remove the guard that blocks clone when `ctx.store.getCheckoutOfRepo(repo.name)` returns an existing checkout at a different location. Keep the guard that blocks clone when the target location is already used by a different repo.

**Files:**

- `src/commands/clone/cloneSpecific.ts` — remove the "already exists at different location" guard
- `src/commands/clone/cloneSpecific.test.ts` — add test: clone to new location when checkout exists elsewhere

**Tests:** Add a test where repo X already has a checkout at `repos/x`, then clone X to location `foo`, and assert the new checkout is created at `repos/foo` with name `X @ foo`.

**Edge cases:**

- Repo has checkout at location A, clone to location B → creates `X @ B` at `repos/B`.
- Repo has checkout at location A, clone to location A → idempotent (no-op, existing behaviour).
- Target location used by different repo → still refused (existing behaviour).

### `fix-clone-should-refuse-extraneous-dir` - `COMMITTED`

**Bug:** Clone should refuse if target dir is extraneous — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): refuse clone when target directory already exists`

**Commit:** `7e69306` — `fix(workspace-cli): refuse clone when target directory already exists`

**Feedback:**

- Worker executed successfully. Added directory existence check before checkout creation.

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-clone-should-refuse-extraneous-dir.md`

**Responsibility:** In `src/commands/clone/cloneSpecific.ts`, before creating a new checkout, check if the target directory already exists on disk. If it does, log a clone failure and refuse the operation. This prevents clone from overwriting an existing directory that may contain untracked work.

**Files:**

- `src/commands/clone/cloneSpecific.ts` — add directory existence check before checkout creation
- `src/commands/clone/cloneSpecific.test.ts` — add test: clone refuses when target dir exists

**Tests:** Add a test where a target directory exists (as an extraneous directory or manual clone), then clone a repo to that location, and assert a clone failure is logged with a message about the directory already existing.

**Edge cases:**

- Target dir exists and is extraneous → refuse clone, log failure.
- Target dir exists and is a valid checkout for same repo → idempotent (no-op, existing behaviour).
- Target dir does not exist → proceed with clone (existing behaviour).

### `fix-clone-custom-location-wrong-name` - `READY`

**Bug:** Clone custom location produces wrong name/path — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): use correct name and path for custom location clone`

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-clone-custom-location-wrong-name.md`

**Responsibility:** In `src/commands/clone/cloneSpecific.ts`, when cloning with a custom location, ensure the checkout name is `{repo} @ {location}` and the directory resolves to `repos/{location}` (via `safePath`). The current code uses the repo name as the checkout name and places the directory at the repo root instead of under the checkouts path.

**Files:**

- `src/commands/clone/cloneSpecific.ts` — fix checkout name and path computation for custom locations
- `src/commands/clone/cloneSpecific.test.ts` — add test: custom location produces correct name and path

**Tests:** Add a test that clones repo `Foo` to location `bar`, and asserts the checkout name is `Foo @ bar` and the directory is `repos/bar`.

**Edge cases:**

- Default location (no second arg) → name is repo name, path is `repos/{repo}` (existing behaviour).
- Custom location → name is `{repo} @ {location}`, path is `repos/{location}`.
- Location with spaces → `safePath` normalises correctly.

### `fix-clone-refuses-extraneous-no-failure-logged` - `READY`

**Bug:** Clone refuses extraneous dir but no failure logged — captured in `plan__bugs.md`.

**Commit Message:** `fix(workspace-cli): log failure when clone refuses extraneous directory`

**Instructions File:** `plan-fix-reported-bugs/instructions/fix-clone-refuses-extraneous-no-failure-logged.md`

**Responsibility:** In `src/commands/clone/cloneSpecific.ts`, when the clone operation refuses because the target directory already exists, ensure a clone failure operation is logged to the operations log so the Operations Report reflects the refusal. Currently the refusal is silent — no operation is recorded.

**Files:**

- `src/commands/clone/cloneSpecific.ts` — log failure operation on directory-exists refusal
- `src/commands/clone/cloneSpecific.test.ts` — add test: clone logs failure when refusing extraneous dir

**Tests:** Add a test where a target directory exists, clone is attempted, and assert a clone failure operation is logged with an appropriate message.

**Edge cases:**

- Target dir exists → log clone failure, refuse operation.
- Target dir does not exist → proceed, log clone success (existing behaviour).
- Target dir exists but is the same checkout (idempotent) → no failure logged (existing behaviour).

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

## Follow ups

- Verify the `clone --all` path: `cloneAll.ts` still presents the Checkout Report without scanning — the fix landed only in `cloneSpecific.ts`.
- Add bugs analysed but rejected for this plan back to `_backlog/_parking-lot.md`.
