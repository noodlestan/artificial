# Plan: Github Workflow

## IMPORTANT : (WAS : Implementation Instructions) convert to Plan Structure using Plan Template

This file should become a plan file high level steps and one or more instruction files to implment the below massive instructions in smaller and better refined delegatable instructions.

**Plan:** `github-workflow`

## Goals

Add GitHub Actions CI workflows to every project repo and the workspace, so every repo has automated lint/build/test on push and PR. This is the final commit in the plan — all repos exist by this point.

**Corrective context (the plan's "github-workflows" as one batch — one workflow per repo, but each repo's workflow is identical in structure, differing only in the scripts it calls):**

By the time this delegation runs, the following repos exist and are standalone:

- `noodlestan/workspace-tooling` — tooling (esbuild wrapper, eslint-config, tsconfig)
- `noodlestan/artificial` — Art Language + artisan toolchain
- `noodlestan/purrception` — extraction toolchain
- `noodlestan/purrtrait` — rendering
- `noodlestan/purrpose` — single-purpose utilities
- `noodlestan/no-comply` — context-aware UI system + `standard-ui-demo` acceptance app
- `noodlestan/workspace` — the workspace meta-repo (context repo, not a build root)

Each project repo's workflow runs `npm install` + `npm run ci` (the repo's own CI script, which runs lint + build + test via turbo). The workspace repo's workflow runs `npm install` + `npm run lint` (the workspace has no build/test — it's a context repo).

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `ops/_backlog/plan-workspace-split/plan.md` — the plan; this commit is `github-workflows`.
- `ops/_guide.md` — the ops documents and the planning workflow.
- `ops/_architect.md` — the split design and NFRs (every repo builds standalone; GitHub Actions runs for all projects and the workspace).
- `ops/_module.md` — Structure: Repository and Structure: Workspace.
- `ops/records/workspace.art` — the workspace record (lists all known repos).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

One commit per repo (all pushed):

1. **`noodlestan/workspace-tooling`** — add `.github/workflows/ci.yml` (lint/build/test on push and PR).
2. **`noodlestan/artificial`** — add `.github/workflows/ci.yml`.
3. **`noodlestan/purrception`** — add `.github/workflows/ci.yml`.
4. **`noodlestan/purrtrait`** — add `.github/workflows/ci.yml`.
5. **`noodlestan/purrpose`** — add `.github/workflows/ci.yml`.
6. **`noodlestan/no-comply`** — add `.github/workflows/ci.yml`.
7. **`noodlestan/workspace`** — add `.github/workflows/ci.yml` (workspace-specific: lint only, no build/test).

Each workflow is identical in structure, differing only in the scripts it calls.

## Rules

- NEVER modify the workspace repo's plan, instruction, `_architect.md`, `_guide.md`, `_module.md`, `_parking-lot.md`, or anything under `.agents/domains/**`. The workspace repo gets exactly ONE commit in this delegation: the CI workflow.
- Each project repo gets exactly ONE commit: the CI workflow.
- The CI workflows must run on push and PR to `main`.
- The CI workflows must use `ubuntu-latest` and Node.js `24.15.0` (or `>=18` if the repo's engines require it — verify against each repo's `package.json`).
- The CI workflows must run `npm install` + `npm run ci` (or `npm run lint` for the workspace).
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Pre-check the repos and remotes
Step 2. Add CI workflow to `noodlestan/workspace-tooling`
Step 3. Add CI workflow to `noodlestan/artificial`
Step 4. Add CI workflow to `noodlestan/purrception`
Step 5. Add CI workflow to `noodlestan/purrtrait`
Step 6. Add CI workflow to `noodlestan/purrpose`
Step 7. Add CI workflow to `noodlestan/no-comply`
Step 8. Add CI workflow to `noodlestan/workspace`
Step 9. Final verification

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Pre-check the repos and remotes

- Confirm all repos exist and have at least one commit on `main`: `git ls-remote git@github.com:noodlestan/{workspace-tooling,artificial,purrception,purrtrait,purrpose,no-comply,workspace}.git` — each should show a `main` ref.
- Clone each repo into `repos/<repo>/` if not already present (`repos/` is gitignored in the workspace).

**Validation:** all repos are cloned and have `main` checked out.

### Step 2 — Add CI workflow to `noodlestan/workspace-tooling`

- Write `.github/workflows/ci.yml` in `repos/workspace-tooling/`:
    ```yaml
    name: CI
    on:
        push:
            branches: [main]
        pull_request:
            branches: [main]
    jobs:
        ci:
            runs-on: ubuntu-latest
            steps:
                - uses: actions/checkout@v4
                - uses: actions/setup-node@v4
                  with:
                      node-version: "24.15.0"
                      cache: "npm"
                - run: npm install
                - run: npm run ci
    ```
- Commit: `ci: add GitHub Actions workflow` and push to `origin main`.

**Validation:** `git -C repos/workspace-tooling status` clean; `git log --oneline -1` shows the commit; `git ls-remote origin main` shows it.

### Step 3 — Add CI workflow to `noodlestan/artificial`

- Write `.github/workflows/ci.yml` in `repos/artificial/` (same structure as Step 2).
- Commit and push.

**Validation:** clean; commit pushed.

### Step 4 — Add CI workflow to `noodlestan/purrception`

- Write `.github/workflows/ci.yml` in `repos/purrception/` (same structure as Step 2).
- Commit and push.

**Validation:** clean; commit pushed.

### Step 5 — Add CI workflow to `noodlestan/purrtrait`

- Write `.github/workflows/ci.yml` in `repos/purrtrait/` (same structure as Step 2).
- Commit and push.

**Validation:** clean; commit pushed.

### Step 6 — Add CI workflow to `noodlestan/purrpose`

- Write `.github/workflows/ci.yml` in `repos/purrpose/` (same structure as Step 2).
- Commit and push.

**Validation:** clean; commit pushed.

### Step 7 — Add CI workflow to `noodlestan/no-comply`

- Write `.github/workflows/ci.yml` in `repos/no-comply/` (same structure as Step 2).
- Commit and push.

**Validation:** clean; commit pushed.

### Step 8 — Add CI workflow to `noodlestan/workspace`

- Write `.github/workflows/ci.yml` in `repos/workspace/` (the workspace repo — **different**: lint only, no build/test):
    ```yaml
    name: CI
    on:
        push:
            branches: [main]
        pull_request:
            branches: [main]
    jobs:
        lint:
            runs-on: ubuntu-latest
            steps:
                - uses: actions/checkout@v4
                - uses: actions/setup-node@v4
                  with:
                      node-version: "24.15.0"
                      cache: "npm"
                - run: npm install
                - run: npm run lint
    ```
- Commit: `ci: add GitHub Actions workflow (lint only)` and push to `origin main`.

**Validation:** clean; commit pushed.

### Step 9 — Final verification

- All repos have `.github/workflows/ci.yml` committed and pushed.
- Each workflow runs on push and PR to `main`.
- Project repos run `npm run ci`; the workspace runs `npm run lint`.
- No other modifications to any repo.

## Final Verification

**Sanity check**

The goal is met: every repo has a GitHub Actions CI workflow that runs on push and PR to `main`, using the repo's own scripts. The workspace runs lint only (context repo, not a build root).

**Verification steps**

- `git -C repos/<repo> log --oneline -1` shows the CI commit for each repo.
- `git ls-remote origin main` shows the commits pushed.
- No other modifications to any repo.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/plan-workspace-split/instructions/github-workflows__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_module.md`, or a workspace record. Report the exact Node.js version used per repo and whether any repo's CI workflow needed adjustments (e.g., different scripts, different Node version).

Thank you for your service.
