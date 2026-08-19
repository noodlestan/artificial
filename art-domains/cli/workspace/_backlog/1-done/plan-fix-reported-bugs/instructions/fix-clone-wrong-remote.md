# Instructions: `fix(workspace-cli): detect wrong remote in checkout scan`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-clone-wrong-remote`

**Commit.message:** `fix(workspace-cli): detect wrong remote in checkout scan`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-clone-wrong-remote`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Detect when a checkout's actual git remote differs from the repository remote declared in its record, surfacing a `wrong remote` issue in the Checkout Report. Currently, `repo` and `sanity` commands present the Checkout Report as if the checkout were fine even when the checkout is a clone of a different repository than the one recorded.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/commands.md` → `## Sanity` — designed behaviour and BDD scenarios.
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

- Add remote comparison logic in `scanCheckoutState` to compare the actual remote URL against the record's repository remote.
- When they differ, add a `wrong remote` issue to the checkout's issues list.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Add wrong remote detection to `scanCheckoutState`
2. Step 2. Add test for wrong remote detection

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

### Step `1/2` — Add wrong remote detection to `scanCheckoutState`

**Goal:** Guard the `scanCheckoutState` function to detect when the actual git remote URL differs from the record's repository remote.

**Preparatory instructions:** Read `src/private/scan/scanCheckoutState.ts` to understand the current issue detection logic.

**Detailed execution instructions:**

1. In `src/private/scan/scanCheckoutState.ts`, after the git state is read (branch, detached, conflicts, dirty, hasRemote):
   - If the checkout has a `repo` record with a `remote` field, and the actual remote URL differs from `repo.remote`, add `wrong remote` to `updated.issues`.
   - This check should only fire when `checkout.repo` is defined and `checkout.repo.remote` is non-empty.

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/2` — Add test for wrong remote detection

**Goal:** Verify that `scanCheckoutState` correctly surfaces `wrong remote` when the actual remote differs from the record.

**Preparatory instructions:** Read `src/private/scan/scanCheckoutState.test.ts` to understand existing test patterns.

**Detailed execution instructions:**

1. In `src/private/scan/scanCheckoutState.test.ts`, add a test case:
   - Construct a `Checkout` with `repo.remote` set to `git@github.com:noodlestan/foo.git`.
   - Mock the git introspection to return an actual remote of `git@github.com:noodlestan/bar.git`.
   - Run `scanCheckoutState` and assert that `issues` contains `wrong remote`.
   - Also add a test for the case where the remote matches — assert `wrong remote` is NOT in issues.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that `wrong remote` appears in issues when the actual remote differs from the record.
- Verify that `wrong remote` does NOT appear when the remote matches the record.
- Verify that existing `no remote` behaviour is unchanged.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-clone-wrong-remote__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-clone-wrong-remote`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
