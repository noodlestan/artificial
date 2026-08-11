# Workspace CLI — Commands

The command surface of the workspace CLI, their procedures, and their edge cases. Commands are hosted in `@art-domains/workspace-cli` (binary `art-workspace`) and invoked from the workspace root, either directly (`art-workspace <command>`) or through npm scripts (`npm run workspace -- <command>`).

## Command Surface

| command | usage | status |
| --- | --- | --- |
| `clone` | `clone [--all] [<repo>] [<target>]` | implemented |
| `branch` | `branch <branch> [<repo>...]` | designed |
| `link` | `link <repo> [<namespaces>] [<packages>]` | designed |
| `unlink` | `unlink <repo> [<namespaces>] [<packages>]` | designed |
| `sanity` | `sanity [--auto]` | implemented |
| `publish` | `publish [--auto]` | designed |

Every command that touches checkouts presents reports (see `reports.md`).

## Common Data Flow

Commands share the same skeleton:

1. Load the config (`.art-workspace.mts`).
2. Create a `WorkspaceContext` — a `CheckoutStore` plus an `OperationsLog` (see `context-model.md`).
3. Load repository records; hydrate existing checkouts from checkout records.
4. Scan git state; perform the command's work, recording side effects in the log.
5. Present reports; sync records back to disk (designed — `syncRecords()` is stubbed).

## Clone

**Usage:** `clone [--all] [<repo>] [<target>]`

Three modes:

- **`clone --all`** — bootstrap the workspace by cloning all repos from the workspace record, updating records, and presenting the Checkout Report with Operations Report.
- **`clone <repo> [<target>]`** — clone a single repo for targeted work. Location resolution: argument → record override → default (`repos/{repo}`). Update records, present Checkout Report + Operations Report.
- **`clone`** (no args) — status mode: present the Checkout Report and Extraneous Report without cloning.

Repo names are case-insensitive and package names (e.g. `@noodlestan/artificial`) are interchangeable with repo names. Cloning an existing checkout is idempotent — it reports the current state instead of cloning again.

**Edge cases:**

- Unknown repo name → error "unknown repo".
- Custom target location must handle a previous checkout: either remove the old directory or refuse until the old checkout is cleaned up.

## Branch

**Usage:** `branch <branch> [<repo>...]`

Create and checkout the same feature branch in each specified repository, enabling coordinated cross-repo development. Procedure: for each repo — create branch, checkout, record a `branch created` operation. Present Checkout Report + Operations Report.

**Edge cases:**

- Repo not cloned → skip with warning, log operation.
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

## Sanity

**Usage:** `sanity [--auto]`

Check git status across all repos. Procedure: load existing checkouts → scan all → scan extraneous → present Checkout Report + Extraneous Report. With `--auto`, additionally push clean unpushed repos, append the Operations Report, and sync records.

`sanity` also adds the workspace root itself as a checkout, so the workspace repo is part of the report.

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

- **Implemented:** `clone` (all / specific / status) and `sanity` (scan + `--auto` push), on top of the shared data model and reports.
- **Stubbed:** `branch`, `link`, `unlink`, `publish` — command entry points exist but print "TODO"; the procedures above are the designed behaviour (from `_backlog/_architect.md` use cases and the pseudo contract).
