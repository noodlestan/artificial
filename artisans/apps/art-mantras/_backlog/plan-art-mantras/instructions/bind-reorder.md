# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `bind-reorder`

These are self-contained instructions for the art-mantras step 7 delegation.

- RULE: If a mandatory reading file cannot be read, REPORT A BLOCKER and stop.

## Working Agreements

Work from the `checkouts/artificial` checkout root. Repository-relative paths in this instruction begin at that root. Modify only the application file named below; do not modify the architecture, pseudo, WIP, guide, module, plan, or report files. Commit successful work with `git commit`.Using `--no-verify` to bypass pre-commit hooks is forbidden.

## Goals

Implement race step 7 — **use case: reorder (^ / v)**. A strong word's up/down control must move it one position within that slot's `strong[]` only, then re-render the strongs section. Promote and shuffle must continue working; all later intents remain inert.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md`
- `.agents/domains/plans/files/index.md`
- `.agents/domains/plans/templates/instructions-report.tart`
- `_backlog/plan-art-mantras/plan.md`
- `artisans/apps/art-mantras/_guide.md`
- `artisans/apps/art-mantras/_architect.md`
- `artisans/apps/art-mantras/_pseudo.md`
- `artisans/apps/art-mantras/_wip.md`

- RULE: Follow links under `## Mandatory Reading` in the listed files.
- RULE: Do not substitute `_plan.md` for `_architect.md`; the rename is committed in the checkout.

## Changes

Modify `artisans/apps/art-mantras/src/app.js` only:

- Extend `createStore(data)` with `moveUp(slotId, index)` and `moveDown(slotId, index)`.
- `moveUp` swaps `strong[index]` with `strong[index — 1]` only when `index > 0`.
- `moveDown` swaps `strong[index]` with `strong[index + 1]` only when `index < strong.length — 1`.
- Return both methods from the store API.
- In `apply(ui, store, output, onNextShuffle)`, wire `ui.strongs.moveUp` and `ui.strongs.moveDown` to the corresponding store method, then re-render only `ui.renderStrongs(store.serialize().slots)`.
- Preserve the existing shuffle and promote handlers exactly; leave ban, banned, save, and download intents inert.

## Rules

- Reordering affects `strong[]` only; do not mutate `pool[]`, `banned[]`, the current mantra output, or any other slot.
- Boundary controls must be harmless: moving index `0` up and the final index down does nothing.
- Keep the existing UI table and button factories unchanged.
- If the plan, architecture, pseudo, or implementation contradicts this step, use the simplest reading and report a ready-to-apply snippet; do not silently edit documentation.

## Workflow

1. Add `moveUp` and `moveDown` to `createStore`.
2. Wire the two strongs intents in `apply`.
3. Validate reordering and regressions.

- RULE: Validate after each code step and do not return to a previous step.

## Step Validation commands

- After each code step: `node --check artisans/apps/art-mantras/src/app.js`.
- Keep status review scoped to this delegation's application change.

## Step 1 — Add store mutations

Implement the pseudo contract:

```pseudo
moveUp(slotId, index)
  if index > 0: swap strong[index], strong[index — 1]

moveDown(slotId, index)
  if index < strong.length — 1: swap strong[index], strong[index + 1]
```

Resolve the slot by `slotId`, mutate only its `strong[]`, and expose both methods from `createStore`.

**Validation:** `node --check artisans/apps/art-mantras/src/app.js`.

## Step 2 — Wire strongs controls

Assign handlers to `ui.strongs.moveUp` and `ui.strongs.moveDown`. Each handler receives `(slotId, index)`, calls the corresponding store mutation, and re-renders the strongs section from `store.serialize().slots`. Do not re-render the mantra or banned sections.

**Validation:** `node --check artisans/apps/art-mantras/src/app.js`.

## Step 3 — Verify reorder behavior

Run `npm run serve` from the repository root and verify with a browser or equivalent headless DOM check:

- a middle strong word moves one position up and down;
- first-word up and last-word down are no-ops;
- only the affected strong ordering changes;
- promotion still appends to the bottom and changes the current row binding;
- shuffle still re-rolls and resets pick-up bindings;
- ban, unban, banned→strong, save, and download remain inert;
- A1 remains `Artificial` with an empty control cell;
- no console errors, unexpected output, or 404s occur.

Stop the server after verification.

## Final Verification

**Sanity check**

The step is complete when `^` and `v` reorder only the selected slot's `strong[]`, update the strongs table, and preserve all existing step 5–6 behavior.

**Verification steps**

- `node --check artisans/apps/art-mantras/src/app.js` passes.
- `npm run serve` and HTTP checks pass.
- Up/down middle and boundary behavior is verified.
- Promote and shuffle regressions, A1 behavior, inert later controls, and clean console are verified.
- Only `artisans/apps/art-mantras/src/app.js` is changed by the delegation.

## How to Report Back

Report `COMPLETED` or `BLOCKER`, include evidence and validation, and render the report with `.agents/domains/plans/templates/instructions-report.tart`. Include any ambiguity with `where`, `problem`, `decision`, and a ready-to-apply snippet. Return only a terse completion/blocker summary; the full trail belongs in the report.

Thank you for your service.
