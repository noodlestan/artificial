# Workspace CLI — Commands

The command surface of the workspace CLI, their procedures, and their edge cases. Commands are hosted in `@art-domains/workspace-cli` (binary `art-workspace`) and invoked from the workspace root, either directly (`art-workspace <command>`) or through npm scripts (`npm run workspace -- <command>`).

## Command Surface

| command   | usage                                      | status      |
| --------- | ------------------------------------------ | ----------- |
| `sanity`  | `sanity [--auto]`                          | implemented |
| `pull`    | `pull`                                     | planned     |
| `push`    | `push`                                     | planned     |
| `sync`    | `sync`                                     | planned     |
| `repo`    | `repo [<location>...]`                     | implemented |
| `clone`   | `clone [--all] [<repo>] [<location>]`      | implemented |
| `branch`  | `branch <branch> [<checkout-location>...]` | implemented |
| `link`    | `link <location> <package> [<target>]`     | designed    |
| `links`   | `links`                                    | designed    |
| `unlink`  | `unlink <location> <package> [<target>]`   | designed    |
| `publish` | `publish [--auto]`                         | designed    |

Every command that touches checkouts presents reports (see `reports.md`).

## Common Data Flow

Commands share the same skeleton:

1. Load the config (`.art-workspace.mts`).
2. Create a `WorkspaceContext` — a `CheckoutStore` plus an `OperationsLog` (see `context-model.md`).
3. Load repository records; hydrate existing checkouts from checkout records (`loadRepositoryRecords` → `loadCheckoutRecords` → `hydrateStoreFromRecords`).
4. Scan git state; perform the command's work, recording side effects in the log.
5. Present reports. Checkout records are saved per mutation by the commands themselves (`saveCheckoutRecord`) — there is no global sync step.

## Sanity

**Usage:** `sanity [--auto]`

Check git status across all repos. Procedure: load repository records → hydrate checkouts from checkout records → scan workspace root (create temporary checkout record, not persisted, not merged into store) → scan all checkouts → scan extraneous → present Workspace Report + Checkout Report + Extraneous Report. With `--auto`, additionally pull if behind (before pushing) and push clean unpushed repos (see `sanity`'s `pushCleanCheckouts`) and append the Operations Report.

**BDD:**

```gherkin
Feature: Sanity check workspace status
  Scenario: sanity shows workspace status
    Given workspace root is on branch "main"
    And checkout "Artificial" is cloned on branch "main"
    When I run "art-workspace sanity"
    Then the Workspace Report lists workspace root
    And the Checkout Report lists "Artificial"

  Scenario: sanity detects "is behind" state
    Given workspace root is behind origin/main by 1 commit
    When I run "art-workspace sanity"
    Then the Workspace Report lists workspace root with state "1 commit behind"

  Scenario: sanity --auto pulls if behind and clean
    Given workspace root is behind origin/main by 1 commit
    And workspace root has no uncommitted changes
    When I run "art-workspace sanity --auto"
    Then workspace root is pulled from origin
    And a pull operation is logged with outcome success

  Scenario: sanity --auto does not pull if dirty
    Given workspace root is behind origin/main by 1 commit
    And workspace root has uncommitted changes
    When I run "art-workspace sanity --auto"
    Then workspace root is not pulled
    And the Workspace Report lists workspace root with state "uncommitted files; 1 commit behind"
```

**Edge cases:**

- Workspace root has no remote → report state "no remote"
- Workspace root is detached → report state "detached HEAD"
- Workspace root has conflicts → report state "merge conflicts"
- Workspace root pull fails → log failure, continue with other operations

## Pull

**Usage:** `pull`

Pull from origin for all clean checkouts. No arguments — acts only on clean branches. Procedure: load repository records → hydrate checkouts from checkout records → scan all → for each checkout: if clean and behind, pull → present Checkout Report + Operations Report.

**BDD:**

```gherkin
Feature: Pull from origin
  Scenario: pull clean checkouts that are behind
    Given checkout "Artificial" is cloned on branch "main" and is behind origin by 1 commit
    And checkout "Artificial" has no uncommitted changes
    When I run "art-workspace pull"
    Then checkout "Artificial" is pulled from origin
    And a pull operation is logged with outcome success
    And the Checkout Report lists "Artificial" with no "behind" state

  Scenario: pull skips dirty checkouts
    Given checkout "Artificial" is cloned on branch "main" and is behind origin by 1 commit
    And checkout "Artificial" has uncommitted changes
    When I run "art-workspace pull"
    Then checkout "Artificial" is not pulled
    And the Checkout Report lists "Artificial" with state "uncommitted files; 1 commit behind"

  Scenario: pull skips checkouts already up to date
    Given checkout "Artificial" is cloned on branch "main" and is up to date with origin
    When I run "art-workspace pull"
    Then no pull operation is logged for "Artificial"

  Scenario: pull skips checkouts not cloned
    Given checkout "Purrception" is recorded but not cloned
    When I run "art-workspace pull"
    Then checkout "Purrception" is skipped with a warning
```

**Edge cases:**

- Checkout not cloned → skip with warning.
- Checkout has no remote → skip, report state "no remote".
- Checkout is dirty (uncommitted changes) → skip, keep "uncommitted files" state.
- Checkout has merge conflicts → skip, report state "merge conflicts".
- Pull fails → log failure, continue with other checkouts.

## Push

**Usage:** `push`

Push to origin for all clean checkouts. No arguments — acts only on clean branches. Procedure: load repository records → hydrate checkouts from checkout records → scan all → for each checkout: if clean and ahead, try pull first, then push → present Checkout Report + Operations Report.

**BDD:**

```gherkin
Feature: Push to origin
  Scenario: push clean checkouts that are ahead
    Given checkout "Artificial" is cloned on branch "main" and is ahead of origin by 1 commit
    And checkout "Artificial" has no uncommitted changes
    When I run "art-workspace push"
    Then checkout "Artificial" is pushed to origin
    And a push operation is logged with outcome success
    And the Checkout Report lists "Artificial" with no "ahead" state

  Scenario: push tries pull first if behind
    Given checkout "Artificial" is cloned on branch "main" and is ahead of origin by 1 commit
    And checkout "Artificial" is also behind origin by 1 commit (diverged)
    And checkout "Artificial" has no uncommitted changes
    When I run "art-workspace push"
    Then checkout "Artificial" is pulled first
    And checkout "Artificial" is pushed to origin
    And a pull operation is logged with outcome success
    And a push operation is logged with outcome success

  Scenario: push skips dirty checkouts
    Given checkout "Artificial" is cloned on branch "main" and is ahead of origin by 1 commit
    And checkout "Artificial" has uncommitted changes
    When I run "art-workspace push"
    Then checkout "Artificial" is not pushed
    And the Checkout Report lists "Artificial" with state "uncommitted files; 1 commit ahead"

  Scenario: push skips checkouts already up to date
    Given checkout "Artificial" is cloned on branch "main" and is up to date with origin
    When I run "art-workspace push"
    Then no push operation is logged for "Artificial"

  Scenario: push skips checkouts not cloned
    Given checkout "Purrception" is recorded but not cloned
    When I run "art-workspace push"
    Then checkout "Purrception" is skipped with a warning
```

**Edge cases:**

- Checkout not cloned → skip with warning.
- Checkout has no remote → skip, report state "no remote".
- Checkout is dirty (uncommitted changes) → skip, keep "uncommitted files" state.
- Checkout has merge conflicts → skip, report state "merge conflicts".
- Pull fails → log failure, skip push for this checkout.
- Push fails → log failure, continue with other checkouts.

## Sync

**Usage:** `sync`

Sync all clean checkouts — pull then push regardless of captured states. No arguments — acts only on clean branches. Procedure: load repository records → hydrate checkouts from checkout records → scan all → for each checkout: if clean, pull then push → present Checkout Report + Operations Report.

**BDD:**

```gherkin
Feature: Sync checkouts
  Scenario: sync clean checkouts
    Given checkout "Artificial" is cloned on branch "main" and is behind origin by 1 commit
    And checkout "Artificial" has no uncommitted changes
    When I run "art-workspace sync"
    Then checkout "Artificial" is pulled from origin
    And checkout "Artificial" is pushed to origin
    And a pull operation is logged with outcome success
    And a push operation is logged with outcome success

  Scenario: sync skips dirty checkouts
    Given checkout "Artificial" is cloned on branch "main" and is behind origin by 1 commit
    And checkout "Artificial" has uncommitted changes
    When I run "art-workspace sync"
    Then checkout "Artificial" is not pulled or pushed
    And the Checkout Report lists "Artificial" with state "uncommitted files; 1 commit behind"

  Scenario: sync skips checkouts not cloned
    Given checkout "Purrception" is recorded but not cloned
    When I run "art-workspace sync"
    Then checkout "Purrception" is skipped with a warning

  Scenario: sync works on up to date checkouts
    Given checkout "Artificial" is cloned on branch "main" and is up to date with origin
    When I run "art-workspace sync"
    Then a pull operation is logged for "Artificial" (no-op)
    And no push operation is logged for "Artificial"
```

**Edge cases:**

- Checkout not cloned → skip with warning.
- Checkout has no remote → skip, report state "no remote".
- Checkout is dirty (uncommitted changes) → skip, keep "uncommitted files" state.
- Checkout has merge conflicts → skip, report state "merge conflicts".
- Pull fails → log failure, skip push for this checkout.
- Push fails → log failure, continue with other checkouts.

## Repo

**Usage:** `repo [<location>...]`

List the packages of active checkouts (all checkouts when none specified). Each argument is a checkout location. Read each checkout's project graph recursively via `loadProjectGraph` (project → namespaces → packages; record files are discovered by `findRecordFiles` supporting both legacy `ops/records/{kind}/` and co-located `_records/` layouts). Collect `PackageStateRecord` values per checkout via `getRepositoryCheckoutPackages`. Present results grouped by checkout: each checkout's Repository State Report (`Repository:`, `Checkout:`) is immediately followed by its Package State Report (`Packages for ...`). Multiple checkouts of the same repository remain distinct — each checkout location produces its own report pair.

**BDD:**

```gherkin
Feature: List repositories and their packages
  Scenario: list a single checkout's packages
    Given checkout "Artificial" is cloned with project records
    When I run "art-workspace repo Artificial"
    Then the Repository State Report lists "Artificial"
    And the Package State Report lists namespace "Art Domains"
    And the Package State Report lists package "@artisans/art-mantras" with current version from package.json
    And the Package State Report lists the published version from npm info

  Scenario: repo defaults to all checkouts when none specified
    Given checkouts "Artificial" and "Purrception" are cloned
    When I run "art-workspace repo"
    Then the Repository State Report lists "Artificial"
    And the Package State Report lists packages for "Artificial"
    And the Repository State Report lists "Purrception"
    And the Package State Report lists packages for "Purrception"
    And each Repository State Report is immediately followed by its Package State Report

  Scenario: keeps two checkouts of one repository distinct
    Given checkout "Artificial" is cloned at "repos/artificial" with version "1.0.0"
    And checkout "Artificial @ bug-fixes" is cloned at "repos/artificial-bug-fixes" with version "2.0.0"
    When I run "art-workspace repo"
    Then the Repository State Report lists "Artificial"
    And the Package State Report lists version "1.0.0" for "Artificial"
    And the Repository State Report lists "Artificial @ bug-fixes"
    And the Package State Report lists version "2.0.0" for "Artificial @ bug-fixes"

  Scenario: checkout has no project records
    Given checkout "Purrception" is cloned without project records
    When I run "art-workspace repo Purrception"
    Then the Repository State Report lists "Purrception" with state "no project records"

  Scenario: unknown checkout warns and skips
    When I run "art-workspace repo Unknown"
    Then a warning is printed for "unknown checkout: Unknown"

  Scenario: project references a missing namespace
    Given project "Artificial" lists namespace "Missing" with no namespace record
    When I run "art-workspace repo Artificial"
    Then a warning is printed for "unknown namespace: Missing"
    And the missing namespace is skipped

  Scenario: namespace references a missing package
    Given namespace "Art Domains" lists package "Missing" with no package record
    When I run "art-workspace repo Artificial"
    Then a warning is printed for "unknown package: Missing"
    And the missing package is skipped

  Scenario: package path has no package.json
    Given package "@artisans/art-mantras" has no package.json at its resolved path
    When I run "art-workspace repo Artificial"
    Then the Package State Report lists "@artisans/art-mantras" with state "no package.json"

  Scenario: npm info fails
    Given the npm registry is unreachable
    When I run "art-workspace repo Artificial"
    Then the Package State Report lists "@artisans/art-mantras" with published version "unknown"
    And the Package State Report lists state "npm info failed"
```

**Edge cases:**

- Unknown checkout (name or location) → warn on stderr, skip.
- No project records in the checkout → report the checkout with state `no project records`.
- Project record references a missing namespace record → warn, skip the namespace.
- Namespace record references a missing package record → warn, skip the package.
- `package.json` missing at the resolved package path → package state `no package.json`.
- `npm info` fails (unreachable registry, never published) → published version `unknown`, package state `npm info failed`.
- `repo` is read-only: no operations are logged; per-package failures surface as package states in the report.

## Clone

**Usage:** `clone [--all] [<repo>] [<location>]`

Three modes:

- **`clone --all`** — bootstrap the workspace by cloning all repos from the workspace record, updating records, and presenting the Checkout Report with Operations Report.
- **`clone <repo> [<location>]`** — clone a single repo for targeted work. The first argument is the repository name (case-insensitive manifest lookup; an `@scope/` prefix is stripped). The optional second argument is a location suffix: the resolved location is `safePath(<repo> <location>)` (e.g. `clone Artificial foo` → location `artificial foo` → `repos/artificial foo`). When omitted, the location defaults to `safePath(<repo>)` (e.g. `repos/artificial`). The checkout name is `{repo-name}` at the default location, or `{repo-name} @ {location}` at a custom location. Multiple checkouts of the same repo are not created by `clone` — a repo that already has a checkout at a different location is refused. Refuses when the target location is already used by another checkout.
- **`clone`** (no args) — status mode: present the Checkout Report and Extraneous Report without cloning.

**BDD:**

```gherkin
Feature: Clone single repo
  Scenario: clone with default location
    Given repo "Artificial" exists in the manifest
    When I run "art-workspace clone Artificial"
    Then checkout "Artificial" is created at "repos/artificial"
    And the Checkout Report contains "Artificial"

  Scenario: clone with explicit location
    Given repo "Artificial" exists in the manifest
    When I run "art-workspace clone Artificial foo"
    Then checkout "Artificial @ foo" is created at "repos/artificial foo"
    And the Checkout Report contains "Artificial @ foo"

  Scenario: clone is idempotent
    Given checkout "Artificial" exists at "repos/artificial"
    When I run "art-workspace clone Artificial"
    Then no new checkout is created
    And the Checkout Report contains "Artificial"

  Scenario: unknown repo fails
    When I run "art-workspace clone Unknown"
    Then a clone failure is logged for "unknown repo"

  Scenario: location taken by different checkout
    Given checkout "foo" exists at "repos/artificial foo"
    When I run "art-workspace clone Artificial foo"
    Then a clone failure is logged for "location artificial foo is already used by checkout 'foo'"

  Scenario: checkout exists at different location
    Given checkout "Artificial" exists at "repos/artificial"
    When I run "art-workspace clone Artificial custom"
    Then a clone failure is logged for "checkout for 'Artificial' exists at artificial. Cannot clone to artificial custom"
```

**Edge cases:**

- Unknown repo name → log `clone` failure: `unknown repo "{name}"`.
- Repo already has a checkout at a different location → log failure: `checkout for '{repo}' exists at {existing}, cannot clone to {resolved}`.
- Location already used by a different checkout → log failure: `location {loc} is already used by checkout '{name}'`.
- All unhappy paths produce a log operation (success or failure) with a clear message — never a silent return.

## Branch

**Usage:** `branch <branch> [<checkout-location>...]`

Create and checkout the same feature branch in each specified checkout (all checkouts when none specified, or when an empty list is passed), enabling coordinated cross-repo development. The optional arguments are checkout locations (basenames under the checkouts path). Procedure: for each location — resolve the checkout, scan, create/switch the branch, record a `branch created` operation (success `created {branch}` / `switched to {branch}`, or a failure). Update the checkout record's branch (`saveCheckoutRecord`). Present Checkout Report + Operations Report.

**BDD:**

```gherkin
Feature: Branch across checkouts
  Scenario: branch creates new branch in specified checkouts
    Given checkout "Artificial" is cloned on branch "main" at "repos/artificial"
    And checkout "Purrception" is cloned on branch "main" at "repos/purrception"
    When I run "art-workspace branch feat/x artificial purrception"
    Then branch "feat/x" exists in checkout "Artificial"
    And branch "feat/x" exists in checkout "Purrception"
    And the Operations Report contains "Artificial | branch created"
    And the Operations Report contains "Purrception | branch created"

  Scenario: branch defaults to all checkouts when none specified
    Given checkout "Artificial" is cloned on branch "main"
    And checkout "Purrception" is cloned on branch "main"
    When I run "art-workspace branch feat/x"
    Then branch "feat/x" exists in checkout "Artificial"
    And branch "feat/x" exists in checkout "Purrception"

  Scenario: branch switches to existing branch
    Given checkout "Artificial" has branch "feat/x"
    When I run "art-workspace branch feat/x artificial"
    Then the Operations Report contains "Artificial | branch created | switched to feat/x"

  Scenario: unknown location logs failure
    When I run "art-workspace branch feat/x unknown-location"
    Then the Operations Report contains "branch created | failure"
    And the failure message is "not cloned"

  Scenario: uncloned checkout logs failure
    Given checkout "Artificial" is recorded but not cloned
    When I run "art-workspace branch feat/x artificial"
    Then the Operations Report contains "Artificial | branch created | failure"
    And the failure message is "checkout not cloned"
```

**Edge cases:**

- Unknown location (no matching checkout record) → log branch failure `not cloned`, continue.
- Checkout not cloned on disk → log branch failure `checkout not cloned`, continue.
- Branch already exists → checkout the existing branch (`switched to {branch}`).
- Uncommitted changes → `git checkout` may fail; the error is logged as a branch failure, continue.

## Link

**Usage:** `link <location> <package> [<target>]`

Symlink a source package from a repo checkout location into a target location (`node_modules`) for local development. The `<location>` and `<target>` params are both checkout locations and should resolve to existing checkouts. If `target` is omitted the link is created in root workspace `node_modules/`. Read the `location` repository's project records for project, namespaces, and packages (records are at `_records/`). Match package to input `<package>`. Resolve `packagePath` = `{location}/{project-path}/{namespace-path}/{package-path}`. Resolve `{target}/node_modules/{canonical-name}`. Check if is dir/file — remove it. Create symlink to `packagePath`.

**BDD:**

```gherkin
Feature: Link a local package into a target checkout
  Scenario: link package to default target
    Given checkout "Artificial" is cloned with project records
    And package "@artisans/art-mantras" exists at path "artisans/apps/art-mantras/"
    When I run "art-workspace link Artificial @artisans/art-mantras"
    Then a symlink is created at "node_modules/@artisans/art-mantras"
    And the symlink points to "repos/artificial/artisans/apps/art-mantras/"
    And a linked operation is logged with outcome success

  Scenario: link package to explicit target
    Given checkout "Purrception" is cloned
    When I run "art-workspace link Artificial @artisans/art-mantras Purrception"
    Then a symlink is created at "repos/purrception/node_modules/@artisans/art-mantras"

  Scenario: link replaces an existing symlink
    Given a symlink already exists at "node_modules/@artisans/art-mantras"
    When I run "art-workspace link Artificial @artisans/art-mantras"
    Then the existing symlink is removed
    And a new symlink is created

  Scenario: link replaces an npm-installed directory
    Given a directory "node_modules/@artisans/art-mantras" exists
    When I run "art-workspace link Artificial @artisans/art-mantras"
    Then the existing directory is removed
    And a symlink is created

  Scenario: unknown package fails
    When I run "art-workspace link Artificial @unknown/missing"
    Then a linked operation is logged with outcome failure
    And the failure message names the unknown package

  Scenario: unknown location checkout fails
    When I run "art-workspace link Unknown @artisans/art-mantras"
    Then a linked operation is logged with outcome failure
    And the failure message names the unknown location

  Scenario: scoped target needs directory creation
    Given no directory exists at "node_modules/@artisans"
    When I run "art-workspace link Artificial @artisans/art-mantras"
    Then the directory "node_modules/@artisans" is created
    And the symlink is created at "node_modules/@artisans/art-mantras"
```

**Edge cases:**

- Location repository does not exist / not cloned → link operation failure.
- Location repository does not have project, namespace, or package records → failure.
- Project, namespace, or package record in location repository is invalid → failure.
- Unknown package name → link operation failure.
- Existing symlink → replace.
- Existing directory (npm-installed) → replace.
- Link target uses canonical-name; a scoped name may need intermediate directories (ensured) before creating the basename link.

## Links

**Usage:** `links`

Show symlink sources. Scan the workspace root `node_modules` and the `node_modules` of every known repository's projects (project records at `{checkout}/_records/`; resolve `{checkout-location}/{project-path}/node_modules`). For each entry that is a symlink — including scoped `@scope/pkg` subdirectories — collect a link (`package`, `location`). Present the Symlink Report.

**BDD:**

```gherkin
Feature: Show symlink sources
  Scenario: lists a linked package
    Given package "@no-comply/core" is symlinked into checkout "Purrception" node_modules
    When I run "art-workspace links"
    Then the Symlink Report lists "@no-comply/core"
    And the Symlink Report lists location "Purrception"

  Scenario: lists scoped packages recursively
    Given scoped package "@noodlestan/esbuild" is symlinked into the root node_modules
    When I run "art-workspace links"
    Then the Symlink Report lists "@noodlestan/esbuild"
    And the Symlink Report lists location "workspace root"

  Scenario: no symlinks found
    When I run "art-workspace links"
    Then the Symlink Report is empty

  Scenario: repository without project records is skipped
    Given repo "Purrception" has no project records
    When I run "art-workspace links"
    Then repo "Purrception" is skipped with a warning
```

**Edge cases:**

- Known repository without project records → warn, skip.
- Invalid project record → warn, skip the project.
- Scoped packages (`@scope/...`) → check the subdirectory entries, not the scope directory itself.
- `links` is read-only: no operations are logged.

## Unlink

**Usage:** `unlink <location> <package> [<target>]`

Remove a package symlink created by `link` and restore the published version with `npm install`. Params mirror `link`: `<location>` is the source checkout holding the package, `<package>` is the package name or canonical name, `<target>` is the consumer checkout location (defaults to the workspace root `node_modules/`). Procedure: read the source checkout's project records → resolve the package's canonical name → remove `{target}/node_modules/{canonical-name}` when it is a symlink → run `npm install` in the target → record `unlink` operations → present Operations Report.

**BDD:**

```gherkin
Feature: Unlink a local package from a target checkout
  Scenario: unlink removes an existing symlink and restores
    Given a symlink exists at "repos/purrception/node_modules/@artisans/art-mantras"
    When I run "art-workspace unlink Artificial @artisans/art-mantras Purrception"
    Then the symlink is removed
    And npm install runs in "repos/purrception"
    And an unlink operation is logged with outcome success

  Scenario: unlink defaults to workspace root target
    Given a symlink exists at "node_modules/@artisans/art-mantras"
    When I run "art-workspace unlink Artificial @artisans/art-mantras"
    Then the symlink is removed
    And npm install runs in the workspace root

  Scenario: target entry is npm-installed, not a symlink
    Given a directory "node_modules/@artisans/art-mantras" exists
    When I run "art-workspace unlink Artificial @artisans/art-mantras"
    Then nothing is removed
    And no unlink operation is logged

  Scenario: unknown package fails
    When I run "art-workspace unlink Artificial @unknown/missing"
    Then an unlink operation is logged with outcome failure
    And the failure message names the unknown package

  Scenario: unknown location checkout fails
    When I run "art-workspace unlink Unknown @artisans/art-mantras"
    Then an unlink operation is logged with outcome failure
    And the failure message names the unknown location
```

**Edge cases:**

- Location repository does not exist / not cloned → unlink operation failure.
- Unknown package name → unlink operation failure.
- Target entry is not a symlink (npm-installed) → skip, no operation.
- Symlink doesn't exist → skip, no operation.
- `npm install` fails → report error, continue.

## Publish

**Usage:** `publish [--auto]`

Push repos and publish packages to npm. Procedure: load existing checkouts → scan all → for each checkout: if `--auto`, push clean unpushed repos → read the checkout's project records (project → namespaces → packages) → check each package's version on npm → if `--auto`, publish unpublished packages → present Checkout Report + Operations Report.

**BDD:**

```gherkin
Feature: Publish packages
  Scenario: push and publish unpublished packages
    Given checkout "Artificial" is cloned on branch "main" with 2 unpushed commits
    And package "@artisans/art-mantras" at version 0.0.2 is unpublished
    When I run "art-workspace publish --auto"
    Then the branch is pushed to origin
    And @artisans/art-mantras@0.0.2 is published to npm
    And a push operation is logged with outcome success
    And a publish operation is logged with outcome success

  Scenario: already published packages are skipped
    Given package "@artisans/art-mantras" at version 0.0.1 is already published
    When I run "art-workspace publish --auto"
    Then no publish operation is logged for "@artisans/art-mantras"

  Scenario: repo not cloned is skipped
    Given checkout "Purrception" is not cloned
    When I run "art-workspace publish --auto"
    Then checkout "Purrception" is skipped with a warning

  Scenario: no remote skips the push
    Given checkout "Artificial" has no remote
    When I run "art-workspace publish --auto"
    Then no push operation is logged for "Artificial"
    And issue "no remote" is reported

  Scenario: npm publish fails and continues
    Given @artisans/art-mantras@0.0.2 fails to publish
    When I run "art-workspace publish --auto"
    Then a publish operation is logged with outcome failure for "@artisans/art-mantras"
    And remaining packages are still processed
```

**Edge cases:**

- Repo not cloned → skip with warning.
- No remote configured → skip push, log issue.
- Package already published → skip.
- `npm publish` fails → report error, continue with other packages.
- OTP required → error if `--auto`.

## Constraints

- Each repo alone: `git clone <repo>` + `npm install` + `npm run ci` passes without the workspace.
- The workspace `context` checkout edits workspace-owned artefacts only; extracted projects are edited in their own checkouts.

## Implementation Status

- **Implemented:** `clone` (all / specific / status), `sanity` (scan + `--auto` push), and `branch` (create/switch across checkouts), on top of the shared data model and reports.
- **Stubbed:** `link`, `unlink`, `publish` — command entry points exist but print "TODO"; the procedures above are the designed behaviour (from `_backlog/_architect.md` use cases and the pseudo contract).
