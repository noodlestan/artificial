# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `define-parser-builder-construct-layers`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `define-parser-builder-construct-layers`, clean layer separation, injectable entry point, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

This iteration establishes **total separation between layers** in the parser/builder/construct architecture. The current implementation has pollution that mixes concerns:

**Current pollution:**
1. `detectField(paragraph)` on `VisitContext` — construct-specific logic hardcoded into context
2. `_section?: SectionBlock` on `VisitContext` — construct-specific state hardcoded into context
3. `isInlineNode()` / `INLINE_TYPES` — wrong assumption that inline nodes are not parsed (we have `%identifiers` as inline constructs)
4. Default args in `buildDocument(markdown, handlers = [...])` — everything should be injected from entry point
5. Tag detection hardcoded in `VisitContext.push()` — should be a handler

**Target architecture:**
- `VisitContext` is a **pure container** — no construct-specific logic, only generic push/parent/target
- `ConstructFactory` detects and creates records — independent of context state
- `ConstructHandler` processes records — receives context, returns new context
- `buildDocument` receives everything via injection — no defaults, no hardcoded constructs
- Inline and block nodes use the same factory/handler pattern — no special cases

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/art-js/cli/poc-parse/_pseudo.md` — the source of truth for the parser architecture. Note: the pseudo will need updates after this iteration.
- `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts` — current implementation with pollution.
- `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` — current implementation with default args.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — record schema.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Clean `VisitContext` interface

Remove all construct-specific pollution from `VisitContext`:

```typescript
export interface VisitContext {
  // Generic — no construct-specific logic
  capturing(): string | undefined;
  target(): BlockContent[];
  push(record: Construct): void;
  parent(): VisitContext | undefined;
  source: string;
  lastEnd: Point | undefined;
}
```

Remove:
- `detectField(paragraph: Paragraph): FieldBlock | null` — will be a handler
- `_section?: SectionBlock` — will be injected differently

### Step 2 — Remove `isInlineNode` / `INLINE_TYPES`

Delete the `INLINE_TYPES` set and `isInlineNode()` function. Instead:

1. Let `getFactory()` try all factories for every node (including text, emphasis, etc.)
2. If a factory matches → use it
3. If no factory matches → `NaturalBlock` fallback

This means inline constructs like `%identifiers` can have their own factory when needed, without special-casing.

### Step 3 — Create `FieldDetectionHandler`

Move field detection from context into a handler:

```typescript
export function createFieldDetectionHandler(
  createNestedCtx: typeof createNestedContext
): ConstructHandler {
  return {
    canHandle(record) {
      // This handler intercepts paragraphs before they become NaturalBlocks
      // It checks if the paragraph starts with a field pattern
      return false; // This is a pre-processor, not a post-processor
    },
    handle(record, node, context) {
      // Not used — field detection is a pre-processing step
      return context;
    }
  };
}
```

Actually, field detection is different — it needs to happen **before** the record is created, not after. We need a different contract:

```typescript
export interface ConstructPreProcessor {
  // Can this node be pre-processed (e.g., field detection)?
  canPreProcess(node: MdastNode, context: VisitContext): boolean;
  // Pre-process the node, returning a record or null
  preProcess(node: MdastNode, context: VisitContext): Construct | null;
}
```

The `buildDocument` would try pre-processors before factories.

### Step 4 — Move tag detection out of `VisitContext.push()`

Currently, `push()` has hardcoded tag routing:
```typescript
if (record.construct === 'Tag') {
  const s = findTagable(ctx);
  if (s) (s.tags ??= []).push(record);
  return;
}
```

This should be a handler. Create a `TagRoutingHandler`:

```typescript
export function createTagRoutingHandler(): ConstructHandler {
  return {
    canHandle(record) {
      return record.construct === 'Tag';
    },
    handle(record, node, context) {
      // Tag routing logic — find nearest section and attach
      // This needs access to the context chain
      // ... implementation
      return context;
    }
  };
}
```

Problem: The handler needs to walk up the context chain to find the nearest section. But `context.parent()` is the only way up. We need a way to find the "tagable" section without polluting the context.

Solution: Add a `findTagable` helper that takes a context and walks up — this is already a standalone function, not a context method. Keep it as a utility function, not a context method.

### Step 5 — Inject everything into `buildDocument`

Remove default arguments. The entry point receives everything:

```typescript
export interface ParserConfig {
  preProcessors: ConstructPreProcessor[];
  factories: ConstructFactory[];
  handlers: ConstructHandler[];
}

export function buildDocument(markdown: string, config: ParserConfig): Document {
  // ... implementation uses config.factories, config.handlers, config.preProcessors
}
```

Create a default config that can be imported:

```typescript
export function createDefaultConfig(): ParserConfig {
  return {
    preProcessors: [fieldDetectionPreProcessor],
    factories: [sectionBlockFactory, fieldBlockFactory, tagFactory],
    handlers: [sectionBlockHandler, fieldBlockHandler, tagRoutingHandler],
  };
}
```

The entry point (`parse.ts`) would use:
```typescript
const config = createDefaultConfig();
const doc = buildDocument(markdown, config);
```

### Step 6 — Update `parse.ts` entry point

Update `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts` to:
1. Import `createDefaultConfig` and `buildDocument`
2. Create config and pass to `buildDocument`
3. No default args in `buildDocument` signature

### Step 7 — Verify

1. Run `npm run lint:fix` to auto-fix formatting.
2. Run `npm run lint` — must exit 0.
3. Run TC1: `npx tsx src/parse/parse.ts fixtures/section-block.md` — verify output matches expected structure.

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/factory.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts`. Do NOT touch `types.ts`, `src/index.ts`, tsconfigs, or any other file.
- RULE: This is a design iteration. The goal is clean layer separation — no construct-specific logic in generic containers.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The parser/builder/construct layers are cleanly separated:
- `VisitContext` is a pure container (no construct-specific logic)
- `ConstructFactory` detects and creates records
- `ConstructHandler` processes records after creation
- `ConstructPreProcessor` processes nodes before factory detection
- `buildDocument` receives everything via injection (no defaults)
- Inline and block nodes use the same pattern (no special cases)

**Verification steps**

1. Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
2. Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors.
3. Execute `npx tsx src/parse/parse.ts fixtures/section-block.md` and verify TC1 output matches expected structure.

**Commit and report**

- Stage all changes in `src/parse/`.
- Commit with message: `poc-parse: define parser builder construct layers`.
- Use `git commit --no-verify`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/define-parser-builder-construct-layers__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `define-parser-builder-construct-layers`, clean layer separation, injectable entry point, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
