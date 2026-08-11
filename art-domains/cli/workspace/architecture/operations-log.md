# Workspace CLI — Operations Log

The side-effect log of a command invocation.

## OperationsLog

Append-only log of the side effects performed during a command invocation. Created per command; discarded at the end of the invocation (see `index.md` — Execution Model). Its append-only nature means it can be replayed or streamed by a future reactive layer.

| member           | semantics                    |
| ---------------- | ---------------------------- |
| `log(operation)` | append an operation          |
| `all()`          | all operations, in order     |
| `since(ts)`      | operations after a timestamp |
| `latest(n)`      | the last `n` operations      |

## Operation

A single recorded side effect. Operations are typed by kind and carry a success or failure outcome:

- **`operation`** — one of: `clone`, `push`, `publish`, `branch created`, `linked`, `unlink`.
- **`ts`** — timestamp.
- **`checkout`** — the checkout the operation targeted.
- **`outcome`** — `success` or `failure`; failures carry an error.
- **detail** — kind-specific fields (e.g. location for clone, branch for push, package + version for publish) and a `message()` for reporting.

Reports are presented separately — see `reports.md`.
