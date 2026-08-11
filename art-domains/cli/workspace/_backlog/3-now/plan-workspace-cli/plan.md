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

**Artifacts:**

- Filesystem restructure: one command per directory, one function per file, helpers in private, shared types extracted
- Data model: WorkspaceContext, CheckoutStore, OperationsLog, scanCheckout (immutable), typed operations, always full table
- 67 tests passing, coverage above thresholds (89% stmts, 82% branches, 88% funcs)

### `clone-sanity-corrective` - `COMMITTED`

**Commit Message:** `fix(workspace-cli): lint, build, and clone/sanity correctness`

Fix lint errors, build failures, and 3 correctness issues found during manual testing.

**Issues to fix:**

1. **Lint errors** — `npm run lint` reports many errors. Run `npm run lint:fix` first, then fix remaining manually.
2. **Build failures** — `npm run build` fails. Fix after lint is clean.
3. **Push log wrong branch** — `sanity --auto` logs "to origin/main" instead of the actual branch being pushed. Fix the branch reference in the push log.
4. **Custom location ignored** — `clone <repo> <target>` silently skips target when checkout already exists. Either move the checkout or refuse with an error.
5. **Lossy record roundtrip** — `**Repository:**` field stripped from checkout records on save. `saveCheckoutRecord` must preserve all fields from the loaded record.

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/clone-sanity-corrective.md`

**Report:** [clone-sanity-corrective__report.md](./instructions/clone-sanity-corrective__report.md)

**Artifacts:**

- Lint clean (unused imports, stub params)
- Build passes clean
- Sanity push log uses scanned branch
- Clone refuses custom location when checkout exists
- Lossy record roundtrip fixed — `**Repository:**` field preserved

### `sanity-workspace` - `COMMITTED`

**Commits:**

- `531824c` (artificial) — `feat(workspace-cli): add sanity-workspace, report headers, lint scripts`
- `01d85dd` (artificial) — `feat(workspace-cli): log push failures in sanity --auto`
- `aea2484` (artificial) — `feat(workspace-cli): formal operation logs, fix sanity --auto push of untracked branches, per-unit tests`

Implement workspace-level sanity: the root repo (`@noodlestan/workspace`) is scanned alongside project checkouts and appears in the Checkout Report as `WORKSPACE`.

**Use case:**

- `art-workspace sanity` → Checkout Report includes `WORKSPACE | . | main | —` row at the top (or bottom).
- `art-workspace sanity --auto` → pushes the workspace root if clean and unpushed, same as project repos.

**Responsibilities:**

- Add workspace repo as a special checkout entry in the store (not from records — it's the root).
- `scanCheckout` works the same way — the workspace is just another checkout with `location: .`.
- `sanity --auto` pushes root if clean, has remote, unpushed > 0.
- Operations Report includes `WORKSPACE | pushed | to origin/main` when root is pushed.

**Tweaks (scope creep — land with this commit):**

- Rename `issues` column to `states` in Checkout Report, Operations Report, and Extraneous Report.
- Render a header line before each table (e.g. `Checkout Report:`) and an empty line after each table.

**BDD specs (test-first):**

```gherkin
Feature: Workspace sanity
  Scenario: sanity shows workspace repo in report
    Given the workspace repo is on branch "main"
    When I run "art-workspace sanity"
    Then the Checkout Report contains a row for "WORKSPACE"

  Scenario: sanity --auto pushes workspace repo
    Given the workspace repo has unpushed commits
    And the workspace repo is not dirty
    When I run "art-workspace sanity --auto"
    Then the workspace repo is pushed
    And the Operations Report contains "WORKSPACE | pushed"

  Scenario: sanity does not push dirty workspace
    Given the workspace repo has uncommitted changes
    When I run "art-workspace sanity --auto"
    Then the workspace repo is not pushed
    And the Checkout Report shows "uncommitted files" for "WORKSPACE"

Feature: Report formatting
  Scenario: reports have headers and spacing
    Given I run "art-workspace clone --all"
    Then the output shows "Checkout Report:" before the checkout table
    And the output shows "Operations Report:" before the operations table
    And each table is followed by an empty line

  Scenario: column is named states not issues
    Given I run "art-workspace sanity"
    Then the Checkout Report header contains "states" not "issues"
```

**Note:** Delegated directly from this plan section — no separate instruction file, and no `__report.md` was produced. Feedback reconstructed from the commit trail:

**Feedback (reconstructed):**

- `sanity --auto` did not push branches without an upstream — fixed by capturing `remoteBranch` in `scanCheckout` (`getRemoteBranch`) and creating the branch on the remote on push (the `-1` "not pushed" sentinel was removed).
- Ad-hoc `log.cloned()/pushed()` replaced with the structured `Operation` model: `OperationsLog.log(operation)` plus factories in `src/private/operations/` (`createPushSuccess`/`createPushFailure`, `createCloneSuccess`/`createCloneFailure`).
- Presenters moved to `src/private/present/` — one function per file; the Operations Report gained a `🟢`/`🔴` outcome column in column zero.
- Monolithic `shared.test.ts` split per unit (`operations-log`, `checkout`, `checkout-store`, `workspace-context`); the `--auto` push test now asserts an actual push.

### `branch-command` - `DRAFT`

**Commit Message:** `feat(workspace-cli): implement branch command`

**Instructions File:** `_backlog/3-now/plan-workspace-cli/instructions/branch-command.md`

Implement `art-workspace branch` command.

**Use case:**

- `art-workspace branch feat/x [checkout-name, ...]` → create/switch to `feat/x` in the specified checkouts.

**Responsibilities:**

- Parse branch name and checkout
- Load checkout list and validate checkouts exist
- Checkout branch in each specified checkout

**Also in scope (record-layer cleanup, first steps):**

- Single `CheckoutRecord` type — remove the duplicate in `src/private/records/checkout-record.ts` and the inline `record` shape in `src/shared/checkout.ts`; keep the definition in `src/config/types.ts` (gains `repository?`).
- Single `loadCheckouts` loader — remove the duplicate in `src/private/records/checkout-record.ts`; keep `src/config/load-checkouts.ts`; move the loader tests to `src/config/load-checkouts.test.ts`.

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → branch command.

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
