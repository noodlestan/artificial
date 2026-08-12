# Workspace CLI — Commands

The command surface of the workspace CLI, their procedures, and their edge cases. Commands are hosted in `@art-domains/workspace-cli` (binary `art-workspace`) and invoked from the workspace root, either directly (`art-workspace <command>`) or through npm scripts (`npm run workspace -- <command>`).

## Command Surface

| command   | usage                                       | status      |
| --------- | ------------------------------------------- | ----------- |
| `sanity`  | `sanity [--auto]`                           | implemented |
| `clone`   | `clone [--all] [<repo>] [<location>]`       | implemented |
| `branch`  | `branch <branch> [<checkout-name>...]`      | implemented |
| `repo`    | `repo <repo>`                               | designed    |
| `link`    | `link <repo> [<namespaces>] [<packages>]`   | designed    |
| `unlink`  | `unlink <repo> [<namespaces>] [<packages>]` | designed    |
| `publish` | `publish [--auto]`                          | designed    |

Every command that touches checkouts presents reports (see `reports.md`).

## Common Data Flow

Commands share the same skeleton:

1. Load the config (`.art-workspace.mts`).
2. Create a `WorkspaceContext` — a `CheckoutStore` plus an `OperationsLog` (see `context-model.md`).
3. Load repository records; hydrate existing checkouts from checkout records.
4. Scan git state; perform the command's work, recording side effects in the log.
5. Present reports; sync records back to disk (designed — `syncRecords()` is stubbed).

## Sanity

**Usage:** `sanity [--auto]`

Check git status across all repos. Procedure: load existing checkouts → scan all → scan extraneous → present Checkout Report + Extraneous Report. With `--auto`, additionally push clean unpushed repos, append the Operations Report, and sync records.

`sanity` also adds the workspace root itself as a checkout, so the workspace repo is part of the report.

## Clone

**Usage:** `clone [--all] [<repo>] [<location>]`

Three modes:

- **`clone --all`** — bootstrap the workspace by cloning all repos from the workspace record, updating records, and presenting the Checkout Report with Operations Report.
- **`clone <repo> [<location>]`** — clone a single repo for targeted work. The first argument is the repository name (must exist in the manifest). The optional second argument is a location basename under the config checkouts path (e.g. `foo` → `repos/foo`). When omitted, the location defaults to `repos/{repo-name}`. The checkout name is `{repo-name}` at the default location, or `{repo-name}-{location}` at a custom location. Multiple checkouts of the same repo are supported — each gets a unique name derived from its location.
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
    Then checkout "foo" is created at "repos/foo"
    And the Checkout Report contains "foo"

  Scenario: clone is idempotent
    Given checkout "Artificial" exists at "repos/artificial"
    When I run "art-workspace clone Artificial"
    Then no new checkout is created
    And the Checkout Report contains "Artificial"

  Scenario: unknown repo fails
    When I run "art-workspace clone Unknown"
    Then a clone failure is logged for "unknown repo"

  Scenario: location taken by different checkout
    Given checkout "foo" exists at "repos/foo"
    When I run "art-workspace clone Artificial foo"
    Then a clone failure is logged for "location repos/foo is already used"

  Scenario: checkout exists at different location
    Given checkout "Artificial" exists at "repos/artificial"
    When I run "art-workspace clone Artificial custom"
    Then a clone failure is logged for "cannot clone to repos/custom"
```

**Edge cases:**

- Unknown repo name → log `clone` failure: `unknown repo "{name}"`.
- Location already used by a different checkout → log failure: `location {loc} is already used by checkout '{name}'`.
- Checkout for this repo exists at a different location → log failure: `checkout for '{repo}' exists at {existing}, cannot clone to {resolved}`.
- All unhappy paths produce a log operation (success or failure) with a clear message — never a silent return.

## Branch

**Usage:** `branch <branch> [<checkout-name>...]`

Create and checkout the same feature branch in each specified checkout (all checkouts when none specified), enabling coordinated cross-repo development. Procedure: for each checkout — create branch if needed, checkout, record a `branch created` operation. Update the checkout record's branch. Present Checkout Report + Operations Report.

**BDD:**

```gherkin
Feature: Branch across checkouts
  Scenario: branch creates new branch in specified checkouts
    Given checkout "Artificial" is cloned on branch "main"
    And checkout "Purrception" is cloned on branch "main"
    When I run "art-workspace branch feat/x Artificial Purrception"
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
    When I run "art-workspace branch feat/x Artificial"
    Then the Operations Report contains "Artificial | branch created | switched to feat/x"

  Scenario: unknown checkout warns and skips
    When I run "art-workspace branch feat/x Unknown"
    Then a warning is printed for "unknown checkout: Unknown"
    And no operations are logged

  Scenario: uncloned checkout logs failure
    Given checkout "Artificial" is not cloned
    When I run "art-workspace branch feat/x Artificial"
    Then the Operations Report contains "Artificial | branch created | failure"
```

**Edge cases:**

- Unknown checkout → warn on stderr, skip.
- Checkout not cloned → skip with warning, log failure operation.
- Branch already exists → checkout the existing branch.
- Uncommitted changes → warn but proceed (`git checkout -b` handles this).

## Link

**Usage:** `link <repo> [<namespaces>] [<packages>]`

Symlink local packages from a source repo into consumers' `node_modules` for local development, optionally filtered by namespace or package name. Procedure: identify packages → find consumers → create symlinks in `node_modules` → record `linked` operations → present Operations Report.

**Edge cases:**

- Consumer not cloned → skip with warning.
- Existing symlink → replace.
- Existing directory (npm-installed) → error — don't overwrite without confirmation.

## Unlink

**Usage:** `unlink <repo> [<namespaces>] [<packages>]`

Remove package symlinks from consumers' `node_modules` and run `npm install` to restore published versions. Procedure: identify symlinks → remove them → run `npm install` in affected consumers → record `unlink` operations → present Operations Report.

**Edge cases:**

- Consumer not cloned → skip with warning.
- Not a symlink → skip (npm-installed).
- Symlink doesn't exist → skip.
- `npm install` fails → report error, continue.

## Publish

**Usage:** `publish [--auto]`

Push repos and publish packages to npm. Procedure: iterate repos → check git → if `--auto`: push → check package versions on npm → if `--auto`: publish unpublished packages → present Checkout Report + Operations Report.

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
