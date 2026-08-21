# Plan Bugs: Workspace CLI — Fixes and Test Coverage

**Plan:** `plan-repo-command-fixes-and-tests`

## Summary

Lists bugs reported for `@art-domains/workspace-cli` for triage and conversion into plan iterations. Sources include user sessions, the parking lot, test-suite analysis, and developer feedback.

## Bug Format

Every bug entry MUST follow this shape:

- `Bug.id` — stable identifier shared with the matching plan iteration.
- `Scenario` — reproduce steps.
- `Expected` — expected behaviour.
- `Happened` — observed behaviour, with evidence when available.
- `Description` — the short bug description in one sentence.

Fixed bugs stay at the bottom of the file and additionally record:

- `Root Cause` — why the bug occurred.
- `Fix` — how the bugg was fixed.
- `Test` — coverage added or why it was not tested.
- `Improvements` — other changes to make/made.
- `Follow Ups` — remaining work.
- `Commit.id` — implementation commit or iteration identifier.

## Bugs

### Bug: `repo` command does not find checkout by location

**Bug.id:** `repo-identify-checkout`

**Description:** Repo commands only works if checkout name provided.

**Scenario:** On a workspace with recorded checkouts run `npm run workspace repo <location>`. E.g. `artificial-bug-fixes` (repos/artificial-bug-fixes).

**Expected:** The Repository State Report is presented for that repository followed by Package State Report for that repository.

**Happened:** Responded with `unknown checkout: artificial-bug-fixes`. It did work for `npm run workspace repo "Artificial @ bug-fixes"` (the checkout name).

**Test:** `resolves checkout by location when name does not match` — creates a checkout with name `Artificial @ bug-fixes` and location `artificial-bug-fixes`, runs `runRepo` with `checkoutNames: ['artificial-bug-fixes']`, asserts the checkout is found and no warning emitted.

### Bug: `repo` command shows all Repository State Report before all Package State Report

**Bug.id:** `repo-state-report-under-its-repo-report`

**Description:** Repo commands lists all Repository states and then all packages for all repositories.

**Scenario:** On a workspace with recorded checkouts run `npm run workspace repo`.

**Expected:** Each repostitory state report is followed by the corresponding Package State Report and both end with empty line.

**Happened:** The Repository State Report is presented for all repositories (no paces) followed by all Package State Report for all repos.

**Root Cause:** in `art-domains/cli/workspace/src/commands/repo/runRepo.ts` for (const state of repositoryStates) does not enclose the package reports

**Test:** `groups each repository report with its package report` — creates two checkouts with distinct packages, runs `runRepo` with empty `checkoutNames`, asserts each `Repository: X` is immediately followed by `Packages for X:` before the next `Repository:` appears.

### Bug: `repo` command shows repeated repositories when multiple checkouts exist

**Bug.id:** `repo-state-report-repeated-checkouts`

**Description:** Repo commands lists all Repository states and then all packages for all repositories.

**Scenario:** On a workspace with recorded checkouts run `npm run workspace repo`.

**Expected:** Each repostitory state report is followed by the corresponding Package State Report.

**Happened:** The Repository State Report is followed by a Package State Report containing the packages for the first matched repository.

**Root Cause:** in `art-domains/cli/workspace/src/commands/repo/runRepo.ts` checkouts are not index by location.

**Test:** `keeps two checkouts of one repository distinct` — creates two checkouts of one repository with distinct package versions, asserts both versions appear in output. Full regression verified: 11/11 focused tests, 228/228 full suite.

**Fix:** rename targets to `checkoutsToReport` and make it a `Map<checkout location, checkout>`. make the `repositoryStates` a Map as well (call it `repositoryCheckoutStates`) and `packageStateRecords` also a `Map<checkout location, PackageStateRecord[]>` (rename it to `repositoryCheckoutPackages`), and at the boottom of RunRepo, present `presentRepositoryState` for each key of `repositoryCheckoutStates` followed by `presentPackageStateReport` all packages of same key in `repositoryCheckoutPackages` - `allPackageStates` not needed any more.

**Improvements:** extract `for (const project of graph.projects) {}` to `getRepositoryCheckoutPackages()` - extracting also from this function the matrioska functions that walk through the graph, extracting also the code inside `for (const pkgName of ns.packageNames) {` to `createPackageStateRecord()` - returns null versions and empty states, and `scanPackageStateRecord()` - populates versions and states. The entry point `getRepositoryCheckoutPackages` functions called from runRepo (`createPackageStateRecord` and `scanPackageStateRecord`) go in `art-domains/cli/workspace/src/private/repositories` - with all the other extracted details in `art-domains/cli/workspace/src/private/repositories/private/`.
