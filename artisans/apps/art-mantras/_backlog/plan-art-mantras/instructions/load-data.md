# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `load-data`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Goals

Implement the art-mantras race step 2 — **bootstrap: load data**. `loadData()` (Persistence) fetches the seeded `src/data.json` on DOM ready and holds it — no errors, clean browser console. This step wires the app's entry point: `src/index.html` gains the module script tag so the app actually runs. You implement ONLY what this step needs — no store, no shuffle, no mount, no bindings (steps 3+).

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/instructions-report.tart` — the report format you render at the end.
- `artificials/_backlog/plan-art-mantras/plan.md` — the plan; this commit is `load-data`.
- `artificials/artisans/apps/art-mantras/_guide.md` — module map; read order is `_guide` → `_plan` → `_pseudo`.
- `artificials/artisans/apps/art-mantras/_architect.md` — the design contract; read **Layer: Entry Point** (`main`) and **Layer: Persistence** (`loadData`), plus Conventions (`const FILE = "data.json"`, utils → `main()` last).
- `artificials/artisans/apps/art-mantras/_pseudo.md` — the function declarations; the contract. Step 2 concerns **Layer: Entry Point → `main()`** and **Layer: Persistence → `loadData()`**.
- `artificials/artisans/apps/art-mantras/_wip.md` — only to identify the current step (step 2); NEVER modify it.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- `src/app.js` — replace the zero-code comment stub with the first real code: `const FILE = "data.json"` + `loadData()` + `main()`.
  - `loadData()`: `fetch(FILE)` → `response.json()` (per `_pseudo.md` → Layer: Persistence). Relative paths fail with `file://` URIs — the app must be loaded over HTTP via `npm run serve`.
  - `main()`: on DOM ready, `data = loadData()`, and hold the data in module scope. `run(data)` is NOT called this step — `run()` lands in step 3 (mount shell); holding the loaded data here is the step-2 contract (`_wip.md` step 2: "fetches ... and holds it"). Record this staged deferral as a finding with a ready-to-apply snippet if `_pseudo.md` `main()`'s `run(data)` hand-off needs a note.
  - File order per NFR: utils → `main()` last.
- `src/index.html` — add `<script type="module" src="app.js"></script>` before `</body>` so the app runs (the only change to index.html this step).
- Do NOT touch `src/serve.js`, `src/data.json`, `src/styles.css`, or `package.json` — `styles.css` stays a zero-code stub until step 12.

## Rules

- NEVER modify `_architect.md`, `_pseudo.md`, `_wip.md`, `_guide.md`, `_module.md`, the plan file, or anything under `.agents/domains/plans/**` and `artificials/records/**`.
- Only modify application files: `src/app.js` and `src/index.html` (nothing else).
- Pseudo is the contract: `loadData()` implements exactly the Persistence-layer responsibility (fetch + parse); `main()` exactly the Entry-Point responsibility (DOM ready → load → hold; `run()` deferred this step).
- If the plan or pseudo contradicts the step, or is ambiguous: resolve it in code with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan or pseudo you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Implement `loadData()` + `main()` in `src/app.js`
Step 2. Wire the script tag in `src/index.html`
Step 3. Verify

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Implement `loadData()` + `main()` in `src/app.js`

- `const FILE = "data.json"` (module-level; the app's own location, `src/`).
- `loadData()`: `fetch(FILE)` → `response.json()` (per `_pseudo.md` → Layer: Persistence).
- `main()`: on DOM ready → `data = loadData()` → hold in module scope. Do not call `run(data)`.
- Functions ordered utils → `main()` last.

**Validation:** `node --check src/app.js` — parses cleanly (run from `artificials/artisans/apps/art-mantras/`).

### Step 2 — Wire the script tag in `src/index.html`

- Add `<script type="module" src="app.js"></script>` before `</body>`.

**Validation:** `npm run serve` (background), then `curl http://localhost:8000/` shows the script tag; `curl http://localhost:8000/app.js` returns `200` with `Content-Type: text/javascript`.

### Step 3 — Verify

- Load `http://localhost:8000/` in a browser with the console open.
- Confirmed: the app fetches `src/data.json` (network tab shows `200`), no console errors, no 404s, no unexpected output.
- Stop the server when done.

**Validation:** page loads over `npm run serve` — `data.json` fetched, console clean, no errors.

## Final Verification

**Sanity check**

The art-mantras race step 2 goal is met: `main()` runs on DOM ready, `loadData()` fetches and holds the seeded `src/data.json`, the console is clean, and no design doc or record was touched.

**Verification steps**

- `node --check src/app.js` — parses cleanly.
- `npm run serve` → browser: `data.json` fetch returns `200`, console clean (no errors/404s/unexpected output).
- `git status` shows ONLY `src/app.js` and `src/index.html` modified by this delegation (pre-existing working-tree changes outside this commit's scope are not counted).

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your feedback.
4. Generate the response and send it back to the delegator.
5. Keep the response terse — happy face + up to 3 bullet points (done `load-data`, created `src/app.js` + `src/index.html` script tag, thumbs up). The full trail lives in the report file; do not repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_pseudo.md`, or `_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
