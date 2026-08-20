# Sub-Agent REPORT (#producer)

**Plan:** `discover-records`

**Instruction Id:** `preserve-checkout-filenames`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File                                                                | Change                                                                                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/private/records/types.ts`                                      | Added `filename: string` to `RepositoryCheckoutRecord` interface                                                                                                                           |
| `src/private/store/types.ts`                                        | Added `filename?: string` to `Checkout` interface                                                                                                                                          |
| `src/private/records/checkout/private/makeCheckoutFilename.ts`      | **New.** Extracted filename generation: derives slug from `data.name`, returns `{checkouts.path}/{slug}.art`                                                                               |
| `src/private/records/checkout/private/makeCheckoutFilename.test.ts` | **New.** Tests slug derivation, space normalisation, lowercasing, and config path integration                                                                                              |
| `src/private/records/checkout/saveCheckoutRecord.ts`                | Changed signature from `(config, file, data)` to `(config, data, filename?)`. Uses explicit filename when provided, otherwise calls `makeCheckoutFilename`                                 |
| `src/private/records/checkout/saveCheckoutRecord.test.ts`           | Updated to data-first arg order; added test for generated filename (no explicit file)                                                                                                      |
| `src/private/records/checkout/loadCheckoutRecords.ts`               | Each returned `RepositoryCheckoutRecord` now receives the exact file path used to read it as `filename`                                                                                    |
| `src/private/records/checkout/loadCheckoutRecords.test.ts`          | Assertions now include `filename` field; added test proving source file path is returned                                                                                                   |
| `src/private/records/checkout/readCheckoutRecord.test.ts`           | Updated `saveCheckoutRecord` call to data-first arg order                                                                                                                                  |
| `src/private/store/hydrateStoreFromRecords.ts`                      | Copies `record.filename` into the checkout via spread                                                                                                                                      |
| `src/private/store/hydrateStoreFromRecords.test.ts`                 | Added tests for filename propagation to checkout and orphan records                                                                                                                        |
| `src/private/commands/doClone.ts`                                   | Updated `saveCheckoutRecord` call to data-first, no filename (new record)                                                                                                                  |
| `src/private/commands/checkouts/doBranchCheckout.ts`                | Updated `saveCheckoutRecord` call to data-first, passes `updated.filename` (loaded record)                                                                                                 |
| `src/commands/clone/cloneSpecific.ts`                               | Updated `saveCheckoutRecord` call to data-first, no filename (new record)                                                                                                                  |
| `architecture/context-model.md`                                     | Added `filename?: string` to `Checkout`, documented `RepositoryCheckoutRecord` with `filename`, updated Syncing section with data-first signature and `makeCheckoutFilename`               |
| `architecture/_pseudo.md`                                           | Updated `saveCheckoutRecord` pseudo to `(config, data, filename?)`; updated `cloneIfMissing`, `cloneSpecific`, and `branch` pseudo blocks; added `makeCheckoutFilename` auxiliary function |

### Parameter Order

All callers now use `(config, data, filename?)`:

- **Loaded-record updates** (branch, cloneIfMissing): `await saveCheckoutRecord(ctx.config, record.record, record.filename)`
- **New-record creation** (clone, cloneSpecific): `await saveCheckoutRecord(ctx.config, data)`
- **Tests with explicit path**: `await saveCheckoutRecord(config, data, file)`

No caller passes a record name or filename in the data position.

## Verification

### From `$PACKAGE/`

```
npm run lint:fix   → passed
npm run lint       → passed (prettier + eslint + tsc --noEmit)
npm run build      → passed
npm run test       → 63 test files, 208 tests passed
```

### From `$PROJECT/`

```
npm run ci         → 63 test files, 208 tests passed, 12 tasks successful
```

### Final Confirmation

- A loaded checkout update writes to its original filename (carried via `Checkout.filename`).
- A newly created checkout writes to the generated destination (`makeCheckoutFilename`).
- No call passes a record name into the filename position.

## Blockers (if any)

None.

## Feedback

### For the planner

The instruction was clear and self-contained. The data-first signature convention was well-specified with explicit caller examples.

### For the technical writers

Architecture docs (`context-model.md` and `_pseudo.md`) were updated in this commit as prescribed. The `RepositoryCheckoutRecord` description was added inline since it was previously undocumented.

### For the crew

The new pattern is: always carry `filename` from load through hydration into `Checkout`, and always pass it back on save. New records have no filename and use `makeCheckoutFilename`.
