# Parking Lot: Workspace CLI

The high level briefing, principles, requirements are in `_architect.md`. Backlog plans are derived from here.
The plans live in `_backlog/` and contain delegatable instructions.
This file is the tracker and parking lot. Column convention: **ACTIONABLE** / **PENDING** / **BLOCKER** / **FOLLOW-UPS** (not in scope). No done items here — completed work is recorded in `_backlog/`.

## Parking Lot

### ACTIONABLE

- None current. Active implementation is tracked in `_backlog/3-now/plan-workspace-cli/plan.md`.

### PENDING

- **Formalize Publishing Workflow** — formalize the publish-then-symlink pattern into a `Workflow: Publishing` resource. Define agent modes, skills (`publishing-workflow`), and commands. Integration with plan files: when a plan reaches `DONE` status, the publishing workflow identifies what needs publishing. Feeds off `_backlog/1-done/`. Related to `$WORKSPACE/.agents/domains/changelogs/` — publishing triggers changelog generation.

- **Formalize Delivery Workflow** — create a `Workflow: Delivery` resource in `$WORKSPACE/.agents/domains/engineering/_guide.md` that captures the full delivery cycle: Planning → Delegation → Execution → Publishing → Changelog. Agent modes: architect, delegator, worker. Skills: `planning-workflow`, `publishing-workflow` (new), `write-changelog`.

- **Investigate `$WORKSPACE/.agents/domains/changelogs/`** — separate domain for changelog management. Should be dependency of engineering domain (like plans). Own structures, agent modes (if any), skills. `write-changelog` skill already exists — may need expansion. Changelogs generated from completed plans in backlogs. Example: `_backlog/1-done/`.

- **Prepare `@art-domains/workspace` domain** — after `@art-domains/workspace-cli` is established, prepare the domain package to host workspace structures and other resources, including a reference to the CLI companion package.

- **Reverse edge resolution** — `purrpose → @no-comply/solid-primitives` is still using `file:` resolution. After no-comply packages are published to npm, rewire to npm version.

- **repo-ci** — GitHub Actions workflows for all repos. **DRAFT** — instruction file at `_backlog/3-now/plan-workspace-cli/instructions/github-workflow.md`. Not priority.

- **Update CLI README** — match format of `art-js/cli/bin/README.md`, preserving command summary.

### BLOCKER

(none)

### FOLLOW-UPS (not in scope)

- Evaluate turbo remote caching for cross-repo builds.
- Release cadence and versioning strategy across repos.
- What happens to `NOCOMPLY.md` and root docs after the rename?
- Archive the legacy `noodlestan/eslint-config` repo after its package is consumed via npm.
