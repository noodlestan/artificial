# Sub-Agent REPORT (#producer)

**Plan:** `fix-reported-bugs`

**Instruction Id:** `fix-sanity-extraneous-known-checkouts`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

- `src/commands/sanity/private/scanExtraneousCheckouts.ts` — added `CheckoutStore` parameter and filtered known locations before adding to extraneous list.
- `src/commands/sanity/runSanity.ts` — updated call to `scanExtraneousCheckouts` to pass `ctx.store`.
- `src/commands/sanity/private/scanExtraneousCheckouts.test.ts` — added test for known checkout filtering; updated existing test to pass store.

## Blockers (if any)

None.

## Feedback

Not requested.
