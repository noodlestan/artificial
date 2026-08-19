# Plan: Discover Records Dynamically

**ID:** `discover-records`

**Status:** `DRAFT`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

We are currently working on a major reorganization of records across all repositories. The goal is to move from centralized `ops/records/` directories to co-located `_records/` directories next to the resources they describe.

Replace the workspace CLI's fixed `ops/records/{projects,namespaces,packages,repositories,checkouts}` assumptions with recursive `.art` discovery filtered by configurable pattern and optional record kind, and preserving the filenames of existing checkout records so that it can be update and saved in place, and creating new records in a configurable generated destination.

## Scope

This plan is executed in the Artificial repository's Workspace CLI package and changes configuration, record discovery/loading, project-graph construction, persistence of checkout records, and their tests and documentation.

### Workspace

Running on `$WORKSPACE`, managed by `@art-domains/workspace-cli`; the repository checkout is `$PROJECT`.

### Project Repository

- Repository: Artificial — checked out at `$WORKSPACE/repos/artificial-main`; described by `$PROJECT/ops/records/projects/artificial.art`.

### Package

- Package: Workspace CLI — canonical `@art-domains/workspace-cli`; described by `$PROJECT/ops/records/packages/domains-workspace-cli.art`; located at `$PROJECT/art-domains/cli/workspace/`.

## Context

### Sources

- Maintainer note: `$PROJECT/art-domains/cli/workspace/_backlog/_note_from_workspace_architect.md` — requires dynamic `.art` discovery, record-kind filtering, migration compatibility, and prioritisation.
- Workspace parking lot: `$PROJECT/art-domains/cli/workspace/_backlog/_parking-lot.md` — identifies the Workspace CLI as active work and records testing and delivery expectations.
- Workspace architect briefing: `$PROJECT/art-domains/cli/workspace/_backlog/_architect.md` — establishes records as the source of truth and the imperative, rehydratable command model.

### Guides

- `$PROJECT/_guide.md` — repository setup and package verification commands.
- `$PROJECT/art-domains/cli/workspace/_guide.md` — package setup, verification, architecture references, and planning workflow.

### Knowledge

- `$PROJECT/art-domains/cli/workspace/architecture/config.md` — current manifest shape and runtime configuration loading.
- `$PROJECT/art-domains/cli/workspace/architecture/context-model.md` — record kinds, checkout hydration, and project-graph responsibilities.
- `$PROJECT/art-domains/cli/workspace/architecture/_pseudo.md` — current loader and `repo` command contracts to update.
- `$PROJECT/art-domains/cli/workspace/src/private/records/` — current readers/loaders and their test fixtures.

## Decisions and Assumptions

- Final configuration keeps `root.path` and `clone.path` unchanged.
- `records` becomes `{ pattern: string }`, defaulting to `*.art`.
- `records.checkouts.path` moves to top-level `checkouts.path`, and `records.checkouts.template` moves to `checkouts.template`. The simplified test/default destination is `_records/`; `records` is solely about discovery and defaults to `{ pattern: '*.art' }`.
- `RepositoryCheckoutRecord` gains `filename`, containing the discovered record file path. The in-memory `Checkout` carries the optional filename through hydration so updates overwrite the existing record instead of generating a second file.
- `saveCheckoutRecord` uses the confirmed data-first signature `(config, data, filename?)`: loaded records call `saveCheckoutRecord(config, record.record, record.filename)` and new records call `saveCheckoutRecord(config, data)`.
- Required invocation examples are data-first everywhere: runtime updates use `saveCheckoutRecord(ctx.config, record.record, record.filename)`, while new records use `saveCheckoutRecord(ctx.config, data)` and tests with an explicit file use `saveCheckoutRecord(config, data, file)`.
- `findRecordFiles(path, pattern)` is synchronous, matching the existing synchronous record readers/loaders.
- Discovery is recursive. A filename-only pattern such as `*.art` is applied at every depth; path-containing patterns retain their path semantics.
- Discovery uses Node's built-in `globSync` for candidate files and `git check-ignore --no-index --stdin` to filter candidates matched by applicable `.gitignore` rules. A non-Git temporary directory remains usable in unit tests and simply has no Git ignore filtering.
- Record files are filtered by their `#`/`## {Kind}:` heading in the kind-specific reader. A file with no matching kind heading returns `null` and is skipped without becoming a malformed default record.
- Recursive discovery naturally supports both legacy centralized records and co-located `_records` records; no location-specific compatibility branch is added.

## Required Skills

- `write-plan` — planning and instruction generation.
- `render-template` — rendering plan and implementation-instruction files.

## Mandatory Reading

- `$PROJECT/art-domains/cli/workspace/_backlog/_note_from_workspace_architect.md` — source requirements.
- `$PROJECT/art-domains/cli/workspace/architecture/config.md` — configuration contract.
- `$PROJECT/art-domains/cli/workspace/architecture/context-model.md` — record and checkout model.
- `$PROJECT/art-domains/cli/workspace/architecture/_pseudo.md` — loader and command contracts.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan and implementation-instruction definitions.

## Execution Context

Work from `$PROJECT/art-domains/cli/workspace/` for package changes. Run repository-level setup and verification from `$PROJECT/`.

## Setup

From `$PROJECT/`:

```bash
npm ci
npm run ci
```

If the baseline `npm run ci` fails, record the existing failure before implementation and separate it from this plan's verification results.

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

The implementation must also run the workspace CLI tests against both legacy `ops/records` fixtures and co-located `_records` fixtures, including an ignored `.art` file.

## Commits

### `preserve-checkout-filenames` - `DRAFT`

**Commit Message:** `refactor(workspace-cli): preserve checkout record filenames`

**Instructions File:** `plan-discover-records/instructions/preserve-checkout-filenames.md`

**Scope:**

- Add `filename` to `RepositoryCheckoutRecord` and carry it through `hydrateStoreFromRecords` into the in-memory `Checkout`.
- Update `loadCheckoutRecords()` in this first iteration to return the source filename on every loaded `RepositoryCheckoutRecord`, using the actual file path it read rather than regenerating a name.
- Extract `makeCheckoutFilename(config, data)` under `src/private/records/checkout/private/` from the current generated filename logic.
- Change `saveCheckoutRecord` to the data-first signature `saveCheckoutRecord(config, data, filename?)`; use an explicit filename when supplied, otherwise use `makeCheckoutFilename`; update every runtime and test invocation.
- Verify every call site follows the same order: `(config, data, filename?)`; do not retain the old `(config, file-or-name, data)` ordering.
- Ensure loaded records update their original files while new clone/checkout records use the generated destination.
- Add tests for filename preservation, generated filenames, and all updated call sites.

### `discover-record-files` - `DRAFT`

**Commit Message:** `feat(workspace-cli): add configurable record discovery`

**Instructions File:** `plan-discover-records/instructions/discover-record-files.md`

**Scope:**

- Reshape `WorkspaceConfig` and `PartialWorkspaceConfig` to expose top-level `checkouts.path`/`checkouts.template` and `records.pattern`.
- Update `defineConfig`, `loadWorkspaceConfig`, defaults, and configuration tests; default the record pattern to `*.art`.
- Update `src/test/makeConfig.ts` in the same commit to use `checkouts.path: '_records/'` and `records.pattern: '*.art'`; update `$PROJECT/art-domains/cli/workspace/src/private/records/checkout/loadCheckoutRecords.test.ts` and `$PROJECT/art-domains/cli/workspace/src/test/writeProjectRecord.ts` (including its namespace/package fixture writers) to use the simplified co-located fixture values.
- Add `src/private/records/shared/findRecordFiles.ts` and tests for recursive matching, custom patterns, missing paths, and `.gitignore` filtering.
- Refactor `loadRepositoryRecords` and `loadCheckoutRecords` to use `config.records.pattern` and kind-specific readers.
- Change repository and checkout readers to return `null` when their kind heading is absent; preserve valid parsing and missing-field behavior otherwise.
- Update `makeCheckoutFilename` and any remaining checkout persistence references from `config.records.checkouts` to top-level `config.checkouts`.

### `load-colocated-records` - `DRAFT`

**Commit Message:** `feat(workspace-cli): load project records from any location`

**Instructions File:** `plan-discover-records/instructions/load-colocated-records.md`

**Scope:**

- Rename the plural project/namespace/package loader modules and APIs to `loadProjectRecords`, `loadNamespaceRecords`, and `loadPackageRecords`.
- Make each loader accept `(config, checkoutPath)`, discover matching files with `findRecordFiles`, call its singular reader, and filter `null` results.
- Change `loadProjectGraph` to accept `(config, checkoutPath)` and compose the dynamic loaders.
- Update `runRepo` and every affected call site and test.
- Add legacy centralized and co-located fixture coverage, including cross-kind `.art` files and ignored records.
- Update the Workspace CLI guide, configuration reference, context model, and pseudo-code to describe the new configuration and discovery contract.
- Add tests to touched modules that currently lack direct coverage; leave no `it.todo()` tests.

## Follow-ups

- Apply the filename-carrying pattern later to other record kinds that become read/write; currently only checkout records are mutable.
- Consider extracting Git-ignore filtering into a reusable filesystem service if future commands need the same behavior outside record discovery.
- Update workspace-wide domain structures that still document `ops/records` after this package plan lands.

## Feedback

No implementation feedback yet.
