# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `pre-roundtrip-validation`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `pre-roundtrip-validation`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Parse a real `.art` file from the corpus and verify the output structure matches expectations. This is a pre-roundtrip validation step to ensure the parser correctly classifies all constructs in a production-like art file before moving to the full roundtrip milestone.

## Mandatory Reading

- `art-js/cli/poc-parse/src/parse/types.ts` — core record schema (SectionBlock, FieldBlock, NaturalBlock, Tag)
- `art-js/cli/poc-parse/src/parse/builder.ts` — buildDocument entry point
- `art-js/cli/poc-parse/src/parse/index.ts` — public API and ParserConfig
- `architecture/records/adr/language.art` — target art file for parsing (real ADR with multiple sections, decisions, fields)

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Add a validation script that parses `architecture/records/adr/language.art` and verifies:

1. The file parses without errors
2. All sections are correctly classified as SectionBlock records
3. All decision fields (Status, Context, Decision, Consequences) are correctly classified as FieldBlock records
4. Natural language content is correctly classified as NaturalBlock records
5. The output structure matches the expected construct hierarchy

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Create validation script
Step 2. Run validation and inspect output
Step 3. Verify construct classification

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck
- Execute `npm run ci` in `art-js/cli/poc-parse/` to run full CI suite

## Steps

## Step `1 / 3` — Create validation script

Create a validation script at `art-js/cli/poc-parse/src/validate/pre-roundtrip.ts` that:

1. Imports `buildDocument` and `createDefaultConfig` from `../parse/index.js`
2. Reads the file `architecture/records/adr/language.art` (relative to repository root)
3. Parses the markdown content using `buildDocument(markdown, createDefaultConfig())`
4. Outputs the parsed Document as JSON to stdout

The script should be executable via `npx tsx src/validate/pre-roundtrip.ts` from the `art-js/cli/poc-parse/` directory.

**File structure:**

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildDocument, createDefaultConfig } from '../parse/index.js';

const repoRoot = join(__dirname, '../../../../..');
const artFile = join(repoRoot, 'architecture/records/adr/language.art');
const markdown = readFileSync(artFile, 'utf-8');
const config = createDefaultConfig();
const document = buildDocument(markdown, config);

console.log(JSON.stringify(document, null, 2));
```

## Step `2 / 3` — Run validation and inspect output

Execute the validation script:

```bash
cd art-js/cli/poc-parse
npx tsx src/validate/pre-roundtrip.ts
```

Inspect the JSON output and verify:

1. The output is a valid Document record with a `children` array
2. The top-level children are SectionBlock records (one per `## Decision:` heading)
3. Each SectionBlock has:
   - `kind: "Decision"` (or similar, matching the heading pattern)
   - `name: "{decision name}"` (e.g., "Language Spec First Scope", "Two Main Use Cases")
   - `children` array containing FieldBlock and NaturalBlock records
4. FieldBlock records have:
   - `kind: "Field"`
   - `name` matching the field name (e.g., "Status", "Context", "Decision", "Consequences")
   - `value` containing the field content
5. NaturalBlock records contain the prose content that doesn't match other constructs

Save the output to `art-js/cli/poc-parse/fixtures/language.art.json` for future regression testing.

**Extra validation commands:**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck

## Step `3 / 3` — Verify construct classification

Manually inspect the `language.art.json` output and verify:

1. **SectionBlock count**: Count the number of `## Decision:` headings in `language.art` and verify the JSON contains the same number of top-level SectionBlock records.

2. **FieldBlock classification**: For each SectionBlock, verify that:
   - `**Status:**` lines are classified as FieldBlock with `name: "Status"`
   - `**Context:**` lines are classified as FieldBlock with `name: "Context"`
   - `**Decision:**` lines are classified as FieldBlock with `name: "Decision"`
   - `**Consequences:**` lines are classified as FieldBlock with `name: "Consequences"`

3. **NaturalBlock catch-all**: Verify that prose content (paragraphs, lists) that doesn't match other constructs is classified as NaturalBlock.

4. **Position tracking**: Verify that all records have valid `position` fields with `start` and `end` points.

5. **No orphaned content**: Verify that all content from the original markdown is represented in the output (no content is lost).

Document any discrepancies or unexpected classifications in the report.

**Extra validation commands:**

- Execute `npm run ci` in `art-js/cli/poc-parse/` to run full CI suite

## Final Verification

**Sanity check**

The parser should correctly classify all constructs in a real production art file. If the output structure matches the expected hierarchy (SectionBlock → FieldBlock/NaturalBlock), the parser is ready for the full roundtrip milestone.

**Verification steps**

- Execute `npx tsx src/validate/pre-roundtrip.ts` in `art-js/cli/poc-parse/` to parse the art file
- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck
- Execute `npm run ci` in `art-js/cli/poc-parse/` to run full CI suite
- Verify the output JSON structure matches the expected construct hierarchy
- Verify all sections, fields, and natural content are correctly classified

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-poc-parse/instructions/pre-roundtrip-validation__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `pre-roundtrip-validation`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
