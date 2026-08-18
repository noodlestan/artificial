# Instructions: load project records from any location

**Plan:** `discover-records`

**Commit.id:** `load-colocated-records`

**Commit.message:** `feat(workspace-cli): load project records from any location`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

## Working Agreements

The plan workflow runs on three working agreements:

1. This instruction is self-contained. Use this file and its mandatory reading; do not rely on session memory.
2. The report is self-contained and must contain evidence, changes, verification, blockers, and feedback.
3. Keep the final chat report terse; the report file carries the full trail.

## Goals

Complete the migration from fixed project-record directories to dynamic, kind-filtered loading, so `repo` can read both legacy centralized records and co-located `_records` records in every checkout.

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

Record baseline failures before changing code.

## Changes

1. Rename the plural collection modules and APIs:
   - `readProjectRecords` → `loadProjectRecords(config, checkoutPath)`.
   - `readNamespaceRecords` → `loadNamespaceRecords(config, checkoutPath)`.
   - `readPackageRecords` → `loadPackageRecords(config, checkoutPath)`.
   - Keep `readProjectRecord`, `readNamespaceRecord`, and `readPackageRecord` as singular file readers.
2. Implement each loader with the same pipeline:
   - call `findRecordFiles(checkoutPath, config.records.pattern)`;
   - pass each file to the corresponding singular reader;
   - ignore `null` results;
   - return typed records.
3. Change `loadProjectGraph` to `loadProjectGraph(config, checkoutPath)` and compose the three dynamic loaders before calling `consolidateProjectGraph`.
4. Update `runRepo` to pass `ctx.config` into `loadProjectGraph`; update every import, direct call, test helper, and test name affected by the loader rename.
5. Preserve compatibility by testing both layouts:
   - legacy: `$checkout/ops/records/projects/*.art`, `$checkout/ops/records/namespaces/*.art`, `$checkout/ops/records/packages/*.art`;
   - co-located: `$checkout/_records/project.art`, `$checkout/{namespace}/_records/namespace.art`, `$checkout/{package}/_records/package.art`.
6. Add ignored decoy records to the graph fixtures and assert they do not create projects, namespaces, or packages.
7. Update documentation to match the implementation:
   - `$PROJECT/art-domains/cli/workspace/_guide.md` records/config sections;
   - `architecture/config.md` final config shape and defaults;
   - `architecture/context-model.md` dynamic discovery and record locations;
   - `architecture/_pseudo.md` signatures and loader flow.
8. Add direct tests to touched loader modules that currently have no test file, and leave no `it.todo()` tests.

## Tests

- `loadProjectRecords`, `loadNamespaceRecords`, and `loadPackageRecords`: dynamic nested discovery, kind filtering, null-reader filtering, missing checkout path, and both record layouts.
- `loadProjectGraph`: accepts config, composes all three loaders, returns the expected graph for co-located records, and preserves warnings for missing linked names.
- `runRepo`: existing command behavior remains intact while project records are loaded from co-located files.
- Cross-kind fixture: repository, checkout, project, namespace, and package records in one recursive tree are routed only to their matching loaders.

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

Run the focused graph and repository command tests, then the full package suite. Confirm `loadProjectGraph` has no hardcoded `ops/records` path and all collection loaders obtain files exclusively through `findRecordFiles`.

## How to Report Back

Render `$PROJECT/art-domains/cli/workspace/_backlog/4-next/plan-discover-records/instructions/load-colocated-records__report.md` with the report template. Include changed files, legacy/co-located fixture evidence, test results, and any compatibility issues.
