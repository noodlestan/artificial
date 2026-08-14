# Implementation Instructions

**Plan:** `implement-command-repo`

**commit.Id:** `fix-repo-record-parsing`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md`) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `repo-record-parsing`, created `record parsing fix and kind field`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Fix record parsing issues in the workspace CLI and add `kind` field to all record types. The current implementation has bugs in namespace parsing and is missing the `kind` field which is needed for proper record identification.

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

1. Step 1. Add kind field to record types
2. Step 2. Fix namespace parsing
3. Step 3. Update record parsing functions
4. Step 4. Update test helpers
5. Step 5. Update all tests
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

- Add `kind` field to `ProjectRecord`, `NamespaceRecord`, `PackageRecord` types in `src/private/records/types.ts` (in step 1)
- Fix `readProjectRecord` to parse multi-line namespace lists and strip prefix (in step 2)
- Update `readProjectRecord`, `readNamespaceRecord`, `readPackageRecord` to populate `kind` field (in step 3)
- Update `writeProjectRecord`, `writeNamespaceRecord`, `writePackageRecord` test helpers (in step 4)
- Update all tests to assert `kind` field (in step 5)

## Step Instructions

### Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

### Step 1/6 — Add kind field to record types

**Goal:** Add `kind` field to all record types.

**Instructions:**

1. Update `src/private/records/types.ts` to add `kind` field to all record types:

   ```typescript
   export interface ProjectRecord {
     kind: 'project';
     name: string;
     path: string;
     namespaceNames: string[];
   }

   export interface NamespaceRecord {
     kind: 'namespace';
     name: string;
     path: string;
     packageNames: string[];
   }

   export interface PackageRecord {
     kind: 'package';
     name: string;
     canonicalName: string;
     path: string;
   }
   ```

**Extra Verification commands:**

- Execute `npm run lint` in `$PROJECT` to verify types compile

### Step 2/6 — Fix namespace parsing

**Goal:** Fix the regex to parse multi-line namespace lists and strip prefix.

**Instructions:**

1. Update `src/private/records/project/readProjectRecord.ts`:
   - Change regex to capture multi-line lists: `/\*\*Namespaces:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/`
   - Parse each line to extract namespace names
   - Strip `- Namespace: ` prefix from each name
   - Example:
     ```typescript
     const namespacesMatch = content.match(/\*\*Namespaces:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/);
     if (namespacesMatch) {
       namespaceNames = namespacesMatch[1]
         .split('\n')
         .map(line => line.replace(/^-\s*Namespace:\s*/, '').trim())
         .filter(Boolean);
     }
     ```

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify namespace parsing works

### Step 3/6 — Update record parsing functions

**Goal:** Update parsing functions to populate `kind` field.

**Instructions:**

1. Update `src/private/records/project/readProjectRecord.ts`:
   - Add `kind: 'project'` to the returned object
2. Update `src/private/records/namespace/readNamespaceRecord.ts`:
   - Add `kind: 'namespace'` to the returned object
3. Update `src/private/records/package/readPackageRecord.ts`:
   - Add `kind: 'package'` to the returned object

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify kind field is populated

### Step 4/6 — Update test helpers

**Goal:** Update test helpers to include `kind` field.

**Instructions:**

1. Update `src/test/writeProjectRecord.ts`:
   - Add `kind: 'project'` to the generated record
2. Update `src/test/writeNamespaceRecord.ts`:
   - Add `kind: 'namespace'` to the generated record
3. Update `src/test/writePackageRecord.ts`:
   - Add `kind: 'package'` to the generated record

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify test helpers work

### Step 5/6 — Update all tests

**Goal:** Update all tests to assert `kind` field.

**Instructions:**

1. Update all existing tests to include `kind` field in assertions
2. Run all tests to verify everything passes

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify all tests pass

### Step 6/6 — Verify all tests pass

**Goal:** Ensure all tests are updated and passing.

**Instructions:**

1. Run all tests to verify everything passes
2. Verify that `kind` field is present in all record types
3. Verify that namespace parsing works correctly

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

- The `kind` field is present on all record types
- Namespace parsing works correctly with multi-line lists
- Namespace names are stripped of `- Namespace: ` prefix
- All tests pass
- The repo command works correctly without "unknown namespace" errors

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with `$WORKSPACE/.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `implement-command-repo/instructions/repo-record-parsing__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `repo-record-parsing`, created `record parsing fix and kind field`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
