# Implementation Instructions

**Plan:** `ops/_backlog/3-now/plan-workspace-cli/plan.md`

**commit.Id:** `workspace-cli-install`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `workspace-cli-install`, CLI integrated in workspace, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Install `@art-domains/workspace-cli@0.0.1` in the workspace root and expose it via npm scripts. This validates the publish-then-consume pattern works and the CLI is usable from the workspace context. The workspace root currently has **no `package.json`**; this commit creates it with the CLI as its single devDependency.

## Mandatory Reading

- `ops/_architect.md` — workspace architecture, principles, NFRs, use cases
- `ops/_adr/cli.art` — CLI package decisions (tech stack: commander, simple-git, esbuild, vitest)
- `ops/_adr/publish.art` — publish-then-symlink pattern
- `ops/records/workspace.art` — workspace record

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. Create the workspace root package.json and install workspace-cli

The workspace root currently has **no `package.json`** — the workspace is a meta-repo, not a build root, and no root manifest was ever scaffolded. You are authorised to create it. Create `package.json` at the workspace root with the CLI as its **single devDependency**:

```json
{
  "name": "noodlestan-workspace",
  "private": true,
  "devDependencies": {
    "@art-domains/workspace-cli": "0.0.1"
  }
}
```

- `private: true` keeps the workspace meta-repo out of the npm registry.
- If a root `package.json` unexpectedly already exists, keep its contents and only add the `devDependencies` entry — do not rewrite existing fields.

Run `npm install` to install the package.

### 2. Add npm scripts

Add scripts to the workspace root `package.json` to expose the CLI:

```json
{
  "scripts": {
    "workspace": "art-workspace",
    "workspace:sanity": "art-workspace sanity",
    "workspace:publish": "art-workspace publish"
  }
}
```

### 3. Verify installation

Run the following commands to verify the CLI is accessible:

- `npm run workspace -- --help` — should show CLI help
- `npm run workspace -- --version` — should show version 0.0.1
- `npm run workspace:sanity` — should run sanity command (may fail if no repos are cloned, but should not error on missing command)

## Rules

- RULE: The workspace root `package.json` does not exist yet. You are authorised to create it in Step 1 — with the CLI as its single devDependency — and to commit it. Do NOT create any other manifests or configuration files.
- Install `@art-domains/workspace-cli@0.0.1` as a devDependency.
- Add npm scripts to expose the CLI.
- Verify the CLI is accessible via `npm run`.
- Do NOT modify any other packages or configurations.
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Create the workspace root package.json and install workspace-cli
Step 2. Add npm scripts
Step 3. Verify installation

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Create the workspace root package.json and install workspace-cli

- Check whether a root `package.json` exists at the workspace root.
- If it does NOT exist, create it at the workspace root with:
  - `name`: `noodlestan-workspace`
  - `private`: `true`
  - `devDependencies`: `"@art-domains/workspace-cli": "0.0.1"` — the single devDependency.
- If it already exists, keep its contents and only add the `devDependencies` entry.
- Run `npm install`.

**Validation:** `npm install` succeeds, `node_modules/@art-domains/workspace-cli` exists.

### Step 2 — Add npm scripts

- Add `workspace`, `workspace:sanity`, and `workspace:publish` scripts to `package.json`.

**Validation:** `package.json` contains the new scripts.

### Step 3 — Verify installation

- Run `npm run workspace -- --help` — should show CLI help.
- Run `npm run workspace -- --version` — should show version 0.0.1.
- Run `npm run workspace:sanity` — should execute (may report no repos, but should not error on missing command).

## Final Verification

**Sanity check**

The goal is met: a root `package.json` exists at the workspace root with `@art-domains/workspace-cli@0.0.1` as its single devDependency, and the CLI is accessible via npm scripts.

**Verification steps**

- A `package.json` exists at the workspace root declaring `@art-domains/workspace-cli@0.0.1` as its only devDependency.
- `npm run workspace -- --help` shows CLI help.
- `npm run workspace -- --version` shows 0.0.1.
- `npm run workspace:sanity` executes without "command not found" error.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/3-now/plan-workspace-cli/instructions/workspace-cli-install__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, or records.

Thank you for your service.
