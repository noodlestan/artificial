# Instructions: add configurable record discovery

**Plan:** `discover-records`

**Commit.id:** `discover-record-files`

**Commit.message:** `feat(workspace-cli): add configurable record discovery`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

## Path Variables

| Variable     | Resolved Path                        | Purpose                                                   |
| ------------ | ------------------------------------ | --------------------------------------------------------- |
| `$WORKSPACE` | Current workspace root               | workspace managed by `@art-domains/workspace-cli`         |
| `$PROJECT`   | Provided with prompt                 | Checkout of Artificial monorepo (setup, changes, commits) |
| `$PACKAGE`   | `$PROJECT/art-domains/cli/workspace` | `@art-domains/workspace-cli` package                      |

## Working Agreements

The plan workflow runs on three working agreements:

1. This instruction is self-contained. Use this file and its mandatory reading; do not rely on session memory.
2. The report is self-contained and must contain evidence, changes, verification, blockers, and feedback.
3. Keep the final chat report terse; the report file carries the full trail.

## Goals

Introduce the configurable, Git-ignore-aware record-file discovery foundation without changing project-graph loading yet. Make repository/checkout loading ignore unrelated `.art` files by record kind and keep the filename-preserving checkout persistence contract from the preceding iteration.

## Mandatory Reading

- `$PROJECT/art-domains/cli/workspace/_backlog/_note_from_workspace_architect.md`
- `$PROJECT/art-domains/cli/workspace/architecture/config.md`
- `$PROJECT/art-domains/cli/workspace/src/config/types.ts`
- `$PROJECT/art-domains/cli/workspace/src/config/loadWorkspaceConfig.ts`
- `$PROJECT/art-domains/cli/workspace/src/private/records/repository/`
- `$PROJECT/art-domains/cli/workspace/src/private/records/checkout/`
- `$WORKSPACE/.agents/domains/plans/definitions/index.md`

## Setup

From `$PROJECT/`:

```bash
npm ci
npm run ci
```

Record baseline failures before changing code.

## Architecture Doc Changes

Update these architecture files BEFORE making source code changes. Config-related docs only — do NOT update `architecture/context-model.md` or `architecture/_pseudo.md` in this commit (those are claimed by the next commit).

### `architecture/config.md`

- Replace the `WorkspaceConfig` interface block with the new shape:
  ```typescript
  interface WorkspaceConfig {
    root: { path: string };
    clone: { path: string };
    checkouts: { path: string; template: string };
    records: { pattern: string };
  }
  ```
- Replace the `PartialWorkspaceConfig` with the new shape (matching top-level `checkouts` and `records`).
- Update the "Authoring Config" example to use `checkouts: { path: '_records/', template: '...' }` and `records: { pattern: '*.art' }`.
- Update the "Source of Truth" section to reference `_records/` and co-located records.
- Add a note that `records.repositories` and `records.checkouts` have been restructured: checkout persistence moved to top-level `checkouts`, repository records are now discovered dynamically.

### `$PROJECT/art-domains/cli/workspace/_guide.md`

- Update the records/config sections to reflect the new configuration shape and defaults (`checkouts.path`, `checkouts.template`, `records.pattern`).

### Do NOT update

- `architecture/context-model.md` — claimed by `load-colocated-records` commit.
- `architecture/_pseudo.md` — claimed by `load-colocated-records` commit.

## Changes

1. Change the configuration contract:
   - Keep `root.path` and `clone.path`.
   - Move checkout persistence settings to top-level `checkouts.path` and `checkouts.template`; use `_records/` as the simplified test/default checkout destination.
   - Replace `records.repositories` and `records.checkouts` with `records.pattern`.
   - Default `records.pattern` to `*.art`.
   - Update `defineConfig`, runtime defaults, manifest-loading tests, `src/test/makeConfig.ts`, and any affected config consumers in this same commit.
   - Update `src/test/writeCheckoutRecord.ts`, `src/test/writeRepoRecord.ts`, `src/test/writeProjectRecord.ts` (including its namespace/package fixture writers), and `src/private/records/checkout/loadCheckoutRecords.test.ts` to use `_records/` and `*.art` rather than the old centralized test paths.
2. Add `src/private/records/shared/findRecordFiles.ts`:
   - Keep the public function synchronous: `findRecordFiles(path: string, pattern: string, kinds?: string[]): string[]`.
   - Recursively enumerate files with Node `globSync`; normalize a filename-only pattern such as `*.art` so it matches at every depth.
   - Exclude directories and skip `.git` internals.
   - Filter candidates through `git check-ignore --no-index --stdin` from the search root so ignored tracked and untracked candidates are excluded. If the search root is not a Git worktree, return the glob matches without Git filtering.
   - Return stable, deterministic absolute paths. Missing paths return an empty array.
3. Refactor `loadRepositoryRecords(config)` and make `loadCheckoutRecords` async:
   - `loadRepositoryRecords` becomes async: `loadRepositoryRecords(config): Promise<RepositoryRecord[]>`.
   - `loadCheckoutRecords` becomes async: `loadCheckoutRecords(config, repos): Promise<RepositoryCheckoutRecord[]>`.
   - Both call `findRecordFiles(config.root.path, config.records.pattern, [{kind}]`.
   - Pass every candidate to the appropriate singular reader.
   - Filter `null` values; checkout loading must continue resolving `record.repository` against the loaded repository records.
   - Update all callers of both loaders to `await` the result.
4. Change `readRepositoryRecord` and `readCheckoutRecord` to return `null` when their kind heading is absent. Keep their valid field parsing and existing defaults for missing optional/required fields after a valid kind heading.
5. Update `makeCheckoutFilename` and the existing checkout persistence tests to read `config.checkouts.template` and write to `config.checkouts.path`; preserve explicit filename behavior from the preceding iteration and use filename generation only for new records.

## Tests

The following test files are likely affected by this commit. Update existing tests and add new ones as noted.

### Existing tests to update

- `$PACKAGE/src/config/defineConfig.test.ts` — update config shape assertions to new `checkouts.*` + `records.pattern` structure.
- `$PACKAGE/src/config/loadWorkspaceConfig.test.ts` — update config loading tests for new shape.
- `$PACKAGE/src/test/makeConfig.ts` — change to use `checkouts: { path: '_records/', template: '...' }` and `records: { pattern: '*.art' }`.
- `$PACKAGE/src/private/records/checkout/loadCheckoutRecords.test.ts` — update `makeMockConfig` to use new config shape; make test async (add `await`); update fixture paths from `ops/records/checkouts` to `_records/`.
- `$PACKAGE/src/test/writeCheckoutRecord.ts` — update fixture paths.
- `$PACKAGE/src/test/writeRepoRecord.ts` — update fixture paths.
- `$PACKAGE/src/test/writeProjectRecord.ts` — update fixture paths for namespace/package writers.
- All callers of `loadRepositoryRecords` and `loadCheckoutRecords` — add `await`.

### New tests to create

- `$PACKAGE/src/private/records/shared/findRecordFiles.test.ts` — test recursive default pattern (`*.art`), custom pattern, missing path (returns `[]`), `.gitignore` exclusion, deterministic output ordering. kinds filtering.

### Verification

From `$PACKAGE/`:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

From `$PROJECT/`:

```bash
npm run ci
```

## Final Verification

Confirm no source still reads `config.records.repositories` or `config.records.checkouts` after this slice, except the deliberate migration compatibility references documented in tests. Confirm the new helper is the only filesystem discovery path used by repository and checkout loaders and that a loaded checkout retains its filename.

## How to Report Back

Render `$PACKAGE/_backlog/3-now/plan-discover-records/instructions/discover-record-files__report.md` with the report template. Include changed files, architecture doc updates, test evidence, baseline failures, and any ambiguity about the final checkout configuration shape.
