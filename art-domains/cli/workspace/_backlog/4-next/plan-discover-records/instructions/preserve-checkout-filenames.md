# Instructions: preserve checkout record filenames

**Plan:** `discover-records`

**Commit.id:** `preserve-checkout-filenames`

**Commit.message:** `refactor(workspace-cli): preserve checkout record filenames`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

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

## Changes

1. Extend `RepositoryCheckoutRecord` with `filename: string`, representing the source record file path. Update the existing `loadCheckoutRecords()` implementation in this commit so each returned record receives the exact path used to read it; do not derive that member from the checkout name.
2. Add an optional `filename` field to the in-memory `Checkout` and copy `record.filename` into it in `hydrateStoreFromRecords`; newly constructed checkouts have no filename.
3. Extract `makeCheckoutFilename(config, data)` at `$PROJECT/art-domains/cli/workspace/src/private/records/checkout/private/makeCheckoutFilename.ts` from the current filename-generation logic. Derive the slug from `data.name`; until the configuration iteration, use the existing checkout path field and preserve filename normalization.
4. Change `saveCheckoutRecord` to the confirmed data-first signature `(config, data, filename?)`: an explicit filename is written directly and an omitted filename uses `makeCheckoutFilename(config, data)`.
   - runtime loaded/update: `saveCheckoutRecord(ctx.config, record.record, record.filename)`;
   - runtime new record: `saveCheckoutRecord(ctx.config, data)`;
   - test with explicit path: `saveCheckoutRecord(config, data, file)`.
5. Update all runtime callers:
   - loaded checkouts use the carried `Checkout.filename` when saving updates;
   - newly cloned/generated checkouts pass no filename and receive the generated destination;
   - every invocation uses `(config, data, filename?)`; no caller continues passing a checkout name or filename in the data position.
6. Update `loadCheckoutRecords`, checkout persistence, and hydration tests to prove the source filename is returned and carried through, explicit filenames are preserved, and new records use the generated filename.

## Tests

- `RepositoryCheckoutRecord` and `Checkout` retain filenames through loading and hydration.
- `makeCheckoutFilename` creates the expected normalized path.
- `saveCheckoutRecord` writes to an explicit filename without adding another extension or moving it.
- `saveCheckoutRecord` generates the current destination when no filename is provided.
- Clone and branch paths use the correct explicit/generated behavior.
- No existing checkout persistence test relies on the old meaning of the `file` parameter.

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

Confirm that a loaded checkout update writes to its original filename and a newly created checkout writes to the configured generated destination. Confirm no call passes a record name into the filename position.

## How to Report Back

Render `$PROJECT/art-domains/cli/workspace/_backlog/4-next/plan-discover-records/instructions/preserve-checkout-filenames__report.md` with the report template. Include the data-first parameter order, changed files, and test evidence.
