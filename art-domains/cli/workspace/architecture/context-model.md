# Workspace CLI — Context

The per-command data model of the workspace CLI: `WorkspaceContext`, `CheckoutStore`, `Checkout`, the records they are built from, and the functions that scan and sync them.

## WorkspaceContext

Per-command invocation context. Passed as a single object to all routines — never destructured. It is the designed shape of the imperative execution model (see `index.md` — Execution Model, and `records/adr/execution-model.art`).

```typescript
interface WorkspaceContext {
  config: WorkspaceConfig; // loaded from .art-workspace.mts
  root: string; // workspace root (process.cwd() at invocation)
  store: CheckoutStore; // in-memory checkout state
  log: OperationsLog; // append-only side-effect log
}
```

## CheckoutStore

In-memory state of all known checkouts. Created per command invocation and hydrated from disk records. Keys are lowercase repo names.

| member                        | semantics                                                           |
| ----------------------------- | ------------------------------------------------------------------- |
| `addCheckout(repo, location)` | create a checkout in the store (records synced separately)          |
| `loadExistingCheckouts()`     | hydrate the store from checkout records on disk                     |
| `findCheckout(name)`          | case-insensitive lookup; strips package scope (`@ns/name` → `name`) |
| `getCheckout(name)`           | exact lowercase lookup                                              |
| `setCheckout(checkout)`       | replace a checkout in the store by name                             |
| `getAllCheckouts()`           | all checkouts                                                       |
| `markExtraneous(location)`    | create a checkout without persisting (extraneous marker)            |
| `getExtraneous()`             | checkouts marked extraneous                                         |
| `syncRecords()`               | persist store state to disk records (designed; stubbed)             |

## Checkout

Individual repo checkout state. State fields are populated by `scanCheckout` reading git from the filesystem; `repo` and `record` come from the store.

```typescript
interface Checkout {
  repo: RepositoryRecord;
  record: CheckoutRecord; // name, location, branch
  exists: boolean;
  branch: string; // scanned branch (record default before scan)
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
- **`CheckoutRecord`** — checkout state: name, location, branch. Persisted in `ops/records/checkouts/{repo}.art`. Workspace-local state, owned by the CLI commands (see `records/adr/cli.art` — "Checkouts as CLI-Managed Records — Structure: Checkout").
- **`WorkspaceRecord`** — the workspace itself and its known repositories, in `ops/records/workspace.art`.

Repo identity is by name, case-insensitive; package names are interchangeable with repo names. The canonical form is the record heading (`## Repository: Artificial`).

## Scanning

- **`scanCheckout(ctx, checkout)`** — read git state from the filesystem, create a new checkout instance with updated state, and set it in the store (no direct mutation). Returns the new checkout.
- **`scanAllCheckouts(ctx)`** — scan every checkout in the store.
- **`scanExtraneousCheckouts(ctx)`** — scan directories under the clone path that have no matching checkout record and mark them extraneous.

Git state is read through small git-introspection helpers (branch, remote branch, unpushed count, merge conflicts, remote presence, detached head, dirty).

## Syncing

**`syncRecords()`** persists the store state back to disk checkout records. It is explicit, not automatic — a reactive layer can call it on debounce instead of per-mutation. Currently stubbed (designed, not yet implemented).
