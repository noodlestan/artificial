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

- `Root Cause` – Example: "Checkouts not scanned before presenting.".
- `Test` – Examples: "Added assertion to test X", "Not Tested because no mocks exist".
- `Follow Ups` – Example: "Update BDD and Pseudo to include the tested edge case".
- `Commit.id` – Example: "fix-clone-scan-before-report".

## Bugs

### Bug: `clone Foo` fails silently

**Description:** `clone` with an unknown repo name fails silently — no output, no error, and no failure operation in the report.

**Scenario:** On a workspace, run `npm run workspace clone Foo` with a repo name that is not in the manifest.

**Expected:** Log a clone failure operation: `unknown repo "Foo"`.

**Happened:** No output and no error — the command exits silently.

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

### Bug: `clone` presents Checkout Report without scanning checkouts (FIXED)

**Description:** When invoking Clone command in with a checkout parameter and clone succeeds, it presents the Checkout Report straight from the store without scanning checkouts for state first, listing every recorded checkout with blank states instead of actual scanned states.

**Scenario:** On a workspace with recorded checkouts, chose a clean checkout and `rm -rf repos/conventions`. Then run `npm run workspace clone conventions` to clone it again.

**Expected:** After cloning, the Checkout Report reflects the scanned git state of checkouts on disk — states populated for cloned checkouts, uncloned checkouts not presented as scanned.

**Happened:** The Checkout Report listed all 9 recorded checkouts (Artificial, Conventions, No Comply, Projects, Purrception, Purrpose, Purrtrait, Terraform, Workspace Tooling) with blank `states` (`-`) — the report was presented straight from the store without any git scan.

**Root Cause:** Checkouts not scanned before presenting in `art-domains/cli/workspace/src/commands/clone/cloneSpecific.ts`.

**Test:** Not tested because no mocks exist for presenters.

**Follow Ups:**

- Requires setup mocking or assertion on presenters. Consider refactoring presentation to make it injectable. Configuration and the strategy pattern would go a long way here.
- `clone --all` path: `cloneAll.ts` still presents the Checkout Report without scanning — verify and fix if reproducible.

**Commit.id:** fix-clone-scan-before-report
