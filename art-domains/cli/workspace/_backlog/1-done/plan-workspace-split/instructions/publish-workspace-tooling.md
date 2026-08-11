# Implementation Instructions

**Plan:** `workspace-split`

**commit.Id:** `publish-workspace-tooling`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `{commit.Id}`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Publish the three workspace-tooling packages to npm:
- `@noodlestan/esbuild` 0.0.11
- `@noodlestan/tsconfig` 0.0.11
- `@noodlestan/eslint-config` 0.0.7

This enables the publish-then-symlink pattern for cross-repo dependencies and unblocks the `extract-no-comply` step.

## Mandatory Reading

- `ops/_adr/publish-then-symlink.art` — the decision record for the publish-then-symlink pattern.
- `ops/records/repositories/workspace-tooling.art` — the workspace-tooling repository record with package details.
- `repos/workspace-tooling/package.json` — the root package.json with workspace configuration.
- `repos/workspace-tooling/cli/esbuild-cli/package.json` — the esbuild-cli package.
- `repos/workspace-tooling/configs/tsconfig/package.json` — the tsconfig package.
- `repos/workspace-tooling/configs/eslint-config/package.json` — the eslint-config package.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

1. **Verify npm authentication** — ensure `npm whoami` returns a valid user.
2. **Publish packages** — publish each package to npm in dependency order:
   - `@noodlestan/tsconfig` (no dependencies on other workspace-tooling packages)
   - `@noodlestan/eslint-config` (depends on `@noodlestan/tsconfig`)
   - `@noodlestan/esbuild` (depends on `@noodlestan/tsconfig`)
3. **Verify publication** — confirm each package is available on npm with `npm view @noodlestan/{package} version`.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".
- RULE: Do NOT use `--no-verify` for commits in the workspace-tooling repo unless absolutely necessary (the pre-commit should pass).
- RULE: If npm authentication fails, REPORT A BLOCKER immediately.

## Workflow

You are going to perform a series of steps and check status after each one.

- Step 1. Verify npm authentication
- Step 2. Publish @noodlestan/tsconfig
- Step 3. Publish @noodlestan/eslint-config
- Step 4. Publish @noodlestan/esbuild
- Step 5. Verify all packages are published

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm whoami` to verify npm authentication.
- Execute `npm view @noodlestan/{package} version` to verify each package is published.

## Step 1/5 — Verify npm authentication

**Goal:** Ensure you are authenticated to npm before attempting to publish.

**Instructions:**

1. Navigate to the workspace-tooling repository: `cd repos/workspace-tooling`.
2. Run `npm whoami` to check authentication.
3. If not authenticated, run `npm login` and follow the prompts.
4. If authentication fails or you cannot authenticate, REPORT A BLOCKER.

**Extra validation commands:**

- `npm whoami` should return a valid username.

## Step 2/5 — Publish @noodlestan/tsconfig

**Goal:** Publish the tsconfig package to npm.

**Instructions:**

1. Navigate to the tsconfig package: `cd repos/workspace-tooling/configs/tsconfig`.
2. Verify the package.json has the correct name (`@noodlestan/tsconfig`) and version (`0.0.11`).
3. Run `npm publish --access public` to publish the package.
4. If the version already exists on npm, the publish will fail — this is acceptable, move to the next step.
5. If there are other errors (e.g., missing files, invalid package.json), inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @noodlestan/tsconfig version` should return `0.0.11` (or the published version).

## Step 3/5 — Publish @noodlestan/eslint-config

**Goal:** Publish the eslint-config package to npm.

**Instructions:**

1. Navigate to the eslint-config package: `cd repos/workspace-tooling/configs/eslint-config`.
2. Verify the package.json has the correct name (`@noodlestan/eslint-config`) and version (`0.0.7`).
3. Run `npm publish --access public` to publish the package.
4. If the version already exists on npm, the publish will fail — this is acceptable, move to the next step.
5. If there are other errors, inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @noodlestan/eslint-config version` should return `0.0.7` (or the published version).

## Step 4/5 — Publish @noodlestan/esbuild

**Goal:** Publish the esbuild-cli package to npm.

**Instructions:**

1. Navigate to the esbuild-cli package: `cd repos/workspace-tooling/cli/esbuild-cli`.
2. Verify the package.json has the correct name (`@noodlestan/esbuild`) and version (`0.0.11`).
3. Verify that `esbuild` and `esbuild-plugin-file-path-extensions` are in `dependencies` (not devDependencies) — these are runtime imports.
4. Run `npm publish --access public` to publish the package.
5. If the version already exists on npm, the publish will fail — this is acceptable, move to the next step.
6. If there are other errors, inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @noodlestan/esbuild version` should return `0.0.11` (or the published version).

## Step 5/5 — Verify all packages are published

**Goal:** Confirm all three packages are available on npm.

**Instructions:**

1. Run `npm view @noodlestan/tsconfig version` and verify it returns a version.
2. Run `npm view @noodlestan/eslint-config version` and verify it returns a version.
3. Run `npm view @noodlestan/esbuild version` and verify it returns a version.
4. If any package is not found, REPORT A BLOCKER.

**Extra validation commands:**

- All three `npm view` commands should return version numbers.

## Final Verification

**Sanity check**

Confirm that all three workspace-tooling packages are now available on npm and can be installed by consumers. This enables the publish-then-symlink pattern for cross-repo dependencies.

**Verification steps**

- Execute `npm view @noodlestan/tsconfig version` to verify tsconfig is published.
- Execute `npm view @noodlestan/eslint-config version` to verify eslint-config is published.
- Execute `npm view @noodlestan/esbuild version` to verify esbuild is published.
- Optionally, create a scratch directory and run `npm init -y && npm install @noodlestan/tsconfig @noodlestan/eslint-config @noodlestan/esbuild` to verify all packages can be installed together.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `ops/_backlog/plan-workspace-split/instructions/publish-workspace-tooling__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `publish-workspace-tooling`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
