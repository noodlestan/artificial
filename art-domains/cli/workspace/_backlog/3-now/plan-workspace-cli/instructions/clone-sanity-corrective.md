# Instruction: Clone/Sanity Corrective

**Plan:** `workspace-cli`

**Commit:** `clone-sanity-corrective`

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `clone-sanity-corrective`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Fix lint errors, build failures, and 3 correctness issues found during manual testing of the refactored clone/sanity commands.

## Mandatory Reading

- `ops/_pseudo.md` — source of truth for data structures and flows
- `ops/_architect.md` — definitions, constraints, use cases
- `ops/_adr/execution-model.art` — execution model

## Verification Steps

**Start here — do not interpret issues until lint is clean:**

1. Execute `npm run lint:fix` in the workspace CLI package (`repos/artificial/art-domains/cli/workspace`)
2. Execute `npm run lint` — fix any remaining errors manually until lint passes clean
3. Execute `npm run build` — fix any TypeScript or build errors until build succeeds
4. Execute `npm run test` — fix any test failures (other than keeping "this exists" assertions that validate the new structure)
5. Execute `npm run ci` — full CI pass
6. Execute `npm run test:coverage` — verify coverage thresholds (70/60/70/70)

## Issues to Fix

### 1. Lint errors

`npm run lint` reports many errors after the refactor. Run `npm run lint:fix` first to auto-fix formatting and import order. Then fix remaining errors manually (unused imports, type issues, etc.).

### 2. Build failures

`npm run build` fails after the refactor. Fix TypeScript compilation errors — likely missing exports, circular imports, or type mismatches introduced during the restructure.

### 3. Push log wrong branch

**Symptom:** `art-workspace sanity --auto` logs `Purrception | pushed | to origin/main` when the actual branch is `tmp-test2`.

**Fix:** In the sanity push loop, the log call uses a stale branch reference. Ensure `checkout.branch` reflects the scanned state, not a cached value. The log detail should be `"to origin/" + checkout.branch` where `checkout.branch` is the value set by `scanCheckout`.

### 4. Custom location ignored

**Symptom:** `art-workspace clone Purrception custom/purrception-test` silently ignores the target when a checkout for `Purrception` already exists.

**Fix:** When `target` is provided and a checkout already exists at a different location, either:
- Option A: Move the checkout (update record + rename directory)
- Option B: Refuse with an error message: "Checkout already exists at {existing}. Remove it first or use a different name."

Choose whichever is simpler and safer. Option B is recommended — moving checkouts is risky.

### 5. Lossy record roundtrip

**Symptom:** `ops/records/checkouts/*.art` lose the `**Repository:**` field after a CLI roundtrip (clone/sanity reads and rewrites the record).

**Fix:** `saveCheckoutRecord` must preserve all fields from the loaded `CheckoutRecord`. The record template or renderer must include the `**Repository:**` field. Check:
- The checkout record template at `.agents/domains/workspace/templates/checkout.art.njk`
- The `saveCheckoutRecord` function in `src/private/records/checkout-record.ts`
- Ensure the `repository` field is read from disk and written back

## Rules

- RULE: Run `npm run lint:fix` before attempting to interpret any lint issues.
- RULE: Fix lint completely before attempting to fix build.
- RULE: Fix build completely before attempting to fix test failures.
- RULE: Do not rewrite logic — only fix the specific issues listed above.
- RULE: All 67 existing tests must still pass after fixes.
- RULE: Coverage must remain above thresholds.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-workspace-cli/instructions/clone-sanity-corrective__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `clone-sanity-corrective`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
