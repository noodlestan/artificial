# Workspace CLI — Context

The per-command data model of the workspace CLI: `WorkspaceContext`, `CheckoutStore`, `Checkout`, the records they are built from, and the functions that scan and sync them.

## WorkspaceContext

Per-command invocation context. Passed as a single object to all routines — never destructured. It is the designed shape of the imperative execution model (see `index.md` — Execution Model, and `records/adr/execution-model.art`).

```typescript
interface WorkspaceContext {
  config: WorkspaceConfig; // loaded from .art-workspace.mts (root.path = invocation cwd)
  store: CheckoutStore; // in-memory checkout state
  log: OperationsLog; // append-only side-effect log
}
```

## CheckoutStore

In-memory state of all known checkouts. Created per command invocation and hydrated from disk records. Keyed by checkout location.

| member                             | semantics                                                            |
| ---------------------------------- | -------------------------------------------------------------------- |
| `addCheckout(checkout)`            | add a checkout; logs an error on duplicate location                  |
| `getCheckoutForLocation(location)` | exact location lookup                                                |
| `getCheckoutOfRepo(name)`          | first checkout whose repo name matches (case-insensitive)            |
| `getCheckoutByName(name)`          | first checkout whose record name matches (case-insensitive)          |
| `updateCheckout(checkout)`         | replace a checkout in the store by location                          |
| `getAllCheckouts()`                | all checkouts                                                        |
| `markExtraneous(config, location)` | mark/create a checkout at a location as extraneous (never persisted) |
| `getExtraneous()`                  | checkouts marked extraneous                                          |

The store is populated by `hydrateStoreFromRecords(ctx, records)` (see Scanning below), called by every command after loading records. Records are persisted by the commands themselves via `saveCheckoutRecord` — the store is in-memory only (see Syncing).

## Checkout

Individual repo checkout state. State fields are populated by `scanCheckoutState` reading git from the filesystem; `repo` and `record` come from the store.

```typescript
interface Checkout {
  repo?: RepositoryRecord; // undefined = no matching repository record
  record: CheckoutRecord; // name, location, branch, repository
  path: string; // absolute dir = join(config.root.path, config.clone.path, record.location)
  exists: boolean;
  remoteBranch: string | null; // null = no tracking branch (new/untracked)
  detached: boolean; // detached HEAD
  conflicts: boolean; // merge conflicts
  dirty: boolean; // uncommitted files
  hasRemote: boolean;
  unpushed: number; // 0 = nothing to push, >0 = commits ahead of remoteBranch
  issues: string[]; // human-readable states, e.g. "uncommitted files"
  extraneous: boolean; // directory with no matching record
}
```

## Records

Records are the source of truth (see `records/adr/cli.art` — "Records as Source of Truth").

- **`RepositoryRecord`** — repository facts: name, remote, purpose, description, consumers. Persisted in `ops/records/repositories/{repo}.art`. Read-only facts; never mutated by commands.
- **`CheckoutRecord`** — checkout state: name, location, branch, repository (repo name reference). Persisted in `ops/records/checkouts/{name}.art`. Workspace-local state, owned by the CLI commands (see `records/adr/cli.art` — "Checkouts as CLI-Managed Records — Structure: Checkout").
- **`WorkspaceRecord`** — the workspace itself and its known repositories, in `ops/records/workspace.art`.

Repo identity is by name, case-insensitive; package names are interchangeable with repo names. The canonical form is the record heading (`## Repository: Artificial`).

## Project Records

Three record kinds are read from _inside_ each checkout (the project's own `ops/records/`), by the `repo`, `link`, `links`, and `publish` commands. All are **read-only** — never mutated by commands.

- **`ProjectRecord`** — a project hosted in a checkout: name, remote, canonical name, path, namespaces (by name), workspaces. Persisted at `ops/records/projects/{name}.art`.
- **`ProjectNamespace`** — a namespace within a project: name, path, packages (by name). Persisted at `ops/records/namespaces/{name}.art`.
- **`ProjectPackage`** — a package within a namespace: name, canonical name, path, version. Persisted at `ops/records/packages/{name}.art`.

Reading is hierarchical — **project first, then namespaces, then packages** — and the records are linked by name (`project.namespaces` → `namespace.name`, `namespace.packages` → `package.name`). A record missing a referenced name is skipped with a warning. This order matters: the project is the root (remote + canonical name), namespaces mediate between project and packages, and packages are the leaves (most numerous, resolved last when paths can be fully composed).

```typescript
interface ProjectRecord {
  name: string; // ## Project: Artificial
  remote: string; // **Remote:** — clone source
  canonicalName: string; // **Canonical Name:** — @scope/name
  path: string; // **Path:** — project root within the checkout
  namespaces: string[]; // **Namespaces:** — names, linked to ProjectNamespace
  workspaces: string[]; // **Workspaces:** — globs
  purpose?: string;
  description?: string;
  version?: string;
  packageManager?: string;
}

interface ProjectNamespace {
  name: string; // ## Namespace: Art Domains
  path: string; // **Path:** — relative to the project path
  packages: string[]; // **Packages:** — names, linked to ProjectPackage
  purpose?: string;
  description?: string;
}

interface ProjectPackage {
  name: string; // ## Package: Art Mantras
  canonicalName: string; // **Canonical Name:** — @scope/name
  path: string; // **Path:** — package dir relative to the namespace path; package.json lives here
  version?: string; // **Version:**
  packageFile?: string; // **PackageFile:** — defaults to package.json
  dependencies?: string[];
  scripts?: string[];
}
```

The types are deliberately minimal: paths and remotes (what `repo`/`link`/`links`/`publish` resolve on disk) plus names and relationships (what links the hierarchy together). Optional fields are parsed when present.

### Reader Organization

The records layer (`src/private/records/`) is organized **by record kind**. Today it holds 2 kinds, implemented as flat files: repositories (read-only: `readRepositoryRecord`, `loadRepositoryRecords`) and checkouts (read/write: `readCheckoutRecord`, `saveCheckoutRecord`, `loadCheckoutRecords`), plus `types.ts`. The 3 project record kinds above will be added as a third kind family (all read-only):

```text
src/private/records/
  readRepositoryRecord.ts   # repository: read-only
  loadRepositoryRecords.ts
  readCheckoutRecord.ts     # checkout: read/write
  saveCheckoutRecord.ts
  loadCheckoutRecords.ts
  types.ts
  # project kind family (designed): readProjectRecord, readNamespaceRecord,
  # readPackageRecord, loadProjectRecords (the reading procedure entry point)
```

`loadProjectRecords(checkout)` is the single entry point running the reading procedure: read projects → read namespaces → read packages → link by name (project `path` + namespace `path` + package `path` compose the on-disk package path).

### Reading Procedure

```text
readProjectRecords(ctx, checkout)
  recordsDir  = join(checkout.path, "ops/records")
  projects    = readProjectRecord   (recordsDir/projects/*.art)
  namespaces  = readNamespaceRecord (recordsDir/namespaces/*.art)
  packages    = readPackageRecord   (recordsDir/packages/*.art)
  link by name, warn on unresolved references
  return projects (with namespaces and packages resolved)
```

## Scanning

- **`scanCheckoutState(ctx, checkout)`** — read git state from the filesystem, create a new checkout instance with updated state, and set it in the store (no direct mutation). Returns the new checkout.
- **`scanAllCheckoutsStates(ctx)`** — scan every checkout in the store.
- **`scanExtraneousCheckouts(ctx)`** — scan directories under the clone path that have no matching checkout record and mark them extraneous.
- **`hydrateStoreFromRecords(ctx, records)`** — create a checkout instance per `RepositoryCheckoutRecord` (`createCheckout(config, record.checkout.location, record.repo, record.checkout.branch, record.checkout.name)`) and add it to the store.

Git state is read through small git-introspection helpers (branch, remote branch, unpushed count, merge conflicts, remote presence, detached head, dirty).

## Syncing

Checkout records are persisted **per mutation, by the commands themselves**: `clone` writes a record when a checkout is created (`saveCheckoutRecord(config, record.name, record)`), `cloneIfMissing` updates the branch after cloning, and `branch` saves the new branch after switching. There is no global sync step — the store is in-memory only and is discarded at the end of the invocation. `saveCheckoutRecord` renders the checkout record template (`{{ name }}`, `{{ repository }}`, `{{ location }}`, `{{ branch }}`) to `{records.checkouts.path}/{name lowercased, spaces → dashes}.art`.
