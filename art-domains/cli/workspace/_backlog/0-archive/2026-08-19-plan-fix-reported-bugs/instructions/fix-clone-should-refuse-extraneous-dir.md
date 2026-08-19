# Instructions: `fix(workspace-cli): refuse clone when target directory already exists`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-clone-should-refuse-extraneous-dir`

**Commit.message:** `fix(workspace-cli): refuse clone when target directory already exists`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-clone-should-refuse-extraneous-dir`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

`clone` currently creates a checkout even when the target directory already exists on disk, instead of refusing. This fix adds a directory existence check before checkout creation, preventing clone from overwriting an existing directory that may contain untracked work.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/commands.md` → `## Clone` — designed behaviour, BDD scenarios, and edge cases.
- `$PROJECT/architecture/_pseudo.md` → `### Command: clone` — the pseudo-code for cloneSpecific.
- `$PROJECT/architecture/context-model.md` — `CheckoutStore`, `Checkout`.
- `$WORKSPACE/.agents/domains/plans/definitions/index.md` — plan and instruction definitions.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Changes

- Add a directory existence check in `cloneSpecific` before creating a new checkout.
- When the target directory already exists, log a clone failure and refuse the operation.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Add directory existence check in cloneSpecific
2. Step 2. Add test for clone refusal when target dir exists

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

- RULE: You are FORBIDDEN from return to a previous step.

## Verification

Run from `$PROJECT` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

## Steps

### Step `1/2` — Add directory existence check in cloneSpecific

**Goal:** Before creating a new checkout, check if the target directory already exists on disk. If it does, log a clone failure and refuse the operation.

**Preparatory instructions:** Read `src/commands/clone/cloneSpecific.ts` to understand the current flow.

**Detailed execution instructions:**

1. In `src/commands/clone/cloneSpecific.ts`, after resolving the checkout location but before creating the checkout:
   - Compute the target directory path: `join(config.root.path, config.clone.path, location)`.
   - Check if the directory exists using `dirExists` or equivalent.
   - If it exists and is NOT the same checkout (idempotent case), log a clone failure with message `directory already exists at {targetDir}` and return.
   - If it exists and IS the same checkout (idempotent case), proceed as before (no-op).

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/2` — Add test for clone refusal when target dir exists

**Goal:** Verify that `clone` refuses when the target directory already exists.

**Preparatory instructions:** Read `src/commands/clone/cloneSpecific.test.ts` to understand existing test patterns.

**Detailed execution instructions:**

1. Add a test case in `src/commands/clone/cloneSpecific.test.ts`:
   - Mock a target directory that already exists on disk (not a checkout for the same repo).
   - Call `cloneSpecific` with a repo and that location.
   - Assert a clone failure is logged with a message about the directory already existing.
   - Assert no checkout is created.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that `clone Foo bar` refuses when `repos/bar` already exists and is not a checkout for `Foo`.
- Verify that `clone Foo foo` is idempotent when `repos/foo` already exists as a checkout for `Foo`.
- Verify that `clone Foo bar` proceeds normally when `repos/bar` does not exist.

**Verification:**

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

```bash
npm run ci
```

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-clone-should-refuse-extraneous-dir__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-clone-should-refuse-extraneous-dir`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
