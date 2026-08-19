# Instructions: `fix(workspace-cli): use recorded branch when cloning missing checkout`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-clone-ignores-record-branch`

**Commit.message:** `fix(workspace-cli): use recorded branch when cloning missing checkout`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-clone-ignores-record-branch`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

When cloning a missing checkout for an existing record, `cloneIfMissing` currently clones the default branch instead of the branch recorded, and overwrites the record's branch to `main`. This fix ensures the clone checks out the branch from the record, and the record's branch is preserved.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/commands.md` → `## Clone` — designed behaviour and BDD scenarios.
- `$PROJECT/architecture/_pseudo.md` → `### Function: cloneIfMissing` — the pseudo-code for cloning.
- `$PROJECT/architecture/context-model.md` — `CheckoutStore`, `Checkout`, `saveCheckoutRecord`.
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

- Modify `cloneIfMissing` to checkout the recorded branch after cloning.
- Update `saveCheckoutRecord` to preserve the record's branch when it matches, or reflect the actual branch when it differs.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Fix `cloneIfMissing` to use recorded branch
2. Step 2. Add test for cloneIfMissing branch behaviour

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

### Step `1/2` — Fix `cloneIfMissing` to use recorded branch

**Goal:** After cloning, check out the branch from `checkout.record.branch` instead of relying on the default branch.

**Preparatory instructions:** Read `src/commands/clone/private/cloneIfMissing.ts` to understand the current cloning logic.

**Detailed execution instructions:**

1. In `src/commands/clone/private/cloneIfMissing.ts`, after the `git clone` call:
   - Read `checkout.record.branch` before cloning.
   - After cloning, if the recorded branch exists on the remote, checkout that branch using `git.checkout(checkout.record.branch)`.
   - If the recorded branch does not exist on the remote, stay on the default branch.
   - Update `saveCheckoutRecord` to pass the actual branch on disk (from `getCurrentBranch`), not `actualBranch || 'main'`.

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/2` — Add test for cloneIfMissing branch behaviour

**Goal:** Verify that `cloneIfMissing` respects the recorded branch.

**Preparatory instructions:** Read existing test files in `src/commands/clone/` to understand test patterns.

**Detailed execution instructions:**

1. Add a test case (in `src/commands/clone/cloneIfMissing.test.ts` or a new test file if appropriate):
   - Mock a checkout record with a non-main branch (e.g., `feature-branch`).
   - Mock `git.clone` to simulate cloning the repo.
   - Mock `git.checkout` to verify the recorded branch is checked out.
   - Assert that `saveCheckoutRecord` is called with the correct branch.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that cloning a checkout with a recorded non-main branch lands on that branch.
- Verify that the record's branch is preserved after cloning.
- Verify that when the recorded branch doesn't exist on remote, the default branch is used and the record is updated.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-clone-ignores-record-branch__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-clone-ignores-record-branch`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
