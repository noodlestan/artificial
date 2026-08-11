# Plan: Workspace CLI

**ID:** `workspace-cli`

**Status:** `WORKING`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Create `@art-domains/workspace-cli` package at `repos/artificial/art-domains/cli/workspace` with bin `art-workspace`. The CLI hosts workspace orchestration commands: `clone`, `branch`, `link`, `sanity`, `publish`. First end-to-end test case is `sanity` command.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md)

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/records/adr/cli.art` — CLI package decisions (location, manifest format, records as source of truth, tech stack)
- `architecture/records/adr/execution-model.art` — imperative-first, reactive-later execution model
- `$WORKSPACE/ops/records/workspace.art` — workspace record with known repositories
- `$WORKSPACE/ops/records/repositories/*.art` — per-repo records
- `$WORKSPACE/.agents/domains/workspace/structures/` — Structure: Workspace, Structure: Repository, Structure: Checkout

## Commits

### `cli-codebase-decisions` - `COMMITTED`

**Commit:** `04fae35` — commander, simple-git, @noodlestan/esbuild, vitest, strict TypeScript, tables + minimal colors. **Record:** `architecture/records/adr/cli.art`

### `cli-codebase-scaffold` - `COMMITTED`

**Commit:** `d95570c` — scaffold `@art-domains/workspace-cli` at `repos/artificial/art-domains/cli/workspace`.

### `cli-entry-point-setup` - `COMMITTED`

**Commit:** `f1a10fa` — CLI entry point with commander routing.

### `workspace-cli-install` - `COMMITTED`

**Commit:** `fcd5985` — install and expose `@art-domains/workspace-cli` at workspace root.

### `workspace-config` - `COMMITTED`

**Commits:** `286173d`, `94a4b9e` (artificial); `3ca7156`, `1c07898` (workspace) — `defineConfig`, workspace manifest loader, esbuild bundle-at-runtime.

### `sanity-command` - `COMMITTED`

**Commit:** `226d44b` (artificial), `cdc7275` (workspace) — sanity command with `verifyCheckouts`, `--auto` push, table output.

### `clone-command` - `COMMITTED`

**Commit:** `5e77152` (artificial), `80eb1fe` (workspace) — idempotent clone with checkout records.

### `config-refactor` - `COMMITTED`

**Commit:** `16265fb` — inject config paths instead of records; `loadRepositories`/`loadCheckouts` from record files.

### `refactor-commands` - `COMMITTED`

**Commit Message:** `refactor(workspace-cli): restructure commands and implement new data model`

**Commit:** `7e07c05`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/refactor-commands.md`

**Report:** [refactor-commands\_\_report.md](./instructions/refactor-commands__report.md)

### `clone-sanity-corrective` - `COMMITTED`

**Commit Message:** `fix(workspace-cli): lint, build, and clone/sanity correctness`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/clone-sanity-corrective.md`

**Report:** [clone-sanity-corrective__report.md](./instructions/clone-sanity-corrective__report.md)

### `sanity-workspace` - `COMMITTED`

**Commits:**

- `531824c` — `feat(workspace-cli): add sanity-workspace, report headers, lint scripts`
- `01d85dd` — `feat(workspace-cli): log push failures in sanity --auto`
- `aea2484` — `feat(workspace-cli): formal operation logs, fix sanity --auto push of untracked branches, per-unit tests`

**Note:** Delegated directly from this plan section — no instruction file or report. BDD moved to `architecture/_pseudo.md`.

### `branch-command` - `COMMITTED`

**Commit:** `771e58c` — implement `art-workspace branch`: create/switch branches across checkouts by record name, typed success/failure ops, Checkout + Operations reports, CLI wiring, record-layer dedup (CheckoutRecord type, loadCheckouts loader).

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/branch-command.md`

**Report:** [branch-command__report.md](./instructions/branch-command__report.md)

**Note:** Pre-existing lint issues in `_backlog/` and `architecture/` (42 files, none in `src/`). No `ci` script in package.json (follow-up).

### `clone-checkout-resolution` - `DRAFT`

**Commit Message:** `feat(workspace-cli): clone resolves locations as basenames, supports multiple checkouts per repo`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/clone-checkout-resolution.md`

Refactor `clone <repo> [<location>]` so that `location` is treated as a basename under the config checkouts path, the checkout name is derived from the location, and multiple checkouts of the same repo are supported.

**Use case:**

- `clone <repo>` → checkout name = repo name, location = `repos/{repo}` (unchanged default)
- `clone <repo> <location>` → checkout name = `basename(location)`, location = `repos/{basename(location)}`
- `clone <repo> repos/foo` → `basename("repos/foo")` = `foo` → no double-prefix

**Responsibilities:**

- Resolve location: `join(config.records.checkouts.path, basename(location))`
- Derive checkout name: `basename(location)` when given, repo name when not
- Match by checkout name first (idempotent if same location, fail if different)
- Match by location second (fail if taken by different checkout)
- Log failure with clear reason for every unhappy path
- `cloneIfMissing` saves record with `record.name` (checkout name, not repo name)
- `cloneIfMissing` writes `**Repository:**` field as resource reference `Repository: {repo.name}`

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → clone command.

### `link-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement link command`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/link-command.md`

Implement `art-workspace link` command.

**Use case:**

- `art-workspace link repository [namespaces] [packages]` → symlink all identified packages (optionally filtered by packages or namespaces, additive) into other repo consumers' `node_modules/` for local dev.

**Responsibilities:**

- Identify packages in source repo (all, or filtered by namespace/package name)
- Find consumer repos (from manifest "consumers" field)
- Create symlinks in consumer `node_modules/` pointing to source packages

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → link command.

### `unlink-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement unlink command`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/unlink-command.md`

Implement `art-workspace unlink` command.

**Use case:**

- `art-workspace unlink repository [namespaces] [packages]` → remove all symlinks to matching packages and run npm install again in affected consumers.

**Responsibilities:**

- Identify symlinks to remove (matching source repo packages)
- Remove symlinks from consumer `node_modules/`
- Run `npm install` in affected consumers to restore npm-installed versions

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → unlink command.

### `publish-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement publish command`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/publish-command.md`

Implement `art-workspace publish` command.

**Use case:**

- `art-workspace publish --auto` → for each repo: check git status, push clean unpushed repos if `--auto` provided marking them as "pushed now", then for each non-private package check if version is published on npm, publish if not and `--auto` provided. Report table: `repo/directory` | `branch` | `issues` | `pushed? (no/now/yes)` | `published? (no/now/yes)`.

**Responsibilities:**

- For each repo: check git status, optionally push
- For each non-private package: check if version exists on npm
- If `--auto`: publish unpublished packages
- Report table with push and publish status

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → publish command.

### `manifest-generator` - `DRAFT`

**Commit Message:** `feat(workspace-cli): generate workspace manifest from records`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/manifest-generator.md`

Auto-generate `.art-workspace.mts` from the records. **MANDATORY before the plan is delivered** — replaces the manually-authored manifest.

**Responsibilities:**

- Implement a generator that reads and interprets the records (`workspace.art`, `repositories/*.art`) and renders `.art-workspace.mts` mirroring the structures
- Wire it as a CLI command (e.g., `art-workspace generate`) so it can run on demand
- Keep the render idempotent and never drop data the CLI needs (`checkout`, `remote`, `branch`, `consumers`)

**Validation:**

- `art-workspace generate` reproduces the manually-authored manifest (diff clean)
- After a records edit, re-running the generator reflects the change

**Pseudo details:** `architecture/_pseudo.md` → Auxiliary Functions → loadWorkspaceConfig.

### `github-workflows` - `DRAFT`

**Commit Message:** `ci: add GitHub Actions workflow`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/github-workflow.md`

Add GitHub Actions CI workflows to every project repo and the workspace.

**Note:** This is not priority. Deferred until other commands are implemented.

## Follow ups

- **Publishing workflow** — formalize the publish-then-symlink pattern into a Workflow resource with agent modes, skills, and commands.
- **Prepare `@art-domains/workspace` domain** — after `@art-domains/workspace-cli` is established, prepare the domain package to host workspace structures and other resources.
- **Checkout structure** — done in `clone-command` planning: `.agents/domains/workspace/structures/checkout__structure.md` + template `.agents/domains/workspace/templates/checkout.art.njk`; record IO lands with the clone iteration.
- **Checkouts as CLI-managed records** — implemented in `clone-command`: `$WORKSPACE/ops/records/checkouts/<name>.art` via `saveCheckoutRecord`/`readCheckoutRecord` (template + regex for now). **Note:** `CheckoutStore.syncRecords()` is still a no-op — the store sync isn't wired to `saveCheckoutRecord`; commands call `syncRecords()` with no effect. Deferred.
- **`art` parser for records** — replace regex `readCheckoutRecord`/`readRepositoryRecord` with the real `art` parser when available (deferred "later").
- **Template-engine governance** — `records.checkouts.template` (manifest path) replaces the HARDCODED template in `config-refactor`; formalize template location/versioning (follow-up).
- **Structured consumers** — repository records carry `consumers` as raw text for now; structured parsing is a follow-up.
- **`delete` command** — remove checkout records / checkouts (`delete` listed under CLI-managed records).
- **Namespace `art-domains/` README** — namespace directory left empty; add namespace-level scaffolding (user feedback item).

## Feedback

### Post-delegation corrections (architect)

- **`workspace-config` (delegation report feedback):** `loadWorkspaceConfig` as specified cannot load the authored manifest at runtime — bundling the package entry pulls commander (CJS) into the temp bundle and esbuild's CJS→ESM output throws `Dynamic require of "node:events"` under Node ESM. **Fix required before `sanity-command`:** split the config authoring surface into a `./config` subpath export (no runtime imports) and point the manifest at `@art-domains/workspace-cli/config`. See [workspace-config\_\_report.md](./instructions/workspace-config__report.md) → Feedback for this and other items (coverage `src/index.ts` exclude, consumers normalization, `tsc` at workspace root).

- `workspace-cli-install` was BLOCKED because the workspace root has no `package.json` and the instruction never authorised creating it. Instruction updated to authorise creating the root manifest with `@art-domains/workspace-cli@0.0.1` as its single devDependency (`name: noodlestan-workspace`, `private: true`). Re-delegated: user executed and committed `fcd5985` (`COMMITTED`).

### Post-delegation corrections (user)

- Namespace renamed from "Workspace Tools" to "Art Domains" — the namespace is `art-domains`, not `workspace`. This is a broader namespace that can host multiple domain packages.
- Package record renamed from `workspace-cli.art` to `domains-workspace-cli.art` — reflects it's a domain package within the `art-domains` namespace.
- Package path is `cli/workspace/` (relative to namespace path `art-domains`), not `art-domains/cli/workspace/`.
- Namespace directory `art-domains/` was left empty — no namespace-level scaffolding (README?) is present. This is a follow-up item.
