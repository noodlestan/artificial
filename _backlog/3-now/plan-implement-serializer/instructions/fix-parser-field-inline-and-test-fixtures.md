# Instructions: `fix(md-art-roundtrip): add FieldInline construct and fix test fixture comparison`

**Plan:** `implement-serializer`

**Commit.id:** `fix-parser-field-inline-and-test-fixtures`

**Commit.message:** `fix(md-art-roundtrip): add FieldInline construct and fix test fixture comparison`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.
- RULE: DO NOT modify files under `scripts/` or existing test fixtures under `test/fixtures/`. The test infrastructure is shared and stable; changes here affect all future work.

## Path Variables

| Variable              | Resolved Path                                 | Purpose                 |
| --------------------- | --------------------------------------------- | ----------------------- |
| `$PROJECT`            | `$WORKSPACE/repos/artificial-parser-planning` | project repository root |
| `$PACKAGE_PARSER`     | `$PROJECT/art-js/libs/parser/`                | Parser package          |
| `$PACKAGE_CONSTRUCTS` | `$PROJECT/art-js/libs/constructs/`            | Constructs package      |
| `$PACKAGE_SERIALIZER` | `$PROJECT/art-js/libs/serializer/`            | Serializer package      |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `fix-parser-field-inline-and-test-fixtures`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

This iteration addresses the root cause of roundtrip diffs across all fixtures. The parser currently treats all field values as flat `NaturalBlock` arrays, losing whether content starts on the same line as the field name. This forces the serializer to guess, causing incorrect roundtrip output.

**Primary goals:**

1. Add `FieldInline` construct to parser to capture inline field content.
2. ~~Fix `test-parser.ts` to compare snapshots in memory instead of writing `.art.json` files.~~ ✅ DONE — snapshots compared in memory via `stableStringify` with custom field ordering.
3. Update test fixture snapshots to match new parser output.
4. Streamline serializer to use `FieldInline` metadata for correct rendering.

**Insight from pairing session:** The parser gap is the root cause. The serializer fixes in `serializer-wip` branch are workarounds. The real fix is parser-side.

## Test Infrastructure

The test suite is split into two scripts, each with its own extracted modules:

- `npm run test-parser` — parses fixtures, compares snapshots in memory, writes snapshots with `--write`.
- `npm run test-serializer` — serializes snapshots, diffs against source markdown, reports roundtrip overhead.

**Key flags:**

| Flag                   | Script          | Purpose                                                                  |
| ---------------------- | --------------- | ------------------------------------------------------------------------ |
| `--write`              | test-parser     | Regenerate `.art.json` / `.md.json` snapshots from current parser output |
| `--fixture {name}`     | both            | Scope to a single fixture (partial match)                                |
| `--debug-write-result` | test-serializer | Write `{fixture}.parsed.md` for visual diff comparison                   |

**Important notes:**

- `test-serializer` currently does NOT return a non-zero exit code on roundtrip diffs in order to block progress. Check the last line for `"N snapshot check(s) failed"`. But this iteration will only be complete when diff is zero and the non-zero exit code is return for failures.
- To test a single fixture end-to-end: create a minimal `.md` file in `test/fixtures/`, run `npm run test-parser -- --fixture {name} --write` to generate its snapshot, then `npm run test-serializer -- --fixture {name}` to verify roundtrip.
- To inspect a roundtrip diff: `npm run test-serializer -- --fixture {name} --debug-write-result` writes `{name}.parsed.md` next to the snapshot for side-by-side comparison.

## Mandatory Reading

- Pairing notes: `$PACKAGE_PARSER/_pairing_notes.md` — detailed analysis of roundtrip diffs and proposed solutions.
- Architecture: `$PROJECT/architecture/index.md` — artificial ecosystem overview.
- Fixture suite: `$PACKAGE_PARSER/test/fixtures/` — fixture inputs and snapshots.

## Setup

Run from `$PROJECT` repository directory:

```bash
npm ci # to install dependencies.
```

## Changes

This iteration makes changes across three packages:

### Step 1: Add FieldInline Construct to Parser

**Goal:** Distinguish inline vs block field content in the parser AST.

**Changes:**

1. Create `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/` directory with:
   - `FieldInline.ts` — AST node type definition
   - `createFieldInlineMatcher.ts` — matcher function
   - `createFieldInlineToMdast.ts` — toMdast converter
   - `index.ts` — exports

2. Update `$PACKAGE_CONSTRUCTS/src/constructs/types.ts`:
   - Add `FieldInline` to the construct types
   - Ensure `FieldInline` and `FieldBlock` are mutually exclusive

3. Update `$PACKAGE_CONSTRUCTS/src/index.ts`:
   - Export `FieldInline` construct

4. Update parser to use `FieldInline` when content starts on the same line as field name.

### Step 2: Fix Test Script to Compare In Memory

**Goal:** Stop writing `.art.json` files; compare snapshots in memory.

**Changes:**

1. Update `$PACKAGE_PARSER/scripts/test-parser.ts`:
   - Read existing `.md.json` or `.art.json` files as expected output
   - Compare parsed output with expected output in memory
   - Mark errors if they don't match
   - Remove the file-writing logic (lines 61-70)

2. Clean up untracked `.art.json` files:
   ```bash
   rm test/fixtures/*.art.json
   ```

### Step 3: Update Test Fixture Snapshots

**Goal:** Regenerate snapshots to match new parser output with FieldInline.

**Changes:**

1. Run test script with `--write` flag to regenerate snapshots
2. Review diffs to ensure FieldInline is correctly captured
3. Commit updated snapshots

### Step 4: Streamline Serializer

**Goal:** Simplify serializer by using FieldInline metadata.

**Changes:**

1. Update `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockToMdast.ts`:
   - Remove inline content guessing logic
   - FieldBlock now only handles block content

2. Update `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/` (new):
   - Implement `toMdast` for inline fields
   - Render as `**Field:** inline content`

3. Verify serializer roundtrip with updated constructs.

## Workflow

You are going to perform a series of steps and check status after each one.

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

### Rules

- RULE: You are FORBIDDEN from return to a previous step.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Step Verification

## Verification

This section provides the verification commands to validate changes made by this instruction.

Run from `$PACKAGE_PARSER` package directory:

```bash
npm run test-parser # verify parser snapshot comparison passes
npm run test-serializer # verify serializer roundtrip (check last line for diff count)
```

Run from `$PACKAGE_CONSTRUCTS` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test at repository level
```

## Steps

### Step `1/4` — Add FieldInline Construct to Constructs Package

**Goal:** Create the FieldInline construct that captures inline field content.

**Preparatory instructions:**

1. Read `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/` to understand the existing FieldBlock structure.
2. Read `$PACKAGE_CONSTRUCTS/src/constructs/types.ts` to understand the construct type system.

**Detailed execution instructions:**

1. Create directory `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/`.

2. Create `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/FieldInline.ts`:

   ```typescript
   import type { ArtAstNode } from '../../types';

   export interface FieldInline extends ArtAstNode {
     type: 'fieldInline';
     name: string;
     value: string; // inline content (same line as field name)
   }
   ```

3. Create `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/createFieldInlineMatcher.ts`:
   - Match fields where content starts on the same line as `**Field:**`
   - Return `FieldInline` node with `name` and `value`

4. Create `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/createFieldInlineToMdast.ts`:
   - Convert `FieldInline` to mdast paragraph with strong node
   - Render as `**Field:** inline content`

5. Create `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/index.ts`:

   ```typescript
   export { FieldInline } from './FieldInline';
   export { createFieldInlineMatcher } from './createFieldInlineMatcher';
   export { createFieldInlineToMdast } from './createFieldInlineToMdast';
   ```

6. Update `$PACKAGE_CONSTRUCTS/src/constructs/types.ts`:
   - Add `FieldInline` to the union type
   - Ensure `FieldInline` and `FieldBlock` are mutually exclusive

7. Update `$PACKAGE_CONSTRUCTS/src/index.ts`:
   - Export `FieldInline` construct

**Extra validation commands:**

```bash
cd $PACKAGE_CONSTRUCTS && npm run build
```

### Step `2/4` — Update Parser to Use FieldInline

**Goal:** Make parser distinguish inline vs block field content.

**Preparatory instructions:**

1. Read `$PACKAGE_PARSER/src/` to understand parser structure.
2. Read `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockMatcher.ts` to understand field matching.

**Detailed execution instructions:**

1. Update parser field matching logic:
   - When field content starts on the same line as `**Field:**`, create `FieldInline` node
   - When field content starts on next line, create `FieldBlock` node

2. Update parser imports to include `FieldInline`.

3. Ensure `FieldInline` and `FieldBlock` are mutually exclusive.

**Extra validation commands:**

```bash
cd $PACKAGE_PARSER && npm run build
```

### Step `3/4` — Regenerate Snapshots and Verify

**Goal:** After parser changes, regenerate snapshots and verify serializer roundtrip.

**Preparatory instructions:**

1. Read `$PACKAGE_PARSER/scripts/test-parser.ts` to understand the snapshot comparison logic.

**Detailed execution instructions:**

1. Regenerate snapshots to capture the new FieldInline output:

   ```bash
   cd $PACKAGE_PARSER && npm run test-parser -- --write
   ```

2. Verify parser tests pass against the new snapshots:

   ```bash
   npm run test-parser
   ```

3. Check serializer roundtrip status:

   ```bash
   npm run test-serializer
   ```

   The last line reports the number of fixtures with roundtrip diffs. This is informational (not a failure). Note the count before and after Step 4.

4. To inspect a specific fixture's roundtrip diff:

   ```bash
   npm run test-serializer -- --fixture {name} --debug-write-result
   ```

   This writes `{name}.parsed.md` next to the snapshot for side-by-side comparison with the source.

5. To create a minimal test fixture for validation:

   - Create a new `.md` file in `$PACKAGE_PARSER/test/fixtures/` with minimal markdown (e.g., a heading, a field with inline content, a field with block content).
   - Run `npm run test-parser -- --fixture {filename} --write` to generate its snapshot.
   - Run `npm run test-serializer -- --fixture {filename}` to verify roundtrip.
   - Run `npm run test-serializer -- --fixture {filename} --debug-write-result` to inspect the diff.

**Extra validation commands:**

```bash
cd $PACKAGE_PARSER && npm run test-parser
cd $PACKAGE_PARSER && npm run test-serializer
git status # verify no untracked .art.json files
```

### Step `4/4` — Streamline Serializer and Verify Roundtrip

**Goal:** Simplify serializer by using FieldInline metadata.

**Preparatory instructions:**

1. Read `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockToMdast.ts` to understand current implementation.
2. Read `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/createFieldInlineToMdast.ts` (created in step 1).

**Detailed execution instructions:**

1. Update `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockToMdast.ts`:
   - Remove inline content guessing logic
   - FieldBlock now only handles block content

2. Verify serializer roundtrip with updated constructs:

   ```bash
   cd $PACKAGE_PARSER && npm run test-serializer
   ```

   Check the last line — the number of snapshot check failures should decrease compared to the count noted in Step 3.

3. To inspect remaining diffs:

   ```bash
   npm run test-serializer -- --debug-write-result
   ```

   This writes `.parsed.md` files for all fixtures with roundtrip diffs.

**Extra validation commands:**

```bash
cd $PACKAGE_PARSER && npm run test-serializer
cd $PACKAGE_CONSTRUCTS && npm run test
```

## Final Verification

**Sanity check:**

1. Verify no untracked `.art.json` files remain:

   ```bash
   git status
   ```

2. Verify parser tests pass:

   ```bash
   cd $PACKAGE_PARSER && npm run test-parser
   ```

3. Verify serializer roundtrip — check last line for diff count (informational, not a failure):

   ```bash
   cd $PACKAGE_PARSER && npm run test-serializer
   ```

4. Verify constructs package builds and tests pass:
   ```bash
   cd $PACKAGE_CONSTRUCTS && npm run lint && npm run build && npm run test
   ```

**Verification:**

Run from `$PACKAGE_PARSER` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test-parser
npm run test-serializer # check last line for diff count
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test at repository level
```

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-implement-serializer/instructions/fix-parser-field-inline-and-test-fixtures__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `fix-parser-field-inline-and-test-fixtures`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
