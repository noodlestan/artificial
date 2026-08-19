# Plan: Workspace CLI — Fix Reported Bugs

**ID:** `fix-reported-bugs`

**Status:** `DONE`

## Summary

Fix bugs reported for `@art-domains/workspace-cli`. Source of work: bugs captured from user sessions (long-running architect session) and from the BUGS table in `_backlog/_parking-lot.md`.

## Iterations

### `fix-clone-scan-before-report` - `DONE`

**Bug:** `clone` presents Checkout Report without scanning checkouts.

**Commit.id:** `b185ec1`

**Changes:** In `src/commands/clone/cloneSpecific.ts`, added `scanAllCheckoutsStates(ctx)` after hydration so the Checkout Report reflects scanned git state. Applied to `clone <repo>` path only.

**Feedback:**

- `cloneAll.ts` (`clone --all`) still presents the Checkout Report without scanning — see Follow ups.
- No test added — no mocks exist for presenters (parking lot PENDING "Injectable Presentation").

### `fix-sanity-extraneous-known-checkouts` - `DONE`

**Bug:** `sanity` flags known checkouts as extraneous.

**Commit.id:** `8556c7a`

**Report:** `plan-fix-reported-bugs/instructions/fix-sanity-extraneous-known-checkouts__report.md`

**Changes:** Added `CheckoutStore` parameter to `scanExtraneousCheckouts`, filtering known locations before adding to extraneous list. Updated `runSanity.ts` to pass `ctx.store`. Added test: known checkout in store is not extraneous.

### `fix-scan-checkout-state-wrong-branch-for-extraneous` - `DONE`

**Bug:** Extraneous checkouts show "wrong branch".

**Commit.id:** `6750885`

**Report:** `plan-fix-reported-bugs/instructions/fix-scan-checkout-state-wrong-branch-for-extraneous__report.md`

**Changes:** Guarded the "wrong branch" check in `scanCheckoutState.ts` so it only fires when `checkout.record.branch` is non-empty. Added test: checkout with empty record branch does not get "wrong branch".

### `fix-clone-wrong-remote` - `DONE`

**Bug:** Checkout report fails to detect wrong remote.

**Commit.id:** `6d665a6`

**Report:** `plan-fix-reported-bugs/instructions/fix-clone-wrong-remote__report.md`

**Changes:** Added `getRemoteUrl` helper and remote comparison in `scanCheckoutState.ts`. When actual remote differs from record, adds `wrong remote` issue. Added 2 tests for matching and mismatching remotes.

### `fix-clone-ignores-record-branch` - `DONE`

**Bug:** `cloneIfMissing` ignores the record branch.

**Commit.id:** `e74693e`

**Report:** `plan-fix-reported-bugs/instructions/fix-clone-ignores-record-branch__report.md`

**Changes:** In `cloneIfMissing.ts`, after cloning, checks out the branch from `checkout.record.branch` and updates the record with the actual branch on disk. Added test: clone respects record branch.

### `fix-clone-refuses-second-checkout` - `DONE`

**Bug:** Clone refuses second checkout of same repo at different location.

**Commit.id:** `754a08f`

**Report:** `plan-fix-reported-bugs/instructions/fix-clone-refuses-second-checkout__report.md`

**Changes:** Guard removal already done in prior commit; added test coverage for clone to new location when checkout exists elsewhere. 197/197 tests pass.

### `fix-clone-should-refuse-extraneous-dir` - `DONE`

**Bug:** Clone should refuse if target dir is extraneous.

**Commit.id:** `7e69306`

**Report:** `plan-fix-reported-bugs/instructions/fix-clone-should-refuse-extraneous-dir__report.md`

**Changes:** Added directory existence check in `cloneSpecific.ts` before checkout creation. When target dir exists, logs clone failure and refuses operation. Added test: clone refuses when target dir exists.

### `fix-clone-custom-location-wrong-name` - `DONE`

**Bug:** Clone custom location produces wrong name/path.

**Commit.id:** `5a98d86`

**Report:** `plan-fix-reported-bugs/instructions/fix-clone-custom-location-wrong-name__report.md`

**Changes:** Fixed checkout name and path computation for custom locations. Name is now `{repo} @ {location}`, directory resolves to `repos/{location}` via `safePath`. Added test: custom location produces correct name and path.

### `fix-clone-refuses-extraneous-no-failure-logged` - `DONE`

**Bug:** Clone refuses extraneous dir but no failure logged.

**Commit.id:** `7e69306` (already implemented in `fix-clone-should-refuse-extraneous-dir`)

**Report:** `plan-fix-reported-bugs/instructions/fix-clone-refuses-extraneous-no-failure-logged__report.md`

**Changes:** Already implemented in prior commit `7e69306`. No new code changes needed.

## Follow ups

- Verify the `clone --all` path: `cloneAll.ts` still presents the Checkout Report without scanning — the fix landed only in `cloneSpecific.ts`.
- Add bugs analysed but rejected for this plan back to `_backlog/_parking-lot.md`.
