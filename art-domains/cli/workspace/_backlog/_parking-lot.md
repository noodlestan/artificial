# Parking Lot: Workspace CLI

The high level briefing, principles, requirements are in `_backlog/_architect.md`. Backlog plans are derived from here.
The plans live in `_backlog/` and contain delegatable instructions.
This file is the tracker and parking lot. Column convention: **ACTIONABLE** / **PENDING** / **BLOCKER** / **FOLLOW-UPS** (not in scope). No done items here — completed work is recorded in `_backlog/`.

## Parking Lot

### BUGS

| bug                                                      | repro                                                   | expected                                                | found                                                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `clone Foo` fails silently                               | `npm run workspace clone Foo`                           | log clone failure: `unknown repo "Foo"`                 | no output, no error                                                                                                 |
| Synthetic repo log noise                                 | `npm run workspace sanity`                              | no console output before Checkout Report                | `checkout Purrtrait: no matching repository record, using synthetic repository`                                     |
| Extraneous empty dir states                              | `repos/blah` (no .git)                                  | `unknown project; no git`                               | `unknown project; uncommitted files` — fix: early `.git` existence check in `scanCheckout` before git introspection |
| Operations Report missing outcome markers                | `npm run workspace clone --all`                         | `🟢` / `🔴` column zero in Operations Report            | no outcome markers — just `repo                                                                                     | operation | detail` |
| Clone refuses second checkout of same repo               | `clone Purrtrait bug-fix` when `repos/purrtrait` exists | create checkout `Purrtrait-bug-fix` at `repos/bug-fix/` | error: `Purrtrait already exists at repos/purrtrait`                                                                |
| Clone should refuse if target dir is extraneous          | `clone Purrtrait bug-fix` when `repos/bug-fix` exists   | error: directory already exists                         | creates checkout anyway                                                                                             |
| Clone custom location wrong name/path                    | `clone Purrtrait bug-fix`                               | name `Purrtrait-bug-fix`, dir `repos/bug-fix/`          | name `Purrtrait`, dir `bug-fix` (at repo root, not under repos/)                                                    |
| Extraneous items in Checkout Report                      | `npm run workspace sanity`                              | Extraneous checkouts only in Extraneous Report          | extraneous items appear in Checkout Report too — filter them out                                                    |
| Workspace not first in Checkout Report                   | `npm run workspace sanity`                              | `WORKSPACE` row appears first                           | `WORKSPACE` appears sorted by name — create workspace checkout before loading records                               |
| Clone refuses extraneous dir but no failure logged       | `clone Purrtrait bug-fix` when `repos/bug-fix` exists   | log clone failure operation                             | refuses silently, no operation in report                                                                            |
| Extraneous with file (no .git) shows "uncommitted files" | `repos/blah` with a `foo` file                          | `unknown project; no git`                               | `unknown project; uncommitted files` — `.git` check should come before git introspection                            |

### ACTIONABLE

- **Delegate `repo-test-coverage`** — implement 35 missing tests for the repo command. Instruction ready at `_backlog/3-now/implement-command-repo/instructions/repo-test-coverage.md`.

### PENDING

- **Formalize Publishing Workflow** — formalize the publish-then-symlink pattern into a `Workflow: Publishing` resource. Define agent modes, skills (`publishing-workflow`), and commands. Integration with plan files: when a plan reaches `DONE` status, the publishing workflow identifies what needs publishing. Feeds off `_backlog/1-done/`. Related to `$WORKSPACE/.agents/domains/changelogs/` — publishing triggers changelog generation.

- **Formalize Delivery Workflow** — create a `Workflow: Delivery` resource in `$WORKSPACE/.agents/domains/engineering/_guide.md` that captures the full delivery cycle: Planning → Delegation → Execution → Publishing → Changelog. Agent modes: architect, delegator, worker. Skills: `planning-workflow`, `publishing-workflow` (new), `write-changelog`.

- **Investigate `$WORKSPACE/.agents/domains/changelogs/`** — separate domain for changelog management. Should be dependency of engineering domain (like plans). Own structures, agent modes (if any), skills. `write-changelog` skill already exists — may need expansion. Changelogs generated from completed plans in backlogs. Example: `_backlog/1-done/`.

- **Prepare `@art-domains/workspace` domain** — after `@art-domains/workspace-cli` is established, prepare the domain package to host workspace structures and other resources, including a reference to the CLI companion package.

- **Reverse edge resolution** — `purrpose → @no-comply/solid-primitives` is still using `file:` resolution. After no-comply packages are published to npm, rewire to npm version.

- **repo-ci** — GitHub Actions workflows for all repos. **DRAFT** — see `milestone-workspace-one` plan. Not priority.

- **Update CLI README** — match format of `art-js/cli/bin/README.md`, preserving command summary.

### BLOCKER

- **35 todo tests from repo command** — worker created test scaffolds but never implemented actual tests. See `_backlog/3-now/implement-command-repo/plan.md` (iteration `repo-test-coverage`, PLANNED).

### FOLLOW-UPS (not in scope)

- Evaluate turbo remote caching for cross-repo builds.
- Release cadence and versioning strategy across repos.
- What happens to `NOCOMPLY.md` and root docs after the rename?
- Archive the legacy `noodlestan/eslint-config` repo after its package is consumed via npm.
