# Instructions: `fix(workspace-cli): log failure when clone refuses extraneous directory`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-clone-refuses-extraneous-no-failure-logged`

**Commit.message:** `fix(workspace-cli): log failure when clone refuses extraneous directory`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-clone-refuses-extraneous-no-failure-logged`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

When `clone` refuses because the target directory already exists, no failure operation is logged to the operations log. This fix ensures a clone failure operation is recorded so the Operations Report reflects the refusal.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/commands.md` → `## Clone` — designed behaviour, BDD scenarios, and edge cases.
- `$PROJECT/architecture/_pseudo.md` → `### Command: clone` — the pseudo-code for cloneSpecific.
- `$PROJECT/architecture/operations-log.md` — how operations are logged.
- `$PROJECT/architecture/context-model.md` — `WorkspaceContext`, `OperationsLog`.
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

- In `cloneSpecific`, when the clone operation refuses because the target directory already exists, log a clone failure operation using `createCloneFailure`.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Log failure operation on directory-exists refusal
2. Step 2. Add test for clone failure logging on refusal

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

### Step `1/2` — Log failure operation on directory-exists refusal

**Goal:** When `clone` refuses because the target directory exists, log a `createCloneFailure` operation.

**Preparatory instructions:** Read `src/commands/clone/cloneSpecific.ts` to understand the current refusal logic. Read `src/private/operations/` to find the `createCloneFailure` factory.

**Detailed execution instructions:**

1. In `src/commands/clone/cloneSpecific.ts`, at the point where the clone refuses because the target directory already exists:
   - Call `ctx.log.log(createCloneFailure(checkout, "directory already exists at {targetDir}"))` before returning.
   - Ensure the checkout parameter is the one being refused (or `undefined` if the checkout hasn't been created yet).

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/2` — Add test for clone failure logging on refusal

**Goal:** Verify that a clone failure operation is logged when the clone refuses due to an existing directory.

**Preparatory instructions:** Read `src/commands/clone/cloneSpecific.test.ts` to understand existing test patterns.

**Detailed execution instructions:**

1. Add a test case in `src/commands/clone/cloneSpecific.test.ts`:
   - Mock a target directory that already exists on disk.
   - Call `cloneSpecific` with a repo and that location.
   - Assert that a clone failure operation is logged with a message about the directory already existing.
   - Assert that the Operations Report contains this failure.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that when clone refuses due to existing directory, a failure operation is logged.
- Verify that the failure operation appears in the Operations Report.
- Verify that successful clones still log success operations.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-clone-refuses-extraneous-no-failure-logged__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-clone-refuses-extraneous-no-failure-logged`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
