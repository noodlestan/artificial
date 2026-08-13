# Implementation Instructions

**Plan:** `implement-command-repo`

**commit.Id:** `repo-test-coverage`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md`) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `repo-test-coverage`, created `repo command test coverage`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement the 35 missing tests for the repo command. Worker created test scaffolds with `it.todo()` but never implemented actual tests.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `$PROJECT/architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `$PROJECT/architecture/commands.md` — command surface and BDD scenarios (focus on Repo section)
- `$PROJECT/architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `$PROJECT/_guide.md` — setup and verification commands

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Read existing test scaffolds
2. Step 2. Implement repo command tests
3. Step 3. Implement record reading tests
4. Step 4. Implement graph consolidation tests
5. Step 5. Implement package state report tests
6. Step 6. Verify all tests pass

Execute all the steps autonomously, one by one, including running the **Verification commands** plus any _Verification command_ found at the end of the current step.

### Rules

- RULE: You are FORBIDDEN to return to a previous step.
- RULE: If a verification command reports errors not related to the scope of these instructions, STOP and report back the error, following the "## How to Report Back".
- RULE: If a verification command reports errors related to the scope of these instructions, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back the error, following the "## How to Report Back".
- RULE: Use existing test patterns from `src/commands/clone/` and `src/commands/branch/`.
- RULE: Use existing record patterns from `src/private/records/repository/` and `src/private/records/checkout/`.
- RULE: Use existing presentation patterns from `src/private/present/`.
- RULE: Each record reading function should follow the singular/plural pattern (e.g., `readProjectRecord` and `readProjectRecords`).

### Step Verification commands

After each step, run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Changes

- Implement 8 tests in `src/commands/repo/runRepo.test.ts` (in step 2)
- Implement 23 tests in `src/private/records/projectGraph/loadProjectGraph.test.ts` (in step 3-4)
- Implement 4 tests in `src/private/present/presentPackageStateReport.test.ts` (in step 5)

## Step Instructions

### Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

### Step 1/6 — Read existing test scaffolds

**Goal:** Understand the existing test scaffolds and patterns.

**Instructions:**

1. Read `src/commands/repo/runRepo.test.ts` to understand the 8 pending BDD scenario tests
2. Read `src/private/records/projectGraph/loadProjectGraph.test.ts` to understand the 23 pending record reading tests
3. Read `src/private/present/presentPackageStateReport.test.ts` to understand the 4 pending report tests
4. Read existing test patterns from `src/commands/clone/` and `src/commands/branch/` to understand conventions

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify test scaffolds compile

### Step 2/6 — Implement repo command tests

**Goal:** Implement the 8 BDD scenario tests for the repo command.

**Instructions:**

1. Read the BDD scenarios from `$PROJECT/architecture/commands.md` → Repo section
2. Implement each `it.todo()` test in `src/commands/repo/runRepo.test.ts`:
   - "lists a single checkout's packages"
   - "defaults to all checkouts when none specified"
   - "checkout has no project records"
   - "unknown checkout warns and skips"
   - "project references a missing namespace"
   - "namespace references a missing package"
   - "package path has no package.json"
   - "npm info fails"
3. Use existing test patterns from `src/commands/clone/runClone.test.ts`

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify repo command tests pass

### Step 3/6 — Implement record reading tests (project/namespace)

**Goal:** Implement the tests for project and namespace record reading functions.

**Instructions:**

1. Implement tests in `src/private/records/projectGraph/loadProjectGraph.test.ts`:
   - `readProjectRecord` tests (3 tests):
     - "parses a valid project record"
     - "returns null for a missing file"
     - "returns null for an invalid file"
   - `readProjectRecords` tests (3 tests):
     - "reads multiple project records from a directory"
     - "returns empty array for a missing directory"
     - "filters out invalid records"
   - `readNamespaceRecord` tests (3 tests):
     - "parses a valid namespace record"
     - "returns null for a missing file"
     - "returns null for an invalid file"
   - `readNamespaceRecords` tests (3 tests):
     - "reads multiple namespace records from a directory"
     - "returns empty array for a missing directory"
     - "filters out invalid records"
2. Use `writeProjectRecord` and `writeNamespaceRecord` test helpers to create test data

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify record reading tests pass

### Step 4/6 — Implement record reading tests (package) and graph consolidation

**Goal:** Implement the tests for package record reading and graph consolidation.

**Instructions:**

1. Implement tests in `src/private/records/projectGraph/loadProjectGraph.test.ts`:
   - `readPackageRecord` tests (3 tests):
     - "parses a valid package record"
     - "returns null for a missing file"
     - "returns null for an invalid file"
   - `readPackageRecords` tests (3 tests):
     - "reads multiple package records from a directory"
     - "returns empty array for a missing directory"
     - "filters out invalid records"
   - `consolidateProjectGraph` tests (4 tests):
     - "links projects to namespaces correctly"
     - "links namespaces to packages correctly"
     - "generates warnings for missing namespaces"
     - "generates warnings for missing packages"
   - `loadProjectGraph` tests (2 tests):
     - "loads a complete project graph"
     - "handles missing records directory"
2. Use `writePackageRecord` test helper to create test data

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify package and graph tests pass

### Step 5/6 — Implement package state report tests

**Goal:** Implement the tests for the package state report presenter.

**Instructions:**

1. Implement tests in `src/private/present/presentPackageStateReport.test.ts`:
   - "presents package state report with versions"
   - "handles missing version"
   - "handles missing published version"
   - "handles multiple states"
2. Use existing report test patterns from `src/private/present/presentCheckoutReport.test.ts`

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify report tests pass

### Step 6/6 — Verify all tests pass

**Goal:** Ensure all 35 tests are implemented and passing.

**Instructions:**

1. Run all tests to verify everything passes
2. Check that no `it.todo()` tests remain
3. Verify test coverage for repo command

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify all tests pass

### Final Verification

Run from this package directory:

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

All steps MUST pass. If any step fails, fix the issue before considering the task complete.

**Sanity check**

Verify that:

- All 35 `it.todo()` tests are now implemented
- All tests pass
- No `it.todo()` tests remain in the repo command test files
- Test coverage is complete for repo command core functions

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with `$WORKSPACE/.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `implement-command-repo/instructions/repo-test-coverage__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `repo-test-coverage`, created `repo command test coverage`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
