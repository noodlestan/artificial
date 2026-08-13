# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `mdast-based-parse`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `mdast-based-parse`, created `src/parse/builder.ts` + `src/parse/factory.ts`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Replace the micromark token-event builder with an mdast-based builder. Instead of listening to raw enter/exit events, we parse markdown to mdast (the rawest AST in the unified ecosystem), then visit each node and map it to our record types using a factory pattern.

The approach:
1. Parse markdown → mdast using `mdast-util-from-markdown`.
2. Visit each mdast node with `unist-util-visit`.
3. For each node, check if it qualifies as a known construct (SectionBlock, FieldBlock, Tag, etc.).
4. If yes → delegate to the construct's factory, which creates the record and decides whether to visit the subtree.
5. If no → map to NaturalBlock.
6. Don't visit subtrees of known constructs (the factory handles them).

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/_architect.md` — Approach (micromark substrate → mdast layer) + Step 4 (construct-stack record builder).
- `repos/artificial/_wip.md` — only to identify the current step; NEVER modify it.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — the record schema the builder must produce.
- `repos/artificial/architecture/records/adr/_research.md` — best practices 1–6; esp. #1 (two layers: micromark owns syntax, we own semantics) and #2 (construct-stack pattern).
- `repos/artificial/architecture/records/adr/language.art` — construct containment rules and the NaturalBlock catch-all.
- `repos/artificial/_backlog/plan-poc-parse/instructions/smoke-parse-section-block__findings.md` — tokenization findings.
- `repos/artificial/_backlog/plan-poc-parse/instructions/construct-stack-record-builder__report.md` — feedback from the previous approach (edge cases F1–F5).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Known Edge Cases

These are known issues from the previous micromark-based builder and round-trip analysis. The mdast-based approach must handle them correctly.

### EC1 — Multi-word field names

`**Canonical Name:**` must be detected as a FieldBlock, not a NaturalBlock. The detection pattern must match:
- `**Purpose:**` (single word + colon)
- `**Canonical Name:**` (multi-word + colon)
- `**Package Dependency Set:**` (multi-word + colon)
- NOT `**bold text without colon**`

### EC2 — Lists inside FieldBlocks

When a FieldBlock contains a list (e.g. `**Dependencies:**` with `- Package Dependency: Esbuild`), the list items must be parsed as structured content, not flattened to raw text.

The NaturalBlock value model must support structured content:
- `.value: string` — raw markdown (always present, for lossless round-trip)
- `.children?: BlockContent[]` — parsed sub-records (when content is structured, e.g. list items)

### EC3 — Tags inside fenced code blocks

Tags `(#identifier)` inside fenced code blocks (``` ```md ... ``` `) must NOT be detected as Tag records. Only tags in prose content should be classified.

### EC4 — Heading text with inline markup

`# Any Markdown is Valid \`.art\`` — the heading name should preserve the raw text including inline markup. Don't strip backticks or other formatting from the name.

### EC5 — Blank lines between sections

Blank lines between sections are NaturalBlocks. They should be preserved in the output (not silently dropped).

### EC6 — Code blocks

Fenced code blocks and indented code blocks are NaturalBlocks. Don't parse their content for constructs.

### EC7 — Position object hygiene

Strip internal micromark fields (`_bufferIndex`, `_index`) from all position records. Only keep `line`, `column`, `offset`.

### EC8 — Section nesting by heading level

Headings are flat siblings in mdast. Nesting is driven by heading level:
- `# Module` (level 1) → top-level SectionBlock
- `## Package Dependency: Esbuild` (level 2) → child of `# Module`
- `### Field` (level 3) → child of `## Package Dependency`

When a new heading enters, pop sections from the stack until the parent is found (heading level <= stack top level).

## Changes

### Step 1 — Add dependencies

Add `mdast-util-from-markdown` and `unist-util-visit` to `repos/artificial/art-js/cli/poc-parse/package.json` as dependencies (not devDependencies — they are runtime).

Run `npm install` in `repos/artificial/art-js/cli/poc-parse/` to register them.

### Step 2 — Create the construct factory system

Create `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts` that:

1. Defines a `VisitContext` type:
   ```typescript
   interface VisitContext {
     sectionStack: SectionBlock[];
     documentChildren: BlockContent[];
   }
   ```

2. Defines a `ConstructFactory` interface:
   ```typescript
   interface ConstructFactory {
     /** Can this mdast node be mapped to our construct? */
     detect(node: MdastNode, context: VisitContext): boolean;
     /** Create the construct record from the mdast node. */
     create(node: MdastNode, context: VisitContext): Construct;
     /** Should we visit the node's children after creating the record? */
     visitChildren: boolean;
   }
   ```

3. Implements factories for each construct:

   **SectionBlockFactory:**
   - `detect`: node type is `heading`
   - `create`: extract `kind` and `name` from heading text by parsing `# Kind: Name` or `# Name` pattern. Create SectionBlock. Extract tags from heading text via regex `(#identifier)`.
   - `visitChildren: true` (content under the heading must be processed)

   **FieldBlockFactory:**
   - `detect`: node type is `strong` AND the text content matches `^[A-Za-z][A-Za-z ]*:\s` (word chars including spaces, then colon, then space). This handles EC1.
   - `create`: extract field name (text before colon). Create FieldBlock.
   - `visitChildren: false` (field value is the strong node's children, captured as-is)

   **TagFactory:**
   - `detect`: node type is `text` AND text matches `\(#identifier\)` AND parent is NOT inside a code block (EC3).
   - `create`: extract tag name (kebab-case, without `#` or parentheses). Create Tag.
   - `visitChildren: false`

   **NaturalBlockFactory:**
   - `detect`: always true (fallback)
   - `create`: serialize the mdast node back to markdown (or capture raw text). If the node has children that are list items, parse them into structured children (EC2). Otherwise, set `.value` to the raw text.
   - `visitChildren: false`

4. Exports a `getFactory(node, context): ConstructFactory | null` function that returns the matching factory (SectionBlock → FieldBlock → Tag → null for NaturalBlock fallback).

### Step 3 — Rewrite the builder

Replace the contents of `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` with an mdast-based implementation:

1. Import `fromMarkdown` from `mdast-util-from-markdown` and `visit` from `unist-util-visit`.
2. Export a `buildDocument(markdown: string): Document` function.
3. Add a `cleanPosition` helper (EC7):
   ```typescript
   function cleanPosition(raw: any): Position | undefined {
     if (!raw?.start) return undefined;
     return {
       start: { line: raw.start.line, column: raw.start.column, offset: raw.start.offset },
       end: { line: raw.end.line, column: raw.end.column, offset: raw.end.offset },
     };
   }
   ```
4. Implementation:
   - Parse markdown to mdast.
   - Initialize `sectionStack: SectionBlock[]` and `documentChildren: BlockContent[]`.
   - Visit each node. For each:
     - Get factory via `getFactory(node, context)`.
     - If factory found: create record, attach to current section or document, manage section stack (EC8), return `visitChildren ? undefined : visit.SKIP`.
     - If no factory: create NaturalBlock (with structured children for lists per EC2), attach, return `visit.SKIP`.
   - After visit completes, pop any remaining sections from the stack (attach to document).
   - Return `Document` with `documentChildren`.

### Step 4 — Update parse.ts

Update `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts` to import from the new builder. Keep the CLI entry point unchanged.

### Step 5 — Clean up

Remove any dead code from the old micromark-based builder. Ensure no references to `preprocess`, `postprocess`, or raw micromark `parse` remain in builder.ts (micromark is still used indirectly through mdast-util-from-markdown).

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` (if new types needed for NaturalBlock.children), `repos/artificial/art-js/cli/poc-parse/package.json`. Only create: `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`. Do NOT touch `src/index.ts`, tsconfigs, or any other existing file.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The mdast-based builder correctly handles all known edge cases (EC1–EC8). Multi-word field names are detected. Lists inside FieldBlocks are structured. Tags in code blocks are ignored. Position objects are clean.

**Verification steps**

- Execute `npm install` in `repos/artificial/art-js/cli/poc-parse/` to install new deps.
- Execute `npx tsc --noEmit` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors.
- Execute `npx tsx src/parse/parse.ts repos/artificial/ops/records/dependencies/build-tools-dev.art` — confirm `**Canonical Name:**` is a FieldBlock (EC1). Confirm list items under `**Dependencies:**` are structured (EC2).
- Execute `npx tsx src/parse/parse.ts repos/artificial/architecture/records/adr/language.art` — confirm SectionBlock nesting by heading level (EC8), FieldBlock detection, NaturalBlock fallback.
- Execute `npx tsx src/parse/parse.ts repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art` — confirm tags inside fenced code blocks are NOT detected as Tag records (EC3).
- Confirm no position objects contain `_bufferIndex` or `_index` (EC7).
- Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
- Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` to diagnose remaining issues.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/plan-poc-parse/instructions/mdast-based-parse__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `mdast-based-parse`, created `src/parse/builder.ts` + `src/parse/factory.ts`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
