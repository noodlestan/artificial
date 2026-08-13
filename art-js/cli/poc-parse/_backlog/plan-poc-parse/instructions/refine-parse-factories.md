# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `refine-parse-factories`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `refine-parse-factories`, renamed `close()` → `parent()`, refactored `buildDocument`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

This iteration performs **small refactorings** to improve code clarity and prepare for future extensibility:

1. **Rename `close()` → `parent()`** — the current name is misleading; it returns the parent context, not a "close" operation.
2. **Rename `findParentSection()` → `findTagable()`** — the function finds the nearest section that can receive tags; the new name clarifies its purpose.
3. **Refactor `buildDocument`** — extract construct-specific logic (section/field handling) into injectable handlers that obey a contract, removing closures over construct types. This prepares the builder for future construct additions without modifying the core visit logic.
4. **Small bug fixes** — if you notice any issues during the refactoring, fix them.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/art-js/cli/poc-parse/_pseudo.md` — the source of truth for the parser architecture. Note: the pseudo still uses `close()` and `findParentSection()` — you will update the implementation but NOT the pseudo (the pseudo will be updated separately if these changes are accepted).
- `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts` — current implementation to refactor.
- `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` — current implementation to refactor.
- `repos/artificial/art-js/cli/poc-parse/_test.md` — test cases with expected output snippets.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Rename `close()` → `parent()` in VisitContext

Update `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`:

1. In the `VisitContext` interface, rename `close(): VisitContext | undefined` to `parent(): VisitContext | undefined`.
2. In `createNestedContext`, rename the `close()` method to `parent()`.
3. Update all usages of `.close()` to `.parent()` throughout the file.

Update `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`:

1. Update all usages of `.close()` to `.parent()`.

### Step 2 — Rename `findParentSection()` → `findTagable()`

Update `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`:

1. Rename the function `findParentSection` to `findTagable`.
2. Update the comment to clarify: "Find the nearest section that can receive tags."
3. Update all internal usages.

Update `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`:

1. Update the import and all usages of `findParentSection` to `findTagable`.

### Step 3 — Refactor `buildDocument` to inject construct handlers

The current `buildDocument` has closures (`handleSectionBlock`, `handleFieldBlock`) that know about specific construct types. Refactor to inject these handlers:

1. Define a handler contract in `factory.ts`:

   ```typescript
   export interface ConstructHandler {
     // Can this handler process the record?
     canHandle(record: Construct): boolean;
     // Process the record, returning the new context (or same if no change)
     handle(record: Construct, node: MdastNode, context: VisitContext): VisitContext;
   }
   ```

2. Create handlers for SectionBlock and FieldBlock:

   ```typescript
   export const sectionBlockHandler: ConstructHandler = {
     canHandle(record) { return record.construct === 'SectionBlock'; },
     handle(record, node, context) {
       // ... section handling logic
       return newContext;
     }
   };

   export const fieldBlockHandler: ConstructHandler = {
     canHandle(record) { return record.construct === 'FieldBlock'; },
     handle(record, node, context) {
       // ... field handling logic
       return newContext;
     }
   };
   ```

3. Update `buildDocument` to accept handlers:

   ```typescript
   export function buildDocument(
     markdown: string,
     handlers: ConstructHandler[] = [sectionBlockHandler, fieldBlockHandler]
   ): Document {
     // ... visit logic uses handlers instead of closures
   }
   ```

4. The visit logic should iterate through handlers to find one that can handle the record, rather than using if/else on construct types.

### Step 4 — Update exports and imports

Ensure all renamed functions and new types are properly exported from `factory.ts` and imported in `builder.ts`.

### Step 5 — Verify

1. Run `npm run lint:fix` to auto-fix formatting.
2. Run `npm run lint` — must exit 0.
3. Run TC1: `npx tsx src/parse/parse.ts fixtures/section-block.md` — verify output matches expected structure.

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`. Do NOT touch `types.ts`, `parse.ts`, `src/index.ts`, tsconfigs, or any other file.
- RULE: This is a refactoring iteration. Do not change the output structure or behavior — only improve code clarity and extensibility.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The parser has been refactored for clarity: `close()` → `parent()`, `findParentSection()` → `findTagable()`, and `buildDocument` now uses injectable handlers. The output structure is unchanged.

**Verification steps**

1. Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
2. Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors.
3. Execute `npx tsx src/parse/parse.ts fixtures/section-block.md` and verify TC1 output matches expected structure.

**Commit and report**

- Stage all changes in `src/parse/`.
- Commit with message: `poc-parse: refine parse factories and builder`.
- Use `git commit --no-verify`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/plan-poc-parse/instructions/refine-parse-factories__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `refine-parse-factories`, renamed `close()` → `parent()`, refactored `buildDocument`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
