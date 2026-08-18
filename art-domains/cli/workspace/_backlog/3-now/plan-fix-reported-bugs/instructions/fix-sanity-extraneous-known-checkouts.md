# Instructions: `fix(workspace-cli): skip known checkouts in extraneous scan`

**Plan:** `fix-reported-bugs`

**Commit.id:** `fix-sanity-extraneous-known-checkouts`

**Commit.message:** `fix(workspace-cli): skip known checkouts in extraneous scan`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-sanity-extraneous-known-checkouts`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

`sanity` marks newly cloned checkouts as extraneous because `scanExtraneousCheckouts` scans all directories under `repos/` without cross-referencing the checkout store for known locations. This fix ensures known checkouts are filtered out of the extraneous list.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace principles, NFRs, milestones.
- `$PROJECT/architecture/commands.md` → `## Sanity` — designed behaviour and BDD scenarios.
- `$PROJECT/architecture/_pseudo.md` → `### Function: scanExtraneousCheckouts` — the pseudo-code for extraneous scanning.
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

- In `src/commands/sanity/private/scanExtraneousCheckouts.ts`, accept the `CheckoutStore` (or a set of known locations) as a second parameter.
- Before adding a directory to the extraneous list, check `store.getCheckoutForLocation(location)` — skip directories that already have a store record.
- In `src/commands/sanity/runSanity.ts`, pass `ctx.store` to `scanExtraneousCheckouts`.
- Add test coverage for this edge case.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Add store parameter to scanExtraneousCheckouts and filter known locations
2. Step 2. Update runSanity to pass ctx.store
3. Step 3. Add test for known checkout filtering

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

### Step `1/3` — Add store parameter to scanExtraneousCheckouts and filter known locations

**Goal:** Modify `scanExtraneousCheckouts` to accept a store parameter and filter out known checkouts.

**Preparatory instructions:** Read `src/commands/sanity/private/scanExtraneousCheckouts.ts` to understand the current function signature and logic.

**Detailed execution instructions:**

1. In `src/commands/sanity/private/scanExtraneousCheckouts.ts`:
   - Add a second parameter: `store: CheckoutStore` (or `knownLocations: Set<string>`).
   - After creating each `extraneousCheckout`, before adding to the result:
     - Check `store.getCheckoutForLocation(location)`.
     - If a match is found, skip this directory (do not add to result).

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `2/3` — Update runSanity to pass ctx.store

**Goal:** Update the call site in `runSanity.ts` to pass `ctx.store` to `scanExtraneousCheckouts`.

**Preparatory instructions:** Read `src/commands/sanity/runSanity.ts` to find the call to `scanExtraneousCheckouts`.

**Detailed execution instructions:**

1. In `src/commands/sanity/runSanity.ts`:
   - Update the call to `scanExtraneousCheckouts(ctx.config)` to `scanExtraneousCheckouts(ctx.config, ctx.store)`.

**Extra validation commands:**

```bash
npm run lint
npm run build
```

### Step `3/3` — Add test for known checkout filtering

**Goal:** Verify that `scanExtraneousCheckouts` does not flag known checkouts as extraneous.

**Preparatory instructions:** Read `src/commands/sanity/private/scanExtraneousCheckouts.test.ts` to understand existing test patterns.

**Detailed execution instructions:**

1. Add a test case in `src/commands/sanity/private/scanExtraneousCheckouts.test.ts`:
   - Create a config with a known checkout location in the store.
   - Create a matching directory under `repos/`.
   - Call `scanExtraneousCheckouts` and assert the result is an empty list.

A TEST SHOULD BE CREATED to cover this edge case if found valuable.

**Extra validation commands:**

```bash
npm run test
```

## Final Verification

**Sanity check:**

- Verify that known checkouts are not flagged as extraneous.
- Verify that unknown directories are still flagged as extraneous.
- Verify that store records without matching directories are not scanned.

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
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-fix-reported-bugs/instructions/fix-sanity-extraneous-known-checkouts__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-sanity-extraneous-known-checkouts`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
