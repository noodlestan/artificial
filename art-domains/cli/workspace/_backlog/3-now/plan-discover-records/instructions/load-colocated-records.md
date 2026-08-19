# Instructions: load project records from any location

**Plan:** `discover-records`

**Commit.id:** `load-colocated-records`

**Commit.message:** `feat(workspace-cli): load project records from any location`

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

Complete the migration from fixed project-record directories to dynamic, kind-filtered loading, so `repo` can read both legacy centralized records and co-located `_records` records in every checkout.

## Pre-existing Test Failures (from `discover-record-files` commit)

**9 test files, 44 tests are currently failing.** These failures were introduced by the preceding commit and MUST be fixed as part of this instruction. They are NOT pre-existing baseline failures.

| Test file                  | Failures | Root cause                                                                                                    |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `loadProjectGraph.test.ts` | 10       | Mock writers now write to `_records/` but `loadProjectGraph` still reads `ops/records/` — this commit's scope |
| `runClone.test.ts`         | 4        | Mock repo + checkout records collide when sharing same slug name in `_records/`                               |
| `cloneSpecific.test.ts`    | 1        | Same slug collision: repo `Foo` and checkout `Foo` both write to `_records/foo.art`                           |
| `runSanity.test.ts`        | 1        | Cascading from same collision; checkout overwrites repo in `_records/`                                        |
| `runBranch.test.ts`        | 4        | Cascading from same collision; `getCheckoutOfRepo` returns undefined                                          |
| `runPush.test.ts`          | 4        | Cascading from same collision                                                                                 |
| `runPull.test.ts`          | 4        | Cascading from same collision                                                                                 |
| `runSync.test.ts`          | 4        | Cascading from same collision                                                                                 |
| `runRepo.test.ts`          | 2        | Cascading from same collision                                                                                 |

**Root cause:** `writeRepoMockRecord` and `writeCheckoutMockRecord` both write to `_records/{slug}.art`. When tests create both a repo and checkout record with the same name (e.g., `Foo`), the checkout record overwrites the repo record, so `loadRepositoryRecords` finds no matching repo records and all downstream command tests fail.

**Fix strategy:** Use distinct mock names for repo and checkout records in every test that creates both. For example, use `Foo-repo` and `Foo-checkout` as mock names, or prefix checkout names. This is the minimal fix — it does NOT require separate directories.

## Mandatory Reading

- `$PROJECT/art-domains/cli/workspace/_backlog/_note_from_workspace_architect.md`
- `$PROJECT/art-domains/cli/workspace/architecture/context-model.md`
- `$PROJECT/art-domains/cli/workspace/architecture/_pseudo.md`
- `$PROJECT/art-domains/cli/workspace/src/private/records/projectGraph/`
- `$PROJECT/art-domains/cli/workspace/src/private/records/project/`
- `$PROJECT/art-domains/cli/workspace/src/private/records/namespace/`
- `$PROJECT/art-domains/cli/workspace/src/private/records/package/`
- `$PROJECT/art-domains/cli/workspace/src/commands/repo/runRepo.ts`
- `$WORKSPACE/.agents/domains/plans/definitions/index.md`

## Setup

From `$PROJECT/`:

```bash
npm ci
npm run ci
```

Record baseline failures before changing code. **Expect 9 failing test files (44 tests) as documented above — these are this commit's responsibility to fix.**

### Test-driven approach

Fix the mock name collision FIRST, before implementing the loader changes. Use focused test runs to drive and validate each step:

```bash
# Fix the slug collision — run only affected tests to validate the fix:
npx vitest run src/commands/clone/runClone.test.ts
npx vitest run src/commands/clone/cloneSpecific.test.ts
npx vitest run src/commands/sanity/runSanity.test.ts
npx vitest run src/commands/branch/runBranch.test.ts
npx vitest run src/commands/push/runPush.test.ts
npx vitest run src/commands/pull/runPull.test.ts
npx vitest run src/commands/sync/runSync.test.ts
npx vitest run src/commands/repo/runRepo.test.ts

# Then fix loadProjectGraph — run only the graph test:
npx vitest run src/private/records/projectGraph/loadProjectGraph.test.ts

# After all fixes pass, run the full suite:
npm run test
```

Run focused tests after each change to validate incrementally. Do NOT wait until the end to discover regressions.

## Architecture Doc Changes

Update these architecture files BEFORE making source code changes. Config-related docs (`architecture/config.md`, `_guide.md` records/config sections) were already updated in the preceding commit — do NOT repeat those changes.

### `architecture/context-model.md`

- Update the "Reader Organization" directory tree to match the actual `src/private/records/` structure. Add `shared/findRecordFiles.ts` under `shared/`. Note `checkout/private/makeCheckoutFilename.ts` if it exists from the preceding commit.
- Update `loadProjectGraph` signature: change from `loadProjectGraph(checkoutPath)` to `loadProjectGraph(config, checkoutPath): Promise<ProjectGraph>` — note it is now async.
- Update `loadCheckoutRecords` to show it is async: `loadCheckoutRecords(config, repos): Promise<RepositoryCheckoutRecord[]>`.
- Update `loadRepositoryRecords` to show it is async: `loadRepositoryRecords(config): Promise<RepositoryRecord[]>`.
- Update `saveCheckoutRecord` signature to data-first: `saveCheckoutRecord(config, data, filename?)`.
- Add `filename?: string` to `RepositoryCheckoutRecord` and `filename?: string` to `Checkout` interface.
- Update the "Syncing" section: `saveCheckoutRecord(config, record.record, record.filename)` for loaded records; `saveCheckoutRecord(config, data)` for new records.
- Review `hydrateStoreFromRecords` — it now copies `record.filename` into `Checkout.filename`.

### `architecture/_pseudo.md`

- Update `hydrate` pseudo block: note that `loadRepositoryRecords` and `loadCheckoutRecords` are now async and must be awaited.
- Update `loadRepositoryRecords` pseudo block: change from reading `config.records.repositories.path` to using `findRecordFiles(config.root.path, config.records.pattern)`. Show it returns `Promise`.
- Update `loadCheckoutRecords` pseudo block: change from reading `config.records.checkouts.path` to using `findRecordFiles(config.root.path, config.records.pattern)`. Show it returns `Promise`. Add `filename` to the returned record shape.
- Update `saveCheckoutRecord` pseudo block: change to data-first `(config, data, filename?)`.
- Update `readProjectRecords` pseudo block: replace hardcoded `ops/records/{projects|namespaces|packages}` with dynamic `findRecordFiles(checkoutPath, config.records.pattern)` + kind filtering.
- Update `cloneIfMissing` pseudo: `saveCheckoutRecord` calls to data-first.
- Update `cloneSpecific` pseudo: `saveCheckoutRecord` calls to data-first.
- Update `branch` pseudo: `saveCheckoutRecord` calls to data-first with `filename`.
- Add `resolveCheckoutByName` pseudo block if not already present.
- Review `pull`, `push`, `sync` pseudo-code against actual implementations in `src/commands/pull/`, `src/commands/push/`, `src/commands/sync/`.
- Update operation kind factories list to include `createPullSuccess`, `createPullFailure`.

## Changes

0. **Fix mock name collision first.** Update `src/test/helpers/records/writeRepoMockRecord.ts` and `src/test/helpers/records/writeCheckoutMockRecord.ts` (and any callers that pass the same name to both) to use distinct names. The simplest approach: suffix checkout mock names with `-checkout` or use a different base name. Run the 8 affected command test files to confirm the collision is resolved before proceeding.
1. Rename the plural collection modules and APIs — all become async, returning a Promise:
   - `readProjectRecords` → `loadProjectRecords(config, checkoutPath): Promise<ProjectRecord[]>`.
   - `readNamespaceRecords` → `loadNamespaceRecords(config, checkoutPath): Promise<NamespaceRecord[]>`.
   - `readPackageRecords` → `loadPackageRecords(config, checkoutPath): Promise<PackageRecord[]>`.
   - Keep `readProjectRecord`, `readNamespaceRecord`, and `readPackageRecord` as synchronous singular file readers.
2. Implement each loader with the same pipeline:
   - call `findRecordFiles(checkoutPath, config.records.pattern)`;
   - pass each file to the corresponding singular reader;
   - ignore `null` results;
   - return typed records.
3. Change `loadProjectGraph` to async: `loadProjectGraph(config, checkoutPath): Promise<ProjectGraph>`. Compose the three async dynamic loaders with `await` before calling `consolidateProjectGraph`.
4. Update `runRepo` to `await loadProjectGraph(ctx.config, checkoutPath)`; update every import, direct call, test helper, and test name affected by the loader rename.
5. Preserve compatibility by testing both layouts:
   - legacy: `$checkout/ops/records/projects/*.art`, `$checkout/ops/records/namespaces/*.art`, `$checkout/ops/records/packages/*.art`;
   - co-located: `$checkout/_records/project.art`, `$checkout/{namespace}/_records/namespace.art`, `$checkout/{package}/_records/package.art`.
6. Add ignored decoy records to the graph fixtures and assert they do not create projects, namespaces, or packages.

## Tests

The following test files are likely affected by this commit. Update existing tests and add new ones as noted.

### Existing tests to update

- `$PACKAGE/src/test/helpers/records/writeRepoMockRecord.ts` — update mock names to be distinct from checkout mock names (if not already done in step 0).
- `$PACKAGE/src/test/helpers/records/writeCheckoutMockRecord.ts` — update mock names to be distinct from repo mock names (if not already done in step 0).
- `$PACKAGE/src/commands/clone/runClone.test.ts` — verify passes after mock name fix; add co-located `_records/` test if missing.
- `$PACKAGE/src/commands/clone/cloneSpecific.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/commands/sanity/runSanity.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/commands/branch/runBranch.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/commands/push/runPush.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/commands/pull/runPull.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/commands/sync/runSync.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/commands/repo/runRepo.test.ts` — verify passes after mock name fix.
- `$PACKAGE/src/private/records/projectGraph/loadProjectGraph.test.ts` — currently calls `loadProjectGraph(tempDir)` synchronously. Make async: `const graph = await loadProjectGraph(config, tempDir)`. Add tests for co-located `_records/` layout. Add tests for ignored `.art` files. Run this file in isolation after each change to validate incrementally.
- `$PACKAGE/src/commands/repo/runRepo.ts` callers — update any tests that call `loadProjectGraph` to await it.
- `$PACKAGE/src/private/records/project/readProjectRecords.ts` callers — update imports to new `loadProjectRecords` name.
- `$PACKAGE/src/private/records/namespace/readNamespaceRecords.ts` callers — update imports to new `loadNamespaceRecords` name.
- `$PACKAGE/src/private/records/package/readPackageRecords.ts` callers — update imports to new `loadPackageRecords` name.

### New tests to create

- If no direct test file exists for `loadProjectRecords`, `loadNamespaceRecords`, or `loadPackageRecords`: create test files for each, covering dynamic nested discovery, kind filtering, null-reader filtering, missing checkout path, and both record layouts.
- Add a cross-kind fixture test: repository, checkout, project, namespace, and package `.art` files in one recursive tree — assert each loader only picks up its matching kind.

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

Run the focused graph and repository command tests first:

```bash
npx vitest run src/private/records/projectGraph/loadProjectGraph.test.ts
npx vitest run src/commands/clone/runClone.test.ts
npx vitest run src/commands/repo/runRepo.test.ts
```

Then run the full package suite. Confirm:

- All 9 previously-failing test files now pass (0 failures from the slug collision).
- `loadProjectGraph` has no hardcoded `ops/records` path.
- All collection loaders obtain files exclusively through `findRecordFiles`.
- No test file still references the old `_records/{slug}.art` collision pattern.

## How to Report Back

Render `$PACKAGE/_backlog/3-now/plan-discover-records/instructions/load-colocated-records__report.md` with the report template. Include changed files, architecture doc updates, legacy/co-located fixture evidence, test results, and any compatibility issues.
