# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `bind-promote`

These are your instructions. They include a section at the end on how to report back to the requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER**, execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow runs on three working agreements:

1. This instruction is self-contained. Everything needed is in this file plus its mandatory reading; never rely on session memory or chat context.
2. The report is self-contained. The rendered report file carries the full trail: evidence, changes, verification results, blockers, and feedback.
3. User interaction is minimal. Return a terse completion or blocker report; the full trail belongs in the report file.

## Goals

Implement art-mantras race step 6 — **use case: promote (+ strong)**. When a mantra-row pick-up button is pressed for a word currently sourced from `pool`, append that word to the bottom of its slot's `strong[]`, keep the word in the current mantra row, switch its button to the disabled `✓ strong` binding, and re-render the strongs section. Shuffle remains wired; every other intent remains inert for later steps.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instruction, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/instructions-report.tart` — report format to render at the end.
- `_backlog/plan-art-mantras/plan.md` — authoritative plan; this commit is `bind-promote`.
- `artisans/apps/art-mantras/_guide.md` — module map and companion-file reading order.
- `artisans/apps/art-mantras/_architect.md` — design contract, especially Entry Point, Store, and UI layers.
- `artisans/apps/art-mantras/_pseudo.md` — function contract for `apply`, `createStore`, `promoteToStrong`, and `createMantraRow`.
- `artisans/apps/art-mantras/_wip.md` — current race status; do not modify it.

- RULE: Follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If a required file or linked file cannot be read, stop and REPORT A BLOCKER.

## Changes

- `artisans/apps/art-mantras/src/app.js` only:
  - Extend `createStore(data)` with `promoteToStrong(slotId, word)`, locating the slot by id and appending the word to the bottom of that slot's `strong[]`.
  - Extend `apply(ui, store, output, onNextShuffle)` with the promote intent only:
    1. receive `slotId` and `word` from `ui.mantraRow.promote`;
    2. call `store.promoteToStrong(slotId, word)`;
    3. update the matching `currentOutput` entry in place so its `source` is `"strong"` and `canPromote` is `false`, preserving its current `word` and row position;
    4. call `ui.renderMantra(currentOutput)` so the button becomes disabled `✓ strong`;
    5. call `ui.renderStrongs(store.serialize().slots)` so the word appears at the bottom of that slot's strong list.
  - Keep the existing shuffle wiring and initial renders unchanged.
  - Leave toolbar download/save, strongs move/ban, and banned unban/promote intents as no-ops.
- Do not modify `_architect.md`, `_pseudo.md`, `_wip.md`, `_guide.md`, `_module.md`, the plan, or any other application file.

## Rules

- The store is the single source of truth; mutate only through `promoteToStrong`.
- Do not remove the promoted word from `pool[]`; pool is the full history and derivation already excludes words present in `strong[]`.
- Promote only the requested slot/word; do not shuffle or re-derive the whole output.
- Preserve A1's constant row and its empty control cell.
- If a command reports errors, attempt to fix them. If errors persist, inspect the cause; if still unresolved, STOP and report the blocker.
- If you commit, use `git commit --no-verify`.

## Workflow

You are going to perform these steps in order and validate after each one:

1. Add the store mutation.
2. Wire the mantra-row promote intent.
3. Verify promotion behavior and regression behavior.

- RULE: Do not return to a previous step.

## Step Validation commands

- After each code change, run `node --check artisans/apps/art-mantras/src/app.js` from the repository root.
- Keep the working-tree review scoped to the files modified by this delegation; unrelated pre-existing changes are not part of this commit.

## Step 1 — Add `promoteToStrong`

In `createStore(data)`, add the `promoteToStrong` method described by `_pseudo.md`:

```pseudo
promoteToStrong(slotId, word)
  slot = find(slotId)
  slot.strong.push(word)
```

Return it from the store API. Do not add the other future mutation methods in this step.

**Validation:** `node --check artisans/apps/art-mantras/src/app.js`.

## Step 2 — Wire the promote intent

In `apply(ui, store, output, onNextShuffle)`, assign `ui.mantraRow.promote` to a handler accepting `(slotId, word)`. The handler must:

1. call `store.promoteToStrong(slotId, word)`;
2. find the matching entry in `currentOutput` by `slotId` and set `source = "strong"` and `canPromote = false`;
3. render the current mantra row;
4. render the strongs section from `store.serialize().slots`.

Do not alter the current shuffle handler or wire any other intent.

**Validation:** `node --check artisans/apps/art-mantras/src/app.js`.

## Step 3 — Verify promotion and regressions

Run the app with `npm run serve` from the repository root and use a browser or equivalent headless DOM verification. Confirm:

- an enabled `+ strong` button on a pool-sourced word promotes that word;
- the word stays in the same mantra row;
- its control changes to disabled `✓ strong`;
- the word appears at the bottom of the corresponding strong list;
- A1 remains `Artificial` with an empty control cell;
- shuffle still re-rolls and resets pick-up bindings;
- DOWNLOAD, `+ mantra`, reorder, ban, unban, and banned→strong remain inert;
- there are no console errors or unexpected 404s.

Stop the server after verification.

## Final Verification

**Sanity check**

The art-mantras step 6 goal is met: a pool-sourced mantra word is appended to its slot's `strong[]`, remains in the current output, changes to the disabled strong binding, and causes only the mantra and strongs sections to re-render. Existing shuffle behavior remains intact.

**Verification steps**

- `node --check artisans/apps/art-mantras/src/app.js` passes.
- `npm run serve` serves the app successfully from the repository root.
- Promotion, button state, strong-list ordering, A1 behavior, shuffle regression, inert later controls, and clean console are verified.
- Only the intended application file is changed by this delegation, excluding pre-existing unrelated working-tree changes.

## How to Report Back

1. State whether you are reporting completion or a BLOCKER.
2. Gather evidence of changes and verification, or the blocker details.
3. Because this instruction includes `DIRECTIVE FEEDBACK`, use the `render-template` skill with `.agents/domains/plans/templates/instructions-report.tart` to render the report file.
4. Include every ambiguity, omission, or contradiction found, with `where`, `problem`, `decision`, and a ready-to-apply snippet. Do not silently fix design documents.
5. Return a terse response: happy face plus up to three bullets. The full trail belongs in the report file.

DIRECTIVE FEEDBACK: render the report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (plan/instruction section), `problem`, `decision` (the simplest reading implemented), and a READY-TO-APPLY snippet for the plan, `_architect.md`, `_pseudo.md`, or `_wip.md`. Never silently fix it in code only.

Thank you for your service.
