# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `shell-tables`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `shell-tables`, created semantic `<table>` markup, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement the art-mantras race step 4 — **markup: convert the static shell to semantic tables**. Step 3 (`mount-shell`, commit `10d29ce5`) rendered the grid sections as generic `<div>`s; the design contract (`_architect.md` NFRs → markup contract) requires semantic `<table>` markup. Convert the mantra row, strongs section, and banned section to `<table>` / `<th scope="row">` / `<tr>` / `<td>` structure.

**Behavior must be unchanged**: the same factories, the same render api, the same intent slots, the same button api (`setTitle`/`setEnabled`), and all buttons still inert. Zero intent wiring — `apply()` and its bindings land from step 5.

## Mandatory Reading

- `artificials/artisans/apps/art-mantras/_architect.md` — NFRs → markup contract; What → UI (table structure per section).
- `artificials/artisans/apps/art-mantras/_pseudo.md` — Layer: UI (component factories, render api, intent slots; the markup contract now prescribes the grid structure).
- `artificials/artisans/apps/art-mantras/src/app.js` — the current shell implementation to convert.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- `src/app.js` — convert the grid sections' markup only; nothing else:
  - **`createMantraRow()`** — render as a single `<table>`: one `<tr>` per slot with letter `<th scope="row">`, word `<td>`, control `<td>` (the pick-up button via `createButton`). The constant slot (A1) renders an empty control cell — no button ever. The `<h2>` word markup is replaced by the word inside the `<td>` (structure per contract). The render api, per-slot button api (`setTitle`/`setEnabled`), and the promote intent slot are unchanged.
  - **`createStrongsSection()`** — per letter, an ordered `<table>` of `strong[]` words: word `<td>` + controls (^ / v / X via `createButton`). Section container + title unchanged.
  - **`createBannedSection()`** — inside the existing native `<details>`, per letter, a `<table>` of banned words: word `<td>` + controls (? / + via `createButton`). Empty banned list → empty table body, section still present.
  - `createToolbar()` unchanged (static buttons, no grid).
  - Do NOT touch `src/index.html`, `src/serve.js`, `src/data.json`, `src/styles.css`, or `package.json` — `styles.css` stays a zero-code stub until the polish step.
- Zero behavior change: same factories/apis/intent slots; all buttons inert.

## Rules

- NEVER modify `_architect.md`, `_pseudo.md`, `_wip.md`, `_guide.md`, `_module.md`, the plan file, or anything under `.agents/domains/plans/**` and `artificials/records/**`.
- Only modify application files: `src/app.js` (nothing else).
- Follow the markup contract exactly: `<table>` for grids, `<th scope="row">` row headers, `<td>` cells. Do not introduce classes/ids/attributes that a future `styles.css` would need.
- Markup is the ONLY change: no binding changes, no render-api changes, no new functions, no behavior differences, no new intent slots.
- If the plan or pseudo contradicts the step, or is ambiguous: resolve it in code with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan or pseudo you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Convert `createMantraRow()` to a single `<table>`
Step 2. Convert `createStrongsSection()` to per-letter `<table>`s
Step 3. Convert `createBannedSection()` to per-letter `<table>`s (inside `<details>`)
Step 4. Verify structure + unchanged behavior

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Mantra row → single `<table>`

- One `<table>`; per slot a `<tr>`: `<th scope="row">` = the slot letter, `<td>` = the word text (no `<h2>`), `<td>` = the pick-up button (created via `createButton`). Constant A1 → empty control cell, no button ever.
- Keep the `render(output)` contract: re-render from the output view; per-slot button lifecycle derived from `source` (pool → `+ strong` enabled; strong → `✓ strong` disabled).

**Validation:** `node --check src/app.js` — parses cleanly (run from `artificials/artisans/apps/art-mantras/`).

### Step 2 — Strongs → per-letter `<table>`s

- One `<table>` per letter: rows = `strong[]` words (word `<td>` + ^ / v / X controls via `createButton`). `render(slots)` re-renders from the passed slots; intent slots (`moveUp`, `moveDown`, `ban`) unchanged.

**Validation:** `node --check src/app.js`.

### Step 3 — Banned → per-letter `<table>`s (inside `<details>`)

- Keep the native `<details>` element; per letter a `<table>`: rows = banned words (word `<td>` + ? / + controls via `createButton`). Empty banned list → empty table body, section present. `render(slots)` unchanged in contract.

**Validation:** `node --check src/app.js`.

### Step 4 — Verify

- `node --check src/app.js` — clean.
- `npm run serve` — server log shows only the startup line; `curl /` → 200, `/app.js` → 200, `/data.json` → 200, unknown → 404. Stop the server after.
- Headless DOM simulation of the full `run(data)` pipeline (minimal `document` stub, real `data.json`):
  - one mantra `<table>` with exactly 11 `<tr>`; each row has a letter `<th scope="row">`, a word `<td>` (A1 shows "Artificial"), and a control `<td>`; A1's control cell contains NO button;
  - strongs section: one `<table>` per letter present in the seeded data, word rows with ^ / v / X buttons;
  - banned section: native `<details>` present; per-letter `<table>`s with empty bodies (seeded `banned` empty);
  - every rendered button still inert — clicking produces nothing, no throws;
  - render api and intent slots unchanged.
- Commit `--no-verify` with message `art-mantras: shell tables markup` — the commit must contain exactly `src/app.js`. (Pre-existing working-tree/staged changes from concurrent sessions are not yours; do not include them.)

## Final Verification

**Sanity check:** the app behaves exactly as after `mount-shell` — same buttons, same inertia, same render api — but the grid sections are now semantic `<table>`s.

**Verification steps**

- `node --check src/app.js` (from `artificials/artisans/apps/art-mantras/`).
- `npm run serve` → `curl http://localhost:8000/` returns `200`; `/app.js` and `/data.json` `200` with correct content-types; unknown path `404`; clean serve log.
- Headless DOM simulation as per Step 4 — structure assertions pass; all 94 buttons still inert; no throws; console clean.
- `git show --stat HEAD` → the commit contains exactly `src/app.js`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your feedback.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `shell-tables`, created semantic `<table>` markup, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
