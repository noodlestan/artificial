# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `abstract-builder`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `abstract-builder`, renamed `visitChildren` → `shouldVisit`, restructured `visitNode`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

This iteration **abstracts the builder** to improve clarity and prepares for future construct encapsulation:

1. **Rename `visitChildren` → `shouldVisit`** — makes it clear whether the factory wants children to be visited.
2. **Restructure `visitNode`** — extract factory matching into `maybeHandleFactory` that returns `{ record, handler } | null`, enabling early return and clearer control flow.
3. **Rename `visitParagraph` → `handleBlock`** — since paragraphs are the default block handler in markdown, and this function handles field detection + natural block fallback.
4. **Rename inline node fallthrough to `handleNaturalBlock`** — the bottom of `visitNode` should be named clearly.
5. **Clarify inline node SKIP** — document why inline nodes return SKIP (we only visit block-level nodes).
6. **Move field detection into context** — the `handleBlock` function should call a context method `detectField(paragraph)` that returns `{ record, captured }` if the paragraph is a field, otherwise `null`. This moves field detection logic out of the visit function.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/art-js/cli/poc-parse/_pseudo.md` — the source of truth for the parser architecture.
- `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts` — current implementation to refactor.
- `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` — current implementation to refactor.
- `repos/artificial/art-js/cli/poc-parse/_test.md` — test cases with expected output snippets.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Rename `visitChildren` → `shouldVisit`

Update `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`:

1. In the `ConstructFactory` interface, rename `visitChildren: boolean` to `shouldVisit: boolean`.
2. Update all factories to use the new name.

Update `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`:

1. Update all usages of `factory.visitChildren` to `factory.shouldVisit`.

### Step 2 — Restructure `visitNode` with `maybeHandleFactory`

The current `visitNode` has scattered logic. Refactor to use a systematic approach:

1. Create a helper function `maybeHandleFactory` in `builder.ts`:

   ```typescript
   interface HandleResult {
     record: Construct;
     handler: ConstructHandler | null;
   }

   function maybeHandleFactory(
     node: MdastNode,
     context: VisitContext,
     handlers: ConstructHandler[],
   ): HandleResult | null {
     // Skip root node
     if (node.type === 'root') return null;

     // Try to find a factory for this node
     const factory = getFactory(node, context);
     if (!factory) return null;

     // Create the record
     const record = factory.create(node, context);

     // Find a handler for this record
     const handler = handlers.find(h => h.canHandle(record)) ?? null;

     return { record, handler };
   }
   ```

2. Restructure `visitNode` to use early returns:

   ```typescript
   function visitNode(node: Node): typeof SKIP | undefined {
     // Handle paragraph specially (field detection + natural block)
     if (node.type === 'paragraph') {
       return handleBlock(node as unknown as Paragraph);
     }

     // Try factory handling
     const result = maybeHandleFactory(node, currentContext, handlers);
     if (result) {
       // ... handle record with handler or push to context
       return result.handler ? undefined : SKIP;
     }

     // Handle inline nodes (skip — we only visit block-level)
     if (isInlineNode(node)) return SKIP;

     // Handle natural block fallback
     return handleNaturalBlock(node);
   }
   ```

### Step 3 — Rename `visitParagraph` → `handleBlock`

Rename the function and update its signature:

1. Rename `visitParagraph` to `handleBlock`.
2. Update the comment: "Handle block nodes — field detection or natural block fallback."
3. Update all call sites.

### Step 4 — Rename inline node fallthrough to `handleNaturalBlock`

Create a named function for the natural block handling:

1. Extract the inline node fallthrough logic into a function:

   ```typescript
   function handleNaturalBlock(node: Node): typeof SKIP {
     const record = createNaturalBlock(node, currentContext);
     if (record.position) flushGap(record.position.start);
     currentContext.push(record);
     if (record.position) {
       updateLastEnd(record.position.end);
     }
     return SKIP;
   }
   ```

2. Use this function in `visitNode` for the natural block fallback case.

### Step 5 — Document inline node SKIP behavior

Add a comment explaining why inline nodes return SKIP:

```typescript
// Inline nodes (text, emphasis, strong, etc.) are NOT visited further.
// We only want to visit block-level nodes for construct classification.
// Inline content is captured as part of NaturalBlock.value (raw markdown).
if (isInlineNode(node)) return SKIP;
```

### Step 6 — Add `detectField` to VisitContext

Move field detection logic into the context. This encapsulates construct-specific detection:

1. Add a `detectField` method to `VisitContext` in `factory.ts`:

   ```typescript
   export interface VisitContext {
     // ... existing methods
     detectField(paragraph: Paragraph): FieldBlock | null;
   }
   ```

2. Implement `detectField` in `createNestedContext`:

   ```typescript
   detectField(paragraph: Paragraph) {
     if (paragraph.children.length > 0 && isFieldStrong(paragraph.children[0], ctx)) {
       return createFieldBlockFromParagraph(paragraph, ctx);
     }
     return null;
   }
   ```

3. Update `handleBlock` in `builder.ts` to use `currentContext.detectField(paragraph)` instead of inline field detection logic.

### Step 7 — Verify

1. Run `npm run lint:fix` to auto-fix formatting.
2. Run `npm run lint` — must exit 0.
3. Run TC1: `npx tsx src/parse/parse.ts fixtures/section-block.md` — verify output matches expected structure.

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`. Do NOT touch `types.ts`, `parse.ts`, `src/index.ts`, tsconfigs, or any other file.
- RULE: This is a refactoring iteration. Do not change the output structure or behavior — only improve code clarity and encapsulation.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The builder has been abstracted for clarity: `visitChildren` → `shouldVisit`, `visitNode` restructured with `maybeHandleFactory`, `visitParagraph` → `handleBlock`, natural block handling extracted, field detection moved to context. The output structure is unchanged.

**Verification steps**

1. Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
2. Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors.
3. Execute `npx tsx src/parse/parse.ts fixtures/section-block.md` and verify TC1 output matches expected structure.

**Commit and report**

- Stage all changes in `src/parse/`.
- Commit with message: `poc-parse: abstract builder and encapsulate constructs`.
- Use `git commit --no-verify`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/abstract-builder__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `abstract-builder`, renamed `visitChildren` → `shouldVisit`, restructured `visitNode`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
