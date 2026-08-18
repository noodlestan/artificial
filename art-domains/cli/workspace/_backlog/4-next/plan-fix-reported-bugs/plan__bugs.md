# Plan (Bugs): Workspace CLI — Fix Reported Bugs

**ID:** `fix-reported-bugs`

## Summary

Lists bugs reported for `@art-domains/workspace-cli`. Source of work: bugs captured from user sessions (long-running architect session) and from the BUGS table in `_backlog/_parking-lot.md`.

## Bug Format

Every bug entry MUST follow this shape (the first bug below is the example):

- `Scenario` — reproduce steps
- `Expected` — expected behaviour
- `Happened` — observed behaviour (with evidence when available).
- `Description` — the short bug description in one sentence.

Fixed bugs stay at the bottom of the file and get two more fields:

- `Root Cause` — Example: "Checkouts not scanned before presenting.".
- `Test` — Examples: "Added assertion to test X", "Not Tested because no mocks exist".
- `Follow Ups` — Example: "Update BDD and Pseudo to include the tested edge case".
- `Commit.id` — Example: "fix-clone-scan-before-report".

## Bugs

### Bug: Checkout report fails to detect wrong remote

**Description:** When a checkout directory is a clone of a different repository than the one recorded, `repo`/`sanity` commands present the Checkout Report as if the checkout were fine, instead of surfacing a "wrong remote" state.

**Scenario:** On a workspace where a checkout is a clone of a different remote than its record (current workspace case: `repos/purrpose` actual remote is `git@github.com:noodlestan/conventions.git` while the record declares `git@github.com:noodlestan/purrpose.git`), run `npm run workspace sanity` (or `repo`).

**Expected:** The Checkout Report marks the checkout `wrong remote` — a missing remote/record mismatch check, not a silent scan.

**Happened:** The checkout is scanned and presented as a normal checkout, as if nothing were wrong.

### Bug: `cloneIfMissing` ignores the record branch

**Description:** When cloning a missing checkout for an existing record, `cloneIfMissing` clones the default branch instead of the branch recorded, and overwrites the record's branch to `main`.

**Scenario:** `rm -rf repos/terraform`, then (with the `terraform` checkout record on a non-main branch) run `npm run workspace clone terraform`.

**Expected:** The clone checks out the branch from the record, and the record's branch is preserved.

**Happened:** The clone lands on `main` (default), and the record is rewritten with `branch: main`.

**Root Cause:** `art-domains/cli/workspace/src/commands/clone/private/cloneIfMissing.ts` runs `git.clone(remote, path)` (default branch), then `saveCheckoutRecord(..., branch: actualBranch || 'main')` — the record branch is never read.

### Bug: Clone refuses second checkout of same repo

**Description:** `clone <repo> <location>` refuses a second checkout of a repo that already has a checkout, instead of creating the named checkout.

**Scenario:** `repos/purrtrait` exists; run `npm run workspace clone Purrtrait bug-fix`.

**Expected:** Create checkout `Purrtrait-bug-fix` at `repos/bug-fix/`.

**Happened:** Error: `Purrtrait already exists at repos/purrtrait`.

### Bug: Clone should refuse if target dir is extraneous

**Description:** `clone` creates a checkout even when the target directory already exists, instead of refusing.

**Scenario:** `repos/bug-fix` exists as an extraneous directory; run `npm run workspace clone Purrtrait bug-fix`.

**Expected:** Error: directory already exists.

**Happened:** Creates the checkout anyway.

### Bug: Clone custom location wrong name/path

**Description:** `clone <repo> <location>` produces the wrong checkout name and path — the name stays `Purrtrait` and the directory lands at the repo root instead of under `repos/`.

**Scenario:** Run `npm run workspace clone Purrtrait bug-fix`.

**Expected:** Checkout name `Purrtrait-bug-fix`, directory `repos/bug-fix/`.

**Happened:** Checkout name `Purrtrait`, directory `bug-fix` at the repo root (not under `repos/`).

### Bug: Clone refuses extraneous dir but no failure logged

**Description:** `clone` refuses an extraneous target directory but logs no failure operation in the report.

**Scenario:** `repos/bug-fix` exists as an extraneous directory; run `npm run workspace clone Purrtrait bug-fix`.

**Expected:** Log a clone failure operation.

**Happened:** Refuses silently — no operation in the report.

### Bug: `clone` presents Checkout Report without scanning checkouts (FIXED by `decouple-checkout-scan-states`)

**Description:** When invoking Clone command in with a checkout parameter and clone succeeds, it presents the Checkout Report straight from the store without scanning checkouts for state first, listing every recorded checkout with blank states instead of actual scanned states.

**Scenario:** On a workspace with recorded checkouts, chose a clean checkout and `rm -rf repos/conventions`. Then run `npm run workspace clone conventions` to clone it again.

**Expected:** After cloning, the Checkout Report reflects the scanned git state of checkouts on disk — states populated for cloned checkouts, uncloned checkouts not presented as scanned.

**Happened:** The Checkout Report listed all 9 recorded checkouts (Artificial, Conventions, No Comply, Projects, Purrception, Purrpose, Purrtrait, Terraform, Workspace Tooling) with blank `states` (`-`) — the report was presented straight from the store without any git scan.

**Root Cause:** Checkouts not scanned before presenting in `art-domains/cli/workspace/src/commands/clone/cloneSpecific.ts`.

**Test:** Not tested because no mocks exist for presenters.

**Follow Ups:**

- Requires setup mocking or assertion on presenters. Consider refactoring presentation to make it injectable. Configuration and the strategy pattern would go a long way here.

**Commit.id:** fix-clone-scan-before-report

### Bug: `clone --all` presents Checkout Report without scanning (FIXED by `decouple-checkout-scan-states`)

**Description:** `clone --all` presented the Checkout Report without scanning checkouts, so states were blank.

**Scenario:** Run `npm run workspace clone --all` on a workspace with recorded checkouts.

**Expected:** The Checkout Report reflects the scanned git state after cloning.

**Happened:** The Checkout Report was presented straight from the store with blank `states`.

**Root Cause:** `cloneAll` did not scan the hydrated store before presenting the report.

**Test:** Covered by the package test suite; package verification passes.

**Follow Ups:** Add a dedicated presenter assertion if presentation injection is introduced.

**Commit.id:** `decouple-checkout-scan-states`

### Bug: `clone Foo` fails silently (FIXED by `decouple-checkout-scan-states`)

**Description:** `clone` with an unknown repo name failed silently without a failure operation.

**Scenario:** Run `npm run workspace clone Foo` with a repo name that is not in the manifest.

**Expected:** Log a clone failure operation containing `unknown repo "Foo"`.

**Happened:** No output or failure operation was produced.

**Root Cause:** `cloneSpecific` did not create or present a clone failure for an unknown repository.

**Test:** `src/commands/clone/cloneSpecific.test.ts` asserts the failure operation; package verification passes.

**Follow Ups:** None.

**Commit.id:** `decouple-checkout-scan-states`
