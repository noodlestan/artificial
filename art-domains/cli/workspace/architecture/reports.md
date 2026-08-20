# Workspace CLI — Reports

Commands present their findings and side effects as markdown tables. Reports always show the full table — no collapsing — with a header line (e.g. `Checkouts:`) and an empty line after the table.

## Workspace Report

The workspace root status table, presented before the Checkout Report by every command that reads or mutates checkouts. Always shows 1 row for the workspace root.

Columns: `repo`, `location`, `branch`, `states`. `states` is the joined list of issues (e.g. `uncommitted files`, `1 commit behind`) or `-` when clean.

| repo | location | branch | states          |
| ---- | -------- | ------ | --------------- |
| -    | .        | main   | 1 commit behind |

## Checkout Report

The primary status table, presented after every command that reads or mutates checkouts. Ordered by repo name; checkouts without a remote last.

Columns: `repo`, `location`, `branch`, `states`. `states` is the joined list of issues (e.g. `uncommitted files`, `2 commits ahead`) or `-` when clean. `location` is displayed relative to the checkouts path (e.g. `repos/artificial`).

| repo        | location          | branch | states          |
| ----------- | ----------------- | ------ | --------------- |
| artificial  | repos/artificial  | main   | -               |
| purrception | repos/purrception | feat/x | 2 commits ahead |

## Operations Report

Appended when a command performs side effects; omitted when nothing was done. Each operation row shows its outcome (success/failure), repo, operation, and message.

Columns: ``, `repo`, `operation`, `message`.

|     | repo        | operation | detail                       |
| --- | ----------- | --------- | ---------------------------- |
| 🟢  | artificial  | clone     | cloned to repos/artificial   |
| 🟢  | purrception | push      | 2 commits to origin/feat/x   |
| 🔴  | no-comply   | publish   | @no-comply/core@1.2.3 failed |

## Extraneous Report

Directories under the clone path with no matching checkout record. Presented by `clone` (no-args mode) and `sanity`; omitted when none found.

Columns: `directory`, `branch`, `states`.

| directory      | branch  | states            |
| -------------- | ------- | ----------------- |
| my-test-clone  | main    | clean             |
| old-experiment | feature | uncommitted files |

## Repository State Report

Presented by `repo` for each checkout, followed immediately by its matching Package State Report. Shows the checkout's repository name, current branch, and any issues (e.g. `no project records`).

Columns: `Repository:`, `Branch:`, `States:` (when issues exist).

```
Repository: Artificial
Branch: main
States: no project records
```

## Package State Report

Presented by `repo` immediately after the matching Repository State Report for each checkout. Lists each package's current version (from `package.json`), last published version (from `npm info`), and states. When multiple checkouts exist, each checkout produces its own Repository State Report + Package State Report pair.

Columns: `canonical name`, `version`, `published`, `directory`, `states`.

| canonical name        | version | published | directory                          | states          |
| --------------------- | ------- | --------- | ---------------------------------- | --------------- |
| @artisans/art-mantras | 0.0.1   | 0.0.1     | repos/artificial/artisans/apps/... | clean           |
| @artisans/art-doom    | 1.2.0   | unknown   | repos/artificial/artisans/apps/... | npm info failed |

## Symlink Report

Presented by `links`. Lists symlinked packages found in the workspace root `node_modules` and known repository project `node_modules`. Omitted when no symlinks found.

Columns: `package`, `location`.

| package             | location       |
| ------------------- | -------------- |
| @no-comply/core     | purrception    |
| @noodlestan/esbuild | workspace root |
