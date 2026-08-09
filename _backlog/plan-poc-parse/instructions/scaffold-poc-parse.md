# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `scaffold-poc-parse`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `scaffold-poc-parse`, created `art-js/cli/poc-parse/**`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Scaffold a runnable, self-contained CLI package named `@art-js/poc-parse` at `art-js/cli/poc-parse/`, per artificials POC Step 1: register the package record, scaffold the package files, add the workspace entry, and verify the CLI runs. No parsing logic, no schema types, no micromark wiring — the substrate choice is deliberately deferred to a later step.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `artificials/_backlog/plan-poc-parse/plan.md` — the plan; this commit is `scaffold-poc-parse`.
- `artificials/_guide.md` — the Artificials System overview: the compiler pipeline (Parse → Extract → Transform → Render) and the compilation model. Context only.
- `artificials/_architect.md` — Approach + Step 1 (scaffold the poc-parse package).
- `artificials/_wip.md` — only to identify the current step; NEVER modify it.
- `artificials/architecture/records/adr/_research.md` — the substrate research behind the POC (context only; no substrate decisions in this step).
- `artificials/records/packages/artificials-parser.art` — package record format example.
- `artificials/records/scaffolders/skeleton-cli/scaffolder-skeleton.art` — the CLI package scaffold source.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- Register the package: create `records/packages/artificials-poc-parse.art` (relative to `artificials/`), following `artificials/records/packages/artificials-parser.art` as the format example — `Path cli/poc-parse/`, `Canonical Name @art-js/poc-parse`, `Version 0.0.1`, scaffolders `Skeleton CLI` + `Package Common`.
- Scaffold `art-js/cli/poc-parse/` per `artificials/records/scaffolders/skeleton-cli/scaffolder-skeleton.art` and the sibling CLI packages (e.g. `art-js/cli/bin/`): package.json, tsconfig variants, README, CLI entry.
- Add the workspace entry `cli/poc-parse/` to the `workspaces` array in the root `package.json` (only this entry; leave the rest untouched).
- Do NOT implement parsing, schema types, or micromark — those belong to later commits.

## Rules

- NEVER modify `artificials/_guide.md`, `artificials/_architect.md`, `artificials/_wip.md`, `artificials/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any existing `artificials/records/packages/*` file.
- Only create/modify: `art-js/cli/poc-parse/**` (new package), `artificials/records/packages/artificials-poc-parse.art` (new record), and the `workspaces` array in the root `package.json` (only the entry this step requires).
- If the plan or a reference is ambiguous or contradicts the repo conventions: resolve it with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Create the package record
Step 2. Scaffold the package files
Step 3. Add the workspace entry
Step 4. Verify the CLI runs

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Create the package record

- Create `artificials/records/packages/artificials-poc-parse.art` following the format of `artificials/records/packages/artificials-parser.art`: `Path cli/poc-parse/`, `Canonical Name @art-js/poc-parse`, `Version 0.0.1`, scaffolders `Skeleton CLI` + `Package Common`.

**Validation:** the record parses and its format matches the example record's conventions.

### Step 2 — Scaffold the package files

- Scaffold `art-js/cli/poc-parse/` per `artificials/records/scaffolders/skeleton-cli/scaffolder-skeleton.art`, matching sibling CLI packages (`art-js/cli/bin/`): package.json, tsconfig variants, README, CLI entry.

**Validation:** `node -e "require('./art-js/cli/poc-parse/package.json')"` succeeds (package.json is valid JSON and resolves).

### Step 3 — Add the workspace entry

- Add `cli/poc-parse/` to the `workspaces` array in the root `package.json` (only that entry).

**Validation:** execute `npm install` in the repository root — succeeds and registers the new workspace.

### Step 4 — Verify the CLI runs

- Run `npm run dev` in `art-js/cli/poc-parse/` — per the skeleton-cli scaffolder record and `_plan.md` Step 1, the package's `dev` script (`node --experimental-strip-types src/index.ts`) must print the welcome banner and exit cleanly.

## Final Verification

**Sanity check**

The artificials POC step 1 goal is met: `@art-js/poc-parse` exists at `art-js/cli/poc-parse/`, is registered in `artificials/records/packages/`, is a workspace entry, and its CLI runs cleanly.

**Verification steps**

- Execute `npm install` in the repository root — succeeds (workspace registered).
- Run `npm run dev` in `art-js/cli/poc-parse/` — prints the welcome banner, exits cleanly, no errors.
- Confirm `git status` shows exactly: new `art-js/cli/poc-parse/**`, new `artificials/records/packages/artificials-poc-parse.art`, and the single `workspaces` entry in root `package.json`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `scaffold-poc-parse`, created `art-js/cli/poc-parse/**`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `artificials/_architect.md`, or `artificials/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
