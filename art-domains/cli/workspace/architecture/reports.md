# Workspace CLI — Reports

Commands present their findings and side effects as markdown tables. Reports always show the full table — no collapsing — with a header line (e.g. `Checkout Report:`) and an empty line after the table.

## Checkout Report

The primary status table, presented after every command that reads or mutates checkouts. Ordered by package name.

Columns: `repo`, `location`, `branch`, `states`. `states` is the joined list of issues (e.g. `uncommitted files`, `N commits ahead`) or `clean`.

| repo        | location          | branch | states          |
| ----------- | ----------------- | ------ | --------------- |
| artificial  | repos/artificial  | main   | clean           |
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
