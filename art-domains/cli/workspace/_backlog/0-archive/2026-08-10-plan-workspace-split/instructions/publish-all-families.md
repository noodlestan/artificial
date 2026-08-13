# Implementation Instructions

**Plan:** `workspace-split`

**commit.Id:** `publish-all-families`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `{commit.Id}`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Publish all packages from the four family repositories to npm:

- **purrception** (4 packages): `@purrception/primitives`, `@purrception/lang-ts`, `@purrception/source-fs`, `@purrception/lang-ts-extract` (all 0.0.11)
- **artificial** (11 packages): `@art-js/*` and `@artisans/*` packages (all 0.0.1)
- **purrtrait** (5 packages): `@purrtrait/lang-ts`, `@purrtrait/code-renderer`, `@purrtrait/solid-code`, `@purrtrait/view-tsx`, `@purrtrait/client-tsx` (all 0.0.11)
- **purrpose** (3 packages): `@purrpose/client-babel`, `@purrpose/client-babel-preset-solidjs`, `@purrpose/solid-shiki-service` (all 0.0.11)

**Note:** purrpose has a reverse edge dependency on `@no-comply/solid-primitives` via temporary `file:` resolution. This may cause npm publish to fail. If it does, document the failure and move on — purrpose will be published after no-comply extraction.

## Mandatory Reading

- `ops/_adr/publish-then-symlink.art` — the decision record for the publish-then-symlink pattern.
- `ops/records/repositories/artificial.art` — the artificial repository record with package details.
- `ops/records/repositories/purrception.art` — the purrception repository record with package details.
- `ops/records/repositories/purrtrait.art` — the purrtrait repository record with package details.
- `ops/records/repositories/purrpose.art` — the purrpose repository record with package details.
- `repos/artificial/package.json` — the root package.json with workspace configuration.
- `repos/purrception/package.json` — the root package.json with workspace configuration.
- `repos/purrtrait/package.json` — the root package.json with workspace configuration.
- `repos/purrpose/package.json` — the root package.json with workspace configuration.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

1. **Verify npm authentication** — ensure `npm whoami` returns a valid user.
2. **Publish purrception packages** — publish all 4 packages in dependency order (primitives first, then lang-ts, then source-fs, then lang-ts-extract).
3. **Publish artificial packages** — publish all 11 packages (no internal dependencies, can be published in any order).
4. **Publish purrtrait packages** — publish all 5 packages (depends on @purrception/\* which is now published).
5. **Attempt to publish purrpose packages** — publish all 3 packages. If the reverse edge causes failures, document and continue.
6. **Verify publication** — confirm each package is available on npm with `npm view {package} version`.

## Known Blockers

- **npm 2FA requirement:** npm publish requires a one-time password (OTP) for accounts with 2FA enabled. The worker cannot provide this interactively. If `npm publish` fails with `EOTP`, the worker should:
  1. Document the packages that need to be published.
  2. REPORT A BLOCKER with the list of packages and the command the user needs to run manually: `npm publish --access public --otp={code}` for each package.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Known Blockers

- **npm 2FA requirement:** npm publish requires a one-time password (OTP) for accounts with 2FA enabled. The worker cannot provide this interactively. If `npm publish` fails with `EOTP`, the worker should:
  1. Document the packages that need to be published.
  2. REPORT A BLOCKER with the list of packages and the command the user needs to run manually: `npm publish --access public --otp={code}` for each package.

## Rules to Report".

- RULE: Do NOT use `--no-verify` for commits in the family repos unless absolutely necessary (the pre-commit should pass).
- RULE: If npm authentication fails, REPORT A BLOCKER immediately.
- RULE: If purrpose publish fails due to the reverse edge, document the failure and continue — do not REPORT A BLOCKER for this specific case.

## Workflow

You are going to perform a series of steps and check status after each one.

- Step 1. Verify npm authentication
- Step 2. Publish purrception packages
- Step 3. Publish artificial packages
- Step 4. Publish purrtrait packages
- Step 5. Attempt to publish purrpose packages
- Step 6. Verify all packages are published

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm whoami` to verify npm authentication.
- Execute `npm view {package} version` to verify each package is published.

## Step 1/6 — Verify npm authentication

**Goal:** Ensure you are authenticated to npm before attempting to publish.

**Instructions:**

1. Navigate to any family repository: `cd repos/purrception`.
2. Run `npm whoami` to check authentication.
3. If not authenticated, run `npm login` and follow the prompts.
4. If authentication fails or you cannot authenticate, REPORT A BLOCKER.

**Extra validation commands:**

- `npm whoami` should return a valid username.

## Step 2/6 — Publish purrception packages

**Goal:** Publish all 4 purrception packages to npm.

**Instructions:**

1. Navigate to the purrception repository: `cd repos/purrception`.
2. Publish packages in dependency order:
   - `cd libs/primitives && npm publish --access public && cd ../..`
   - `cd libs/lang-ts && npm publish --access public && cd ../..`
   - `cd cli/source-fs && npm publish --access public && cd ../..`
   - `cd cli/lang-ts-extract && npm publish --access public && cd ../..`
3. If any version already exists on npm, the publish will fail — this is acceptable, move to the next package.
4. If there are other errors (e.g., missing files, invalid package.json), inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @purrception/primitives version` should return `0.0.11` (or the published version).
- `npm view @purrception/lang-ts version` should return `0.0.11` (or the published version).
- `npm view @purrception/source-fs version` should return `0.0.11` (or the published version).
- `npm view @purrception/lang-ts-extract version` should return `0.0.11` (or the published version).

## Step 3/6 — Publish artificial packages

**Goal:** Publish all 11 artificial packages to npm.

**Instructions:**

1. Navigate to the artificial repository: `cd repos/artificial`.
2. Publish all packages (no internal dependencies, can be published in any order):
   - `cd art-js/spec && npm publish --access public && cd ../..`
   - `cd art-js/libs/primitives && npm publish --access public && cd ../../..`
   - `cd art-js/libs/parser && npm publish --access public && cd ../../..`
   - `cd art-js/libs/validator && npm publish --access public && cd ../../..`
   - `cd art-js/libs/bundler && npm publish --access public && cd ../../..`
   - `cd art-js/libs/program && npm publish --access public && cd ../../..`
   - `cd art-js/cli/bin && npm publish --access public && cd ../../..`
   - `cd art-js/cli/dev-server && npm publish --access public && cd ../../..`
   - `cd art-js/cli/watcher && npm publish --access public && cd ../../..`
   - `cd art-js/cli/poc-parse && npm publish --access public && cd ../../..`
   - `cd artisans/apps/art-mantras && npm publish --access public && cd ../../..`
3. If any version already exists on npm, the publish will fail — this is acceptable, move to the next package.
4. If there are other errors, inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @art-js/artificials-spec version` should return `0.0.1` (or the published version).
- (Verify all 11 packages similarly)

## Step 4/6 — Publish purrtrait packages

**Goal:** Publish all 5 purrtrait packages to npm.

**Instructions:**

1. Navigate to the purrtrait repository: `cd repos/purrtrait`.
2. Publish all packages (depends on @purrception/\* which is now published):
   - `cd libs/lang-ts && npm publish --access public && cd ../..`
   - `cd libs/code-renderer && npm publish --access public && cd ../..`
   - `cd libs/solid-code && npm publish --access public && cd ../..`
   - `cd libs/view-tsx && npm publish --access public && cd ../..`
   - `cd libs/client-tsx && npm publish --access public && cd ../..`
3. If any version already exists on npm, the publish will fail — this is acceptable, move to the next package.
4. If there are other errors, inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @purrtrait/lang-ts version` should return `0.0.11` (or the published version).
- (Verify all 5 packages similarly)

## Step 5/6 — Attempt to publish purrpose packages

**Goal:** Attempt to publish all 3 purrpose packages to npm.

**Instructions:**

1. Navigate to the purrpose repository: `cd repos/purrpose`.
2. **IMPORTANT:** purrpose has a reverse edge dependency on `@no-comply/solid-primitives` via temporary `file:` resolution. This may cause npm publish to fail.
3. Attempt to publish all packages:
   - `cd libs/client-babel && npm publish --access public && cd ../..`
   - `cd libs/client-babel-preset-solidjs && npm publish --access public && cd ../..`
   - `cd libs/solid-shiki-service && npm publish --access public && cd ../..`
4. If any publish fails due to the reverse edge or `file:` dependency, **document the failure and continue** — do not REPORT A BLOCKER.
5. If there are other errors (not related to the reverse edge), inspect and fix them before retrying.

**Extra validation commands:**

- `npm view @purrpose/client-babel version` should return `0.0.11` (or the published version) if successful.
- (Verify all 3 packages similarly, noting any failures)

## Step 6/6 — Verify all packages are published

**Goal:** Confirm all successfully published packages are available on npm.

**Instructions:**

1. For each package that was successfully published in steps 2-5, run `npm view {package} version` and verify it returns a version.
2. Document which packages were successfully published and which failed (if any).
3. If purrpose packages failed due to the reverse edge, this is expected and acceptable.

**Extra validation commands:**

- All successfully published packages should return version numbers from `npm view`.

## Final Verification

**Sanity check**

Confirm that all family packages (except possibly purrpose) are now available on npm and can be installed by consumers. This enables the publish-then-symlink pattern for cross-repo dependencies and unblocks the next steps in the plan.

**Verification steps**

- Execute `npm view @purrception/primitives version` to verify purrception is published.
- Execute `npm view @art-js/artificials-spec version` to verify artificial is published.
- Execute `npm view @purrtrait/lang-ts version` to verify purrtrait is published.
- Execute `npm view @purrpose/client-babel version` to verify purrpose is published (if successful).
- Optionally, create a scratch directory and run `npm init -y && npm install @purrception/primitives @art-js/artificials-spec @purrtrait/lang-ts` to verify packages can be installed together.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `ops/_backlog/plan-workspace-split/instructions/publish-all-families__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `publish-all-families`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
