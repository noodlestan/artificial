# Parking Lot: Workspace CLI

The high level briefing, principles, requirements are in `_backlog/_architect.md`. Backlog plans are derived from here.
The plans live in `_backlog/` and contain delegatable instructions.
This file is the tracker and parking lot. Column convention: **ACTIONABLE** / **PENDING** / **BLOCKER** / **FOLLOW-UPS** (not in scope). No done items here — completed work is recorded in `_backlog/`.

## Parking Lot

### BUGS

| bug                                                      | repro                                                   | expected                                                | found                                                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `--version` shows wrong version                          | `npm run workspace -- --version`                        | should show `0.0.14` (current package version)          | shows `0.0.9` (stale version)                                                                                       |
| `clone Foo` fails silently                               | `npm run workspace clone Foo`                           | log clone failure: `unknown repo "Foo"`                 | no output, no error                                                                                                 |
| Synthetic repo log noise                                 | `npm run workspace sanity`                              | no console output before Checkout Report                | `checkout Purrtrait: no matching repository record, using synthetic repository`                                     |
| Extraneous empty dir states                              | `repos/blah` (no .git)                                  | `unknown project; no git`                               | `unknown project; uncommitted files` — fix: early `.git` existence check in `scanCheckout` before git introspection |
| Operations Report missing outcome markers                | `npm run workspace clone --all`                         | `🟢` / `🔴` column zero in Operations Report            | no outcome markers — just `repo                                                                                     | operation | detail` |
| Clone refuses second checkout of same repo               | `clone Purrtrait bug-fix` when `repos/purrtrait` exists | create checkout `Purrtrait-bug-fix` at `repos/bug-fix/` | error: `Purrtrait already exists at repos/purrtrait`                                                                |
| Clone should refuse if target dir is extraneous          | `clone Purrtrait bug-fix` when `repos/bug-fix` exists   | error: directory already exists                         | creates checkout anyway                                                                                             |
| Clone custom location wrong name/path                    | `clone Purrtrait bug-fix`                               | name `Purrtrait-bug-fix`, dir `repos/bug-fix/`          | name `Purrtrait`, dir `bug-fix` (at repo root, not under repos/)                                                    |
| Extraneous items in Checkout Report                      | `npm run workspace sanity`                              | Extraneous checkouts only in Extraneous Report          | extraneous items appear in Checkout Report too — filter them out                                                    |
| Clone refuses extraneous dir but no failure logged       | `clone Purrtrait bug-fix` when `repos/bug-fix` exists   | log clone failure operation                             | refuses silently, no operation in report                                                                            |
| Extraneous with file (no .git) shows "uncommitted files" | `repos/blah` with a `foo` file                          | `unknown project; no git`                               | `unknown project; uncommitted files` — `.git` check should come before git introspection                            |

### PENDING FEATURES

None current.

### ACTIONABLE

- **Fix `--version` showing stale version** — `npm run workspace -- --version` shows `0.0.9` but package is at `0.0.14`. Investigate why version is not being read from package.json correctly.
- **Implement checkout name resolution code fix** — `resolveCheckoutByName` is designed in `architecture/_pseudo.md` (commit `040b07e`) but `src/commands/repo/runRepo.ts` still calls `getCheckoutByName` directly; the `repo` command still doesn't accept checkout names.
- **Verify remaining bugs** — check if other bugs in the BUGS table are still valid (clone edge cases, extraneous items, etc.)
- **Fix `pull-push-sync-command` instruction drift (plan `implement-pull-push-sync`)** — the commit-1 instruction `_backlog/4-next/plan-implement-pull-push-sync/instructions/pull-push-sync-command.md` references `src/private/scan/types.ts` for the `Checkout` type (actual: `src/private/store/createCheckout.ts`) and says "create" `scanWorkspaceState.ts` / `presentWorkspaceReport.ts` which already exist (landed in commit `51cad48`). The plan.md was corrected to READY; the instruction file must be updated so the commit-1 worker updates those files instead of creating them.

### PENDING

- **Release workspace-cli changes** — CHANGELOG + `package.json` version bump for `plan-fix-repo-command-issues` changes not yet released (plan archived to `_backlog/1-done/`). Run `archive plans` / `release plans` in backlog-manager mode.

- **Formalize Publishing Workflow** — formalize the publish-then-symlink pattern into a `Workflow: Publishing` resource. Define agent modes, skills (`publishing-workflow`), and commands. Integration with plan files: when a plan reaches `DONE` status, the publishing workflow identifies what needs publishing. Feeds off `_backlog/1-done/`. Related to `$WORKSPACE/.agents/domains/changelogs/` — publishing triggers changelog generation.

- **Formalize Delivery Workflow** — create a `Workflow: Delivery` resource in `$WORKSPACE/.agents/domains/engineering/_guide.md` that captures the full delivery cycle: Planning → Delegation → Execution → Publishing → Changelog. Agent modes: architect, delegator, worker. Skills: `planning-workflow`, `publishing-workflow` (new), `write-changelog`.

- **Investigate `$WORKSPACE/.agents/domains/changelogs/`** — separate domain for changelog management. Should be dependency of engineering domain (like plans). Own structures, agent modes (if any), skills. `write-changelog` skill already exists — may need expansion. Changelogs generated from completed plans in backlogs. Example: `_backlog/1-done/`.

- **Prepare `@art-domains/workspace` domain** — after `@art-domains/workspace-cli` is established, prepare the domain package to host workspace structures and other resources, including a reference to the CLI companion package.

- **Reverse edge resolution** — `purrpose → @no-comply/solid-primitives` is still using `file:` resolution. After no-comply packages are published to npm, rewire to npm version.

- **repo-ci** — GitHub Actions workflows for all repos. **DRAFT** — needs instruction file. Not priority.

- **Update CLI README** — match format of other CLI READMEs in the ecosystem, preserving command summary.

### BLOCKER

- None current.

### FOLLOW-UPS (not in scope)

- Evaluate turbo remote caching for cross-repo builds.
- Release cadence and versioning strategy across repos.
- What happens to `NOCOMPLY.md` and root docs after the rename?
- Archive the legacy `noodlestan/eslint-config` repo after its package is consumed via npm.
