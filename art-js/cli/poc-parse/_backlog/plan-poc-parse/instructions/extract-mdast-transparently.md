# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `extract-mdast-transparently`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `extract-mdast-transparently`, created `src/parse/builder.ts` + `src/parse/factory.ts`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

This is a **ruthless rewrite**. The current `builder.ts` and `factory.ts` implementation predates the plan and uses a different architecture (sectionStack/fieldStack approach). You will **delete all existing parser code** and rewrite from scratch based on the pseudo-code in `_pseudo.md`.

The target architecture is **context-aware visiting** with `createNestedContext`. The key principle is **mdast transparency**: NaturalBlock must copy ALL mdast node attributes, not just a curated subset.

The approach:

1. **Erase** the current `builder.ts` and `factory.ts` completely.
2. **Rewrite** from scratch following `_pseudo.md` exactly.
3. **Extend** `NaturalBlock` type to be transparent (copy all mdast attributes via spread).
4. **Verify** with lint and TC1 only — commit and call it done.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/art-js/cli/poc-parse/_pseudo.md` — **the source of truth** for the parser architecture. Follow it exactly.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — the record schema the builder must produce. You will extend `NaturalBlock` to be transparent.
- `repos/artificial/art-js/cli/poc-parse/_test.md` — test cases with expected output snippets. Focus on TC1 for verification.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Erase existing parser code

**Delete the contents of:**

- `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`
- `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`

Leave the files empty (or with a placeholder comment). You will rewrite them from scratch.

### Step 2 — Extend NaturalBlock type for transparency

Update `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts`:

1. Extend `NaturalBlock` to include all possible mdast node attributes. Use an index signature or explicit fields for common mdast properties:

   ```typescript
   export interface NaturalBlock extends RecordBase {
     construct: 'NaturalBlock';
     /** Raw markdown content (always present, lossless round-trip). */
     value: string;
     /** Parsed sub-records when the content is structured (e.g. list items). */
     children?: BlockContent[];
     /** mdast node type (e.g. 'paragraph', 'code', 'list', 'table'). */
     type?: string;
     /** Code language (for code blocks). */
     lang?: string | null;
     /** Code metadata (for code blocks). */
     meta?: string | null;
     /** Allow any other mdast attributes to pass through. */
     [key: string]: unknown;
   }
   ```

2. The index signature `[key: string]: unknown` ensures ALL mdast attributes are copied transparently.

### Step 3 — Rewrite factory.ts from pseudo

Create `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts` following `_pseudo.md` exactly:

1. **Define `VisitContext`** as in pseudo:

   ```typescript
   interface VisitContext {
     capturing(): string | undefined;
     target(): BlockContent[];
     push(record: Construct): void;
     close(): VisitContext | undefined;
     source: string;
     lastEnd: Point | undefined;
   }
   ```

2. **Implement `createNestedContext`** as in pseudo. Key behaviors:
   - Tags go to section, not children (in `push()`).
   - `capturing()` returns the construct type being collected.
   - `close()` returns the parent context.

3. **Implement `createDocumentContext`** as in pseudo.

4. **Implement factories** following pseudo:
   - `sectionBlockFactory` — detect heading, create SectionBlock with kind/name/tags.
   - `fieldBlockFactory` — detect strong with field pattern, create FieldBlock.
   - `tagFactory` — detect text with tag pattern, create Tag.
   - `naturalBlockFactory` — **transparent wrapper**: copy ALL mdast attributes using spread:

     ```typescript
     const block: NaturalBlock = {
       construct: 'NaturalBlock',
       ...node,  // copy ALL mdast attributes
       value: rawSlice(node, context),
       position: cleanPosition(node.position),
     };
     ```

5. **Implement helper functions** from pseudo:
   - `findParentSection(context)` — walk up context chain.
   - `sectionDepth(section)` — extract depth from position or track it.
   - `flushGap(context, start)` — emit NaturalBlock for source gaps.
   - `getFactory(node, context)` — return matching factory or null.

6. **Export `cleanPosition`** to strip internal mdast fields.

### Step 4 — Rewrite builder.ts from pseudo

Create `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` following `_pseudo.md` exactly:

1. **Implement `buildDocument(markdown: string): Document`** as in pseudo:
   - Parse markdown to mdast using `fromMarkdown`.
   - Create document context using `createDocumentContext`.
   - Visit each node using `visit(tree, node => visitNode(node, context))`.
   - Return document.

2. **Implement `visitNode(node, context)`** as in pseudo:
   - Skip `root` node.
   - Handle `paragraph` specially (call `visitParagraph`).
   - Try each factory in order (section → field → tag → null).
   - If factory found: create record, flush gap, handle transitions, update lastEnd.
   - If no factory: create NaturalBlock, flush gap, push to context, update lastEnd.

3. **Implement `visitParagraph(node, context)`** as in pseudo:
   - Check if paragraph starts with a field (strong with field pattern).
   - If yes: create FieldBlock, close previous field, push, start field capture.
   - If no: treat as NaturalBlock.

4. **Implement handlers** from pseudo:
   - `handleSectionBlock(record, node, context)` — close field, close sections at/above this depth, push, start section capture.
   - `handleFieldBlock(record, context)` — close previous field, push, start field capture.

### Step 5 — Update parse.ts

Update `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts` to import from the new builder. Keep the CLI entry point unchanged.

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts`. Do NOT touch `src/index.ts`, tsconfigs, or any other existing file.
- RULE: This is a ruthless rewrite. Do not try to preserve or adapt the old code. Delete it and rewrite from scratch based on `_pseudo.md`.
- RULE: NaturalBlock must be transparent. Use spread (`...node`) to copy ALL mdast attributes.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The parser has been ruthlessly rewritten from scratch based on `_pseudo.md`. NaturalBlock is transparent (copies ALL mdast attributes via spread). The context-aware visiting pattern with `createNestedContext` is implemented.

**Verification steps**

1. Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
2. Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors.
3. Execute `npx tsx src/parse/parse.ts fixtures/section-block.md` and check TC1 output:
   - Look for a SectionBlock with `kind: "Routine"` and `name: "List Tasks"`.
   - If TC1 is not fully verified (e.g. output structure differs), **commit anyway** and report findings.

**Commit and report**

- Stage all changes in `src/parse/`.
- Commit with message: `poc-parse: ruthless rewrite for mdast transparency`.
- Use `git commit --no-verify`.
- Report back even if TC1 is not fully verified. The goal is to land the rewrite; refinements come in the next iteration.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/plan-poc-parse/instructions/extract-mdast-transparently__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `extract-mdast-transparently`, created `src/parse/builder.ts` + `src/parse/factory.ts`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
