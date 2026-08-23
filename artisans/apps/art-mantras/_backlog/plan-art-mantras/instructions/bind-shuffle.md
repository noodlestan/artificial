# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `bind-shuffle`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Goals

Implement the art-mantras race step 5 — **use case: shuffle**. Render the shuffle button (already mounted in step 3), bind it, and mutate: clicking shuffle re-derives the output (`shuffle(store.serialize())`) and re-renders the mantra row (pick-up bindings reset). Verify it re-rolls. This step lands `apply()` (Entry Point) with its FIRST wired intent — `ui.toolbar.shuffle -> onNextShuffle()` — plus the initial render. All other intents stay no-op (steps 6-12). The mantra row renders as a `<table>` (corrective step `shell-tables`) — the render api is unchanged; `ui.renderMantra(out)` re-renders the table's word and control cells.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/instructions-report.tart` — the report format you render at the end.
- `artificials/_backlog/plan-art-mantras/plan.md` — the plan; this commit is `bind-shuffle`.
- `artificials/artisans/apps/art-mantras/_guide.md` — module map; read order is `_guide` → `_plan` → `_pseudo`.
- `artificials/artisans/apps/art-mantras/_architect.md` — the design contract; read **Layer: Entry Point** (`apply`, `run`), **Layer: Derivation** (`shuffle`), **Layer: UI** (render api).
- `artificials/artisans/apps/art-mantras/_pseudo.md` — the function declarations; the contract. Step 4 concerns **Layer: Entry Point → `apply()`** (shuffle wiring + initial render) and **`onNextShuffle`** (closure over store, defined in `run()`, passed to `apply()`).
- `artificials/artisans/apps/art-mantras/_wip.md` — only to identify the current step (step 5); NEVER modify it.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- `src/app.js` — implement the first wired intent:
  - **`onNextShuffle`** (closure over store, defined in `run()`): `out = shuffle(store.serialize())` → `ui.renderMantra(out)` → return `out` (the fresh output is handed back through the callback).
  - **`apply(ui, store, output, onNextShuffle)`** (staged): initial render (`ui.renderMantra(output)`, `ui.renderStrongs(store.serialize().slots)`, `ui.renderBanned(store.serialize().slots)`) + wire ONLY `ui.toolbar.shuffle -> onNextShuffle()`. All other intent slots stay no-op. The pseudo signature `apply(ui, store, output, onDownload, onNextShuffle)` is staged: `onDownload` lands with the download use case (step 12), and the remaining intents (`promoteToStrong`, `moveUp`, `moveDown`, `banWord`, `unbanWord`, `banToStrong`, `saveMantra`) land with their use cases (steps 6-11). Record this staged `apply()` as a finding with a ready-to-apply snippet for `_pseudo.md` if needed.
  - **`run(data)`** (updated): `store = createStore(data); ui = mount(); output = shuffle(data); onNextShuffle = ...; apply(ui, store, output, onNextShuffle)` — the initial render now happens inside `apply()`, per pseudo. `onDownload` deferred.
  - `main()` unchanged (calls `run(data)`).
- `src/index.html` — NO changes this step.
- Do NOT touch `src/serve.js`, `src/data.json`, `src/styles.css`, or `package.json` — `styles.css` stays a zero-code stub until step 12.

## Rules

- NEVER modify `_architect.md`, `_pseudo.md`, `_wip.md`, `_guide.md`, `_module.md`, the plan file, or anything under `.agents/domains/plans/**` and `artificials/records/**`.
- Only modify application files: `src/app.js` (nothing else).
- Pseudo is the contract: implement exactly the declared responsibilities. Where `apply()`'s full wiring is staged across steps, implement only this step's slice (shuffle) and report the staged deferral.
- If the plan or pseudo contradicts the step, or is ambiguous: resolve it in code with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan or pseudo you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Implement `onNextShuffle` in `run()`
Step 2. Implement `apply()` — initial render + wire `toolbar.shuffle` only
Step 3. Verify the re-roll

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Implement `onNextShuffle` in `run()`

- Define `onNextShuffle` as a closure over `store` and `ui`: `out = shuffle(store.serialize())` → `ui.renderMantra(out)` → return `out`.
- `run()`: keep `store = createStore(data); ui = mount(); output = shuffle(data)`, then build `onNextShuffle` and hand everything to `apply()` (Step 2).

**Validation:** `node --check src/app.js` — parses cleanly (run from `artificials/artisans/apps/art-mantras/`).

### Step 2 — Implement `apply()` — initial render + wire `toolbar.shuffle` only

- Initial render: `ui.renderMantra(output)`, `ui.renderStrongs(store.serialize().slots)`, `ui.renderBanned(store.serialize().slots)`.
- Wire `ui.toolbar.shuffle` to `onNextShuffle()`. All other intent slots remain no-op.
- After every intent, re-render ONLY what that intent affects (per pseudo: "after every intent: call ui.renderMantra with currentOutput ONLY when the mantra row changed").

**Validation:** `node --check src/app.js` — parses cleanly; `git status` shows only `src/app.js` touched by you.

### Step 3 — Verify the re-roll

- `npm run serve` (background); open `http://localhost:8000/` with browser console open.
- Confirmed: clicking **shuffle** re-derives the output and re-renders the mantra row — words re-roll (the seeded strongs/pool produce variation across clicks; note the 50/50 pool picks can repeat — click several times), pick-up bindings reset per the fresh output, no console errors.
- Clicking DOWNLOAD / + mantra still does nothing (intents not yet wired); console stays clean.
- Stop the server when done.

**Validation:** shuffle re-rolls the mantra row; pick-up bindings reset; no console errors; other buttons still inert.

## Final Verification

**Sanity check**

The art-mantras race step 5 goal is met: the shuffle button is bound to `onNextShuffle`, clicking it re-derives the output and re-renders the mantra row with reset pick-up bindings; the re-roll is verified; console clean; no design doc or record touched.

**Verification steps**

- `node --check src/app.js` — parses cleanly.
- `npm run serve` → browser: clicking shuffle re-rolls the mantra row (multiple clicks show variation); pick-up bindings reset; DOWNLOAD / + mantra still inert; console clean (no errors/404s/unexpected output).
- `git status` shows ONLY `src/app.js` modified by this delegation (pre-existing working-tree changes outside this commit's scope are not counted).

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your feedback.
4. Generate the response and send it back to the delegator.
5. Keep the response terse — happy face + up to 3 bullet points (done `bind-shuffle`, wired `apply()` shuffle intent, thumbs up). The full trail lives in the report file; do not repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_pseudo.md`, or `_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
