# Architecture: Workspace CLI

**Status:** `WORKING`

**Pseudo:** `art-domains/cli/workspace/architecture/_pseudo.md`

**Plans:**

- `art-domains/cli/workspace/_backlog/3-now/plan-workspace-cli/plan.md` - `WORKING`

**Description:** A workspace meta-repo orchestrates cross-repo work within an ecosystem via a workspace CLI (`@art-domains/workspace-cli`, binary `art-workspace`) that clones repositories, branches across checkouts, symlinks packages for local development, checks repository status, and publishes packages.

## Why

An ecosystem spans multiple independent repositories (`artificial`, `purrception`, `purrtrait`, `purrpose`, `no-comply`, `workspace-tooling`). Each repo builds standalone, but cross-repo development requires coordination: cloning all repos, branching across them, symlinking for local dev, and publishing packages. The workspace meta-repo orchestrates this workflow without becoming a build root.

### Key Benefits

- **Isolation** — each project repo builds standalone, reducing CI time and dependency conflicts.
- **Coordination** — workspace commands enable cross-repo development without manual setup.
- **Single source of truth** — records drive the workspace; the config and generated files derive from them.
- **Flexibility** — symlinks for active local dev, npm packages for published deps.
- **Traceability** — records document every repo's structure and checkout state.

## Definitions

- **Workspace:** A **meta-repo** that provides context for humans and agents alike (knowledge, references, instructions) and tools to work simultaneously across repositories. Example: `noodlestan/workspace`.
- **Update records** — synchronise checkout records with the filesystem: create records for new checkouts, update records for moved checkouts, remove records for deleted checkouts. Idempotent. See `architecture/context-model.md`.
- **Repo identity** — repos are identified by name, case-insensitive; package names are interchangeable with repo names. See `architecture/context-model.md`.
- **Reports** — Table presented after every command that touches checkouts (checkout, operations, extraneus, ...). See `architecture/reports.md`.

## How it works

### CLI Execution Model

**CLI package** (`@art-domains/workspace-cli`) — hosts the orchestration commands (`clone`, `branch`, `link`, `unlink`, `sanity`, `publish`).

The workspace owns:

- **Records** — Workspace config and repository and checkouts records (source of truth). Example: `$WORKSPACE/ops/records/`
- **Config** — The `.art-workspace.mts` module at the workspace root, defines paths (records, templates, checkouts), importable by tools. See `architecture/config.md`.
- **Context** — Agent instructions and reference material. Example: `$WORKSPACE/.agents/`, `$WORKSPACE/reference/`.
- **Checkouts** — The cloned repositories under a checkout path, whose state is scanned from git and tracked in records. Examples: `repos/{checkout-name}`.

Commands run as **imperative one-shot processes**: each invocation creates a `WorkspaceContext` (an in-memory `CheckoutStore` plus `OperationsLog`), performs work, presents reports, and exits. The design stays clean enough that a reactive layer (`npm run workspace watch`) can subscribe to the same store and log APIs without rearchitecting: the store is rehydratable from disk, the log is append-only, and checkout records are saved per mutation by the commands themselves (`saveCheckoutRecord`) — there is no global sync step. See `records/adr/execution-model.art`.

### Data Model

Every command operates on a `WorkspaceContext` holding:

- **CheckoutStore** — in-memory state of all known checkouts, hydrated from checkout records (`hydrateStoreFromRecords`), scanned for git state; checkout records are saved per mutation by the commands (`saveCheckoutRecord`).
- **OperationsLog** — append-only log of the side effects performed during the command (clone, push, publish, branch created, linked, unlink), each recorded with a success or failure outcome.

Details in `context-model.md` and `operations-log.md`.

### Reports

Commands present markdown-table reports of what they found and did: the **Checkout Report** (always, after any command that touches checkouts), the **Operations Report** (when side effects occurred), and the **Extraneous Report** (directories under the clone path with no matching checkout record). Details in `reports.md`.

### Config Loading

The CLI loads `.art-workspace.mts` at runtime by bundling it with esbuild (Vite-style) and importing the result. The `/config` subpath exposes a typed authoring API (`defineConfig`) so the manifest type-checks against the package. Details in `config.md`.

## Use Cases

- **Sanity** — check git status across all repos; with `--auto`, push clean unpushed repos.
- **Clone** — bootstrap the workspace by cloning all repos (`clone --all`), clone a single repo (`clone <repo> [<location>]`), or report status without cloning (`clone`).
- **Branch** — create and checkout the same feature branch across multiple repos for coordinated feature work.
- **Publish** — push repos and publish packages to npm.
- **Link / Unlink** — symlink local packages into consumers' `node_modules` for local dev; remove the symlinks and restore npm packages.
