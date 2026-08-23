# Implementation Instructions

**Plan:** `art-mantras`

**commit.Id:** `serve-hello-world`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Goals

Implement the art-mantras race step 1 — **bootstrap: serve hello world**. The page must load over `npm run serve`: no 404s, clean browser console. This replaces the current zero-code comment stubs in `src/`. You implement ONLY what this step needs — no bindings, no store, no shuffle, no `loadData()`.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/instructions-report.tart` — the report format you render at the end.
- `artificials/_backlog/plan-art-mantras/plan.md` — the plan; this commit is `serve-hello-world`.
- `artificials/artisans/apps/art-mantras/_guide.md` — module map; read order is `_guide` → `_plan` → `_pseudo`.
- `artificials/artisans/apps/art-mantras/_architect.md` — the design contract; read **Layer: Serving** (and Layers 1–5 for context only).
- `artificials/artisans/apps/art-mantras/_pseudo.md` — the function declarations; the contract. Step 1 concerns **Layer: Serving → `serve entry (serve.js)`**.
- `artificials/artisans/apps/art-mantras/_wip.md` — only to identify the current step (step 1); NEVER modify it.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- Replace the comment stub in `src/serve.js` with the Serving-layer implementation: a static http server over `src/` using only `node:http` and `node:fs`, serving existing files with a per-file content-type and responding 404 otherwise, per `_pseudo.md` → Layer: Serving (`serve entry (serve.js)`, `server.listen(8000)`).
- Replace the comment stub in `src/index.html` with a minimal page that renders "hello world" (a plain h1 is enough; no CSS, no app script wired in this step).
- Leave `src/app.js` and `src/styles.css` as zero-code stubs (do not add code to them).
- Do NOT touch `src/data.json` or `package.json` — the `serve` script already exists.

## Rules

- NEVER modify `_architect.md`, `_pseudo.md`, `_wip.md`, `_guide.md`, `_module.md`, the plan file, or anything under `.agents/domains/plans/**` and `artificials/records/**`.
- Only modify application files: `src/serve.js` and `src/index.html` (nothing else).
- Pseudo is the contract: `serve.js` implements exactly the Serving-layer responsibility — a basic static server, nothing more (no caching, no routing extras, no HTTPS).
- If the plan or pseudo contradicts the step, or is ambiguous: resolve it in code with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan or pseudo you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Implement `src/serve.js`
Step 2. Implement `src/index.html`
Step 3. Confirm `src/app.js` and `src/styles.css` remain zero-code stubs
Step 4. Verify

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Implement `src/serve.js`

- Replace the comment stub with the static http server per `_pseudo.md` → Layer: Serving: `node:http` + `node:fs` only, serves from the package directory (`src/`), content-type per file, 404 otherwise, `listen(8000)`.

**Validation:** `node --check src/serve.js` — parses cleanly. (Run with `artificials/artisans/apps/art-mantras/` as the working directory.)

### Step 2 — Implement `src/index.html`

- Replace the comment stub with a minimal "hello world" page (plain h1; no assets, no script wiring in this step).

**Validation:** file is a single small HTML document referencing nothing that would 404.

### Step 3 — Confirm zero-code stubs

- `src/app.js` and `src/styles.css` keep their zero-code comment placeholders — no code added.

**Validation:** both files contain only comments.

### Step 4 — Verify

- Run `npm run serve` in `artificials/artisans/apps/art-mantras/` (in the background), then fetch the page.
- Confirmed: `curl http://localhost:8000/` returns `200` and the "hello world" markup; a missing file (e.g. `curl http://localhost:8000/nope.txt`) returns `404`.
- No unexpected console output from the server process.

**Validation:** page loads over `npm run serve` — no 404s, clean console. Stop the server when done.

## Final Verification

**Sanity check**

The art-mantras race step 1 goal is met: `src/serve.js` serves the package over `npm run serve`, the page renders "hello world", `src/app.js` and `src/styles.css` are still zero-code stubs, and no design doc or record was touched.

**Verification steps**

- `node --check src/serve.js` — parses cleanly.
- `npm run serve` → `curl http://localhost:8000/` returns `200` with the hello-world markup; `curl http://localhost:8000/nope.txt` returns `404`.
- `git status` shows ONLY `src/serve.js` and `src/index.html` modified by this delegation (pre-existing working-tree changes outside this commit's scope are not counted).

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your feedback.
4. Generate the response and send it back to the delegator.
5. Keep the response terse — happy face + up to 3 bullet points (done `serve-hello-world`, created `src/serve.js` + `src/index.html`, thumbs up). The full trail lives in the report file; do not repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_pseudo.md`, or `_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
