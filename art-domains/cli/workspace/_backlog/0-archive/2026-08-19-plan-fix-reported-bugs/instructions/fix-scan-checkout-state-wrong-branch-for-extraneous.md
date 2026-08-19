# Instructions: `fix(workspace-cli): skip wrong-branch check when expected branch is empty`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-scan-checkout-state-wrong-branch-for-extraneous`

**Commit.message:** `fix(workspace-cli): skip wrong-branch check when expected branch is empty`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-scan-checkout-state-wrong-branch-for-extraneous`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Extraneous checkouts always trigger a "wrong branch" issue because `scanCheckoutState` compares the actual branch against an empty string (`record.branch` is `''` for extraneous entries), which always differs. This fix guards the "wrong branch" check so it only fires when `checkout.record.branch` is non-empty.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/_pseudo.md` → `### Function: scanCheckoutState` — how checkout state is computed.
- `$PROJECT/architecture/context-model.md` — `CheckoutStore`, `Checkout`, scanning.
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

- In `src/private/scan/scanCheckoutState.ts`, guard the "wrong branch" check so it only fires when `checkout.record.branch` is non-empty.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Guard the wrong-branch check in scanCheckoutState
2. Step 2. Add test for empty record branch

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

### Step `1/2` — Guard the wrong-branch check in scanCheckoutState

**Goal:** Add a guard so the "wrong branch" check only fires when `checkout.record.branch` is non-empty.

**Preparatory instructions:** Read `src/private/scan/scanCheckoutState.ts` to find the "wrong branch" issue check (around line 67).

**Detailed execution instructions:**

1. In `src/private/scan/scanCheckoutState.ts`, locate the issue check:
   ```
   if not updated.detached and updated.branch !== updated.record.branch:
     updated.issues.push("wrong branch")
   ```
2. Add a guard: `checkout.record.branch !== ''` (or `checkout.record.branch` is truthy):
   ```
   if not updated.detached and checkout.record.branch !== '' and updated.branch !== updated.record.branch:
     updated.issues.push("wrong branch")
   ```

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/2` — Add test for empty record branch

**Goal:** Verify that `scanCheckoutState` does not add "wrong branch" when the record branch is empty.

**Preparatory instructions:** Read `src/private/scan/scanCheckoutState.test.ts` to understand existing test patterns.

**Detailed execution instructions:**

1. Add a test case in `src/private/scan/scanCheckoutState.test.ts`:
   - Construct a `Checkout` with `record.branch: ''` and `repo: undefined`.
   - Mock git introspection to return actual branch `main`.
   - Run `scanCheckoutState` and assert:
     - `issues` contains `unknown project`.
     - `issues` does NOT contain `wrong branch`.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that a checkout with `record.branch: ''` does NOT get `wrong branch`.
- Verify that a checkout with `record.branch: 'main'` and actual branch `develop` still gets `wrong branch`.
- Verify that a checkout with `record.branch: 'main'` and actual branch `main` does NOT get `wrong branch`.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-scan-checkout-state-wrong-branch-for-extraneous__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-scan-checkout-state-wrong-branch-for-extraneous`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
