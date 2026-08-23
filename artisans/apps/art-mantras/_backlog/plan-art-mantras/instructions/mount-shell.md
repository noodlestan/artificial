# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `mount-shell`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Goals

Implement the art-mantras race step 3 — **shell: mount static UI (no bindings yet)**. Replace hello world with `mount()` (Entry Point): toolbar (DOWNLOAD / + mantra / shuffle), mantra row (11 `<h2>` words from the initial `shuffle()` output), pick-up row (A1 empty cell; pool → `+ strong` enabled, strong → `✓ strong` disabled), strongs + banned sections. All buttons inert — clicking any of them must do nothing, with no console errors. This step lands the Store, Derivation, UI, and Entry-Point layers far enough to render the initial state. NO intent wiring (`apply()` and its bindings land from step 4).

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/instructions-report.tart` — the report format you render at the end.
- `artificials/_backlog/plan-art-mantras/plan.md` — the plan; this commit is `mount-shell`.
- `artificials/artisans/apps/art-mantras/_guide.md` — module map; read order is `_guide` → `_plan` → `_pseudo`.
- `artificials/artisans/apps/art-mantras/_architect.md` — the design contract; read **Layer: Entry Point** (`main`/`run`), **Layer: Store** (`createStore`/`serialize`), **Layer: Derivation** (`shuffle` + helpers), **Layer: UI** (`mount` + factories), plus Conventions (no classes, data-attributes, one listener per node).
- `artificials/artisans/apps/art-mantras/_pseudo.md` — the function declarations; the contract. Step 3 concerns: `createStore`/`serialize` (Store), `shuffle`/`createViewEntry`/`createFibWeights`/`pickFromStrong`/`pickFromPool`/`chooseMantraWord` (Derivation), `mount`/`createButton`/`createToolbar`/`createMantraRow`/`createStrongsSection`/`createBannedSection`/`renderMantra`/`renderStrongs`/`renderBanned` (UI), `run` (Entry Point).
- `artificials/artisans/apps/art-mantras/_wip.md` — only to identify the current step (step 3); NEVER modify it.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- `src/app.js` — replace step 2's hold-data state with the initial-render pipeline. Implement ONLY what step 3 needs; nothing more:
  - **Store (staged):** `createStore(data)` — this step needs `serialize()` only (`return { ...data, slots: [...data.slots] }` — data object with slots shallow-copied). The mutation api members (`promoteToStrong`, `moveUp`, `moveDown`, `banWord`, `unbanWord`, `banToStrong`, `saveMantra`) land with their use cases (steps 5-10); `serialize` holds the data object.
  - **Derivation (complete):** `createViewEntry(slot, chosen)`, `createFibWeights(count)`, `pickFromStrong(slot, weights)`, `pickFromPool(slot)`, `chooseMantraWord(slot)`, `shuffle(data)` — per `_pseudo.md` → Layer: Derivation. Pure — no state mutation, no UI access, no randomness outside these functions. `mantraWords()` is NOT this step (it belongs to save/reload, step 10).
  - **UI (complete):** `mount()` per pseudo — static shell: toolbar, mantra row, pick-up row, strongs + banned sections. `createButton(title, onPress)`: button element with `setTitle`/`setEnabled` api (returns element + api); onPress calls the intent slot; `createToolbar()` → `ui.toolbar` exposing download/save/shuffle buttons; `createMantraRow()` → 11 `<h2>` words per slot in order, words from the passed output view (no store access); `createStrongsSection()` / `createBannedSection()` → section containers + titles, initial empty lists; `renderMantra(output)`, `renderStrongs(slots)`, `renderBanned(slots)` per pseudo.
  - **Intent slots default to no-op** (`() => {}`). The factories' onPress call the intent slots; while unwired they must do nothing — clicking any button in step 3 produces no errors. `apply()` wires real intents from step 4.
  - **Entry Point (staged):** `main()` now calls `run(data)`; `run(data)` per pseudo minus `apply`: `store = createStore(data); ui = mount(); output = shuffle(data)` then the initial render: `ui.renderMantra(output)`, `ui.renderStrongs(store.serialize().slots)`, `ui.renderBanned(store.serialize().slots)`. `apply` and its `onDownload`/`onNextShuffle` callbacks land step 4. Record this staged `run()` as a finding with a ready-to-apply snippet for `_pseudo.md` if needed.
- `src/index.html` — remove the `hello world` heading (the mount() shell replaces it); nothing else changes.
- Do NOT touch `src/serve.js`, `src/data.json`, `src/styles.css`, or `package.json` — `styles.css` stays a zero-code stub until step 12.

## Rules

- NEVER modify `_architect.md`, `_pseudo.md`, `_wip.md`, `_guide.md`, `_module.md`, the plan file, or anything under `.agents/domains/plans/**` and `artificials/records/**`.
- Only modify application files: `src/app.js` and `src/index.html` (nothing else).
- Pseudo is the contract: implement exactly the responsibilities declared. Where a function's full contract is staged across steps (createStore, run), implement only this step's slice and report the staged deferral.
- If the plan or pseudo contradicts the step, or is ambiguous: resolve it in code with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan or pseudo you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Store slice: `createStore(data)` + `serialize()`
Step 2. Derivation: `shuffle()` + helpers
Step 3. UI: `mount()` + component factories + render api
Step 4. Entry Point: `run(data)` + `main()` hand-off
Step 5. Verify the static shell

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Store slice: `createStore(data)` + `serialize()`

- `createStore(data)`: holds the slots from the loaded data in memory; returns `{ serialize }` this step (mutation api members land steps 5-10). Never reads from `data.json` after creation.
- `serialize()`: `return { ...data, slots: [...data.slots] }` (data object with slots shallow-copied), takes no arguments.

**Validation:** `node --check src/app.js` — parses cleanly (run from `artificials/artisans/apps/art-mantras/`).

### Step 2 — Derivation: `shuffle()` + helpers

- `createViewEntry(slot)`, `createFibWeights()`, `pickFromStrong(slots, seedIndex)`, `pickFromPool(slots, letter, used)`, `chooseMantraWord(slots, letter, used, strongPool, pool, weights)`, `shuffle(slots)` — per `_pseudo.md` → Layer: Derivation.
- Pure — no state mutation, no UI access; randomness confined to these functions.

**Validation:** `node --check src/app.js` — parses cleanly.

### Step 3 — UI: `mount()` + component factories + render api

- `mount()`: static shell (toolbar, mantra row, pick-up row, strongs + banned sections), all buttons inert. Creates and returns the `ui` object (the event binding surface); no render calls here.
- `createButton(label, type, id, onClick)`: button node with `data-attr`; label from `ui.toolbar`/section data.
- `createToolbar()`: three buttons — DOWNLOAD, + mantra (save), shuffle; `ui.toolbar` exposes them.
- `createMantraRow()`: 11 `<h2>` words, one per slot, in slot order; words from the passed output view.
- `createStrongsSection()` / `createBannedSection()`: section containers + titles ("Strongs" / "Banned"), initial empty lists; per-word control buttons are rendered by `renderStrongs`/`renderBanned` later.
- `renderMantra(output)`, `renderStrongs(slots)`, `renderBanned(slots)`: per pseudo — each replaces the section content from the current state.
- Intent slots no-op: clicking any button must do nothing, no console errors.

**Validation:** `node --check src/app.js` — parses cleanly.

### Step 4 — Entry Point: `run(data)` + `main()` hand-off

- `main()`: on DOM ready → `data = await loadData()` → `run(data)`.
- `run(data)`: `store = createStore(data); ui = mount(); output = shuffle(data)`; initial render: `ui.renderMantra(output)`, `ui.renderStrongs(store.serialize().slots)`, `ui.renderBanned(store.serialize().slots)`. No `apply`, no bindings this step.

**Validation:** `node --check src/app.js` — parses cleanly; `git status` shows only `src/app.js` + `src/index.html` touched by you.

### Step 5 — Verify the static shell

- `npm run serve` (background); open `http://localhost:8000/` with browser console open.
- Confirmed: toolbar shows 3 buttons (DOWNLOAD / + mantra / shuffle); mantra row shows 11 `<h2>` words, A1 = "Artificial" (seeded data, slot order); pick-up row per slot: A1 empty cell, pool word → `+ strong` enabled, strong word → `✓ strong` disabled; strongs section lists per-letter `strong[]`; banned section present (seeded `banned` is empty → empty list); all buttons inert (click → nothing, no errors); console clean.
- Stop the server when done.

**Validation:** full shell renders over `npm run serve`; no console errors; buttons inert.

## Final Verification

**Sanity check**

The art-mantras race step 3 goal is met: the static shell mounts with toolbar, mantra row (11 words from the initial `shuffle()` output), pick-up row, and strongs + banned sections; all buttons inert; console clean; no design doc or record touched.

**Verification steps**

- `node --check src/app.js` — parses cleanly.
- `npm run serve` → browser: shell renders as specified in Step 5; clicking any button does nothing; console clean (no errors/404s/unexpected output).
- `git status` shows ONLY `src/app.js` and `src/index.html` modified by this delegation (pre-existing working-tree changes outside this commit's scope are not counted).

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your feedback.
4. Generate the response and send it back to the delegator.
5. Keep the response terse — happy face + up to 3 bullet points (done `mount-shell`, created static shell + `ui` binding surface, thumbs up). The full trail lives in the report file; do not repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_pseudo.md`, or `_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
