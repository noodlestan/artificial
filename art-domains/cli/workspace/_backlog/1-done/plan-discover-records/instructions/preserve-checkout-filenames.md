# Instructions: preserve checkout record filenames

**Plan:** `discover-records`

**Commit.id:** `preserve-checkout-filenames`

**Commit.message:** `refactor(workspace-cli): preserve checkout record filenames`

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

Preserve the physical filename of every checkout record loaded from disk, while continuing to generate a filename only for newly created checkout records. This prevents update operations from duplicating or relocating existing records.

## Mandatory Reading

- `$PROJECT/art-domains/cli/workspace/_backlog/_note_from_workspace_architect.md`
- `$PROJECT/art-domains/cli/workspace/architecture/context-model.md`
- `$PROJECT/art-domains/cli/workspace/src/private/records/types.ts`
- `$PROJECT/art-domains/cli/workspace/src/private/store/createCheckout.ts`
- `$PROJECT/art-domains/cli/workspace/src/private/store/hydrateStoreFromRecords.ts`
- `$PROJECT/art-domains/cli/workspace/src/private/records/checkout/saveCheckoutRecord.ts`
- `$PROJECT/art-domains/cli/workspace/src/commands/clone/`
- `$PROJECT/art-domains/cli/workspace/src/commands/branch/`
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

Update these architecture files BEFORE making source code changes. These updates document the new signatures and data model so the code changes are consistent with the docs.

### `architecture/context-model.md`

- Add `filename?: string` field to the `Checkout` interface type block.
- Add `filename: string` field to the `RepositoryCheckoutRecord` description (or note it as added).
- Update the `saveCheckoutRecord` signature from `(config, name, record)` to `(config, data, filename?)` — note it stays `async` returning `Promise<string>`.
- Update the "Syncing" section: change `saveCheckoutRecord(config, record.name, record)` to `saveCheckoutRecord(config, record.record, record.filename)` for loaded records, and `saveCheckoutRecord(config, data)` for new records.
- Add `makeCheckoutFilename(config, data)` to the Auxiliary Functions or note its existence under `src/private/records/checkout/private/`.

### `architecture/_pseudo.md`

- Update the `saveCheckoutRecord` pseudo block: change signature from `(config, name, record)` to `(config, data, filename?)`. Show that when `filename` is provided it writes directly; when omitted it calls `makeCheckoutFilename(config, data)`.
- Update the `cloneIfMissing` pseudo block: change `saveCheckoutRecord(ctx.config, rescan.record.name, {...})` to `saveCheckoutRecord(ctx.config, {...})` (new record, no filename).
- Update the `cloneSpecific` pseudo block: change `saveCheckoutRecord(ctx.config, checkout.record.name, checkout.record)` to `saveCheckoutRecord(ctx.config, checkout.record)` (new record).
- Update the `branch` pseudo block: change `saveCheckoutRecord(ctx.config, scanned.record.name, scanned.record)` to `await saveCheckoutRecord(ctx.config, scanned.record, scanned.filename)` (loaded record, uses carried filename).

## Changes

1. Extend `RepositoryCheckoutRecord` with `filename: string`, representing the source record file path. Update the existing `loadCheckoutRecords()` implementation in this commit so each returned record receives the exact path used to read it; do not derive that member from the checkout name.
2. Add an optional `filename` field to the in-memory `Checkout` and copy `record.filename` into it in `hydrateStoreFromRecords`; newly constructed checkouts have no filename.
3. Extract `makeCheckoutFilename(config, data)` at `$PACKAGE/src/private/records/checkout/private/makeCheckoutFilename.ts` from the current filename-generation logic. Derive the slug from `data.name`; until the configuration iteration, use the existing checkout path field and preserve filename normalization.
4. Change `saveCheckoutRecord` to the data-first signature `(config, data, filename?)`. Keep the function `async` and returning `Promise<string>` — the async wrapper is retained for API consistency even though the body uses synchronous I/O. An explicit filename is written directly; an omitted filename uses `makeCheckoutFilename(config, data)`.
   - runtime loaded/update: `await saveCheckoutRecord(ctx.config, record.record, record.filename)`;
   - runtime new record: `await saveCheckoutRecord(ctx.config, data)`;
   - test with explicit path: `await saveCheckoutRecord(config, data, file)`.
5. Update all runtime callers:
   - loaded checkouts use the carried `Checkout.filename` when saving updates;
   - newly cloned/generated checkouts pass no filename and receive the generated destination;
   - every invocation uses `(config, data, filename?)` and retains `await`; no caller continues passing a checkout name or filename in the data position.
6. Update `loadCheckoutRecords`, checkout persistence, and hydration tests to prove the source filename is returned and carried through, explicit filenames are preserved, and new records use the generated filename.

## Tests

The following test files are likely affected by this commit. Update existing tests and add new ones as noted.

### Existing tests to update

- `$PACKAGE/src/private/records/checkout/saveCheckoutRecord.test.ts` — currently calls `await saveCheckoutRecord(config, file, data)` with old arg order. Update to data-first: `await saveCheckoutRecord(config, data, file)`. Add a test for generated filename (no explicit file).
- `$PACKAGE/src/private/records/checkout/loadCheckoutRecords.test.ts` — currently asserts on `{ repo, checkout }` shape. Update to include `filename` in assertions; add a test proving the source file path is returned.
- `$PACKAGE/src/private/records/checkout/readCheckoutRecord.test.ts` — verify still passes after reader changes.
- `$PACKAGE/src/private/store/hydrateStoreFromRecords.ts` — add test proving `Checkout.filename` is populated from `record.filename` for loaded records and absent for new records.
- Callers in `$PACKAGE/src/commands/clone/` and `$PACKAGE/src/commands/branch/` — update any integration-style tests that call `saveCheckoutRecord` to use the new arg order.

### New tests to create

- `$PACKAGE/src/private/records/checkout/private/makeCheckoutFilename.test.ts` — test slug generation from checkout name, normalization, and config path integration.

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

Confirm that a loaded checkout update writes to its original filename and a newly created checkout writes to the configured generated destination. Confirm no call passes a record name into the filename position.

## How to Report Back

Render `$PACKAGE/_backlog/3-now/plan-discover-records/instructions/preserve-checkout-filenames__report.md` with the report template. Include the data-first parameter order, changed files, architecture doc updates, and test evidence.
