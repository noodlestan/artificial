# Instructions: `fix(workspace-cli): use correct name and path for custom location clone`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-clone-custom-location-wrong-name`

**Commit.message:** `fix(workspace-cli): use correct name and path for custom location clone`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-clone-custom-location-wrong-name`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

`clone <repo> <location>` currently produces the wrong checkout name and path — the name stays `Purrtrait` and the directory lands at the repo root instead of under `repos/`. This fix ensures the checkout name is `{repo} @ {location}` and the directory resolves to `repos/{location}` via `safePath`.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/commands.md` → `## Clone` — designed behaviour, BDD scenarios, and edge cases.
- `$PROJECT/architecture/_pseudo.md` → `### Command: clone` and `### Function: createCheckoutLocation` — pseudo-code for name and path computation.
- `$PROJECT/architecture/context-model.md` — `CheckoutStore`, `Checkout`, `createCheckout`.
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

- Fix the checkout name computation in `cloneSpecific` to use `{repo.name} @ {checkoutInput}` when a location is provided.
- Fix the checkout location/path computation to use `createCheckoutLocation(repo, checkoutInput)` which calls `safePath(target ? repo.name + " " + target : repo.name)`.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Fix checkout name and path computation for custom locations
2. Step 2. Add test for custom location clone naming

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

### Step `1/2` — Fix checkout name and path computation for custom locations

**Goal:** Ensure `clone Foo bar` produces checkout name `Foo @ bar` at path `repos/bar`.

**Preparatory instructions:** Read `src/commands/clone/cloneSpecific.ts` to understand the current name and path logic. Also read `src/commands/clone/private/cloneLocation.ts` (or wherever `createCheckoutLocation` is defined) to understand the location computation.

**Detailed execution instructions:**

1. In `src/commands/clone/cloneSpecific.ts`, when `checkoutInput` is provided:
   - Set the checkout name to `${repo.name} @ ${checkoutInput}` (not just `repo.name`).
   - Set the checkout location using `createCheckoutLocation(repo, checkoutInput)` which resolves to `safePath(repo.name + " " + checkoutInput)`.
   - Ensure `createCheckout` is called with the correct location so the path resolves to `join(config.root.path, config.clone.path, location)`.

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/2` — Add test for custom location clone naming

**Goal:** Verify that `clone <repo> <location>` produces the correct name and path.

**Preparatory instructions:** Read `src/commands/clone/cloneSpecific.test.ts` to understand existing test patterns.

**Detailed execution instructions:**

1. Add a test case in `src/commands/clone/cloneSpecific.test.ts`:
   - Call `cloneSpecific` with repo `Foo` and location `bar`.
   - Assert the checkout name is `Foo @ bar`.
   - Assert the checkout location resolves to `repos/bar` (via `safePath`).
   - Assert the checkout path is `join(config.root.path, config.clone.path, "bar")`.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that `clone Foo bar` creates checkout `Foo @ bar` at `repos/bar`.
- Verify that `clone Foo` (no location) creates checkout `Foo` at `repos/foo` (existing behaviour).
- Verify that `safePath` normalises the location correctly.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-clone-custom-location-wrong-name__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-clone-custom-location-wrong-name`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
