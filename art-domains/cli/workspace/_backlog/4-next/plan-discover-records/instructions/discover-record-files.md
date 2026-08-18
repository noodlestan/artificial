# Instructions: add configurable record discovery

**Plan:** `discover-records`

**Commit.id:** `discover-record-files`

**Commit.message:** `feat(workspace-cli): add configurable record discovery`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

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

## Changes

1. Change the configuration contract:
   - Keep `root.path` and `clone.path`.
   - Move checkout persistence settings to top-level `checkouts.path` and `checkouts.template`; use `_records/` as the simplified test/default checkout destination.
   - Replace `records.repositories` and `records.checkouts` with `records.pattern`.
   - Default `records.pattern` to `*.art`.
   - Update `defineConfig`, runtime defaults, manifest-loading tests, `src/test/makeConfig.ts`, and any affected config consumers in this same commit.
   - Update `src/test/writeCheckoutRecord.ts`, `src/test/writeRepoRecord.ts`, `src/test/writeProjectRecord.ts` (including its namespace/package fixture writers), and `src/private/records/checkout/loadCheckoutRecords.test.ts` to use `_records/` and `*.art` rather than the old centralized test paths.
2. Add `src/private/records/shared/findRecordFiles.ts`:
   - Keep the public function synchronous: `findRecordFiles(path: string, pattern: string): string[]`.
   - Recursively enumerate files with Node `globSync`; normalize a filename-only pattern such as `*.art` so it matches at every depth.
   - Exclude directories and skip `.git` internals.
   - Filter candidates through `git check-ignore --no-index --stdin` from the search root so ignored tracked and untracked candidates are excluded. If the search root is not a Git worktree, return the glob matches without Git filtering.
   - Return stable, deterministic absolute paths. Missing paths return an empty array.
3. Refactor `loadRepositoryRecords(config)` and `loadCheckoutRecords(config, repos)`:
   - Call `findRecordFiles(config.root.path, config.records.pattern)`.
   - Pass every candidate to the appropriate singular reader.
   - Filter `null` values; checkout loading must continue resolving `record.repository` against the loaded repository records.
4. Change `readRepositoryRecord` and `readCheckoutRecord` to return `null` when their kind heading is absent. Keep their valid field parsing and existing defaults for missing optional/required fields after a valid kind heading.
5. Update `makeCheckoutFilename` and the existing checkout persistence tests to read `config.checkouts.template` and write to `config.checkouts.path`; preserve explicit filename behavior from the preceding iteration and use filename generation only for new records.

## Tests

- `findRecordFiles`: recursive default pattern, custom pattern, missing path, `.gitignore` exclusion, and deterministic output.
- Config: default pattern, top-level checkout settings, explicit manifest loading, and partial config behavior.
- Readers: `null` for wrong-kind content/missing kind heading; valid repository and checkout records still parse.
- Loaders: mixed `.art` files are filtered by kind; repository and checkout records load from nested co-located locations; ignored `.art` files are skipped.
- Checkout persistence: updated config shape still loads the template, writes generated records under `_records/`, and preserves explicit filenames.

## Verification

From `$PROJECT/art-domains/cli/workspace/`:

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

Render `$PROJECT/art-domains/cli/workspace/_backlog/4-next/plan-discover-records/instructions/discover-record-files__report.md` with the report template. Include changed files, test evidence, baseline failures, and any ambiguity about the final checkout configuration shape.
