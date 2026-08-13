# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Instruction Id:** `define-parser-builder-construct-layers`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

- `src/parse/factory.ts`: Removed `detectField` and `_section` from `VisitContext` interface; removed `INLINE_TYPES` and `isInlineNode`; added `BLOCK_TYPES` set and `isBlockType` helper; added `ConstructPreProcessor` interface and `createFieldDetectionPreProcessor`; added `createTagRoutingHandler`; moved section tracking to WeakMap; added `ParserConfig` interface and `createDefaultConfig`; updated `getFactory` to accept factories array; cleaned `createNestedContext` to be generic.
- `src/parse/builder.ts`: Removed default handlers argument; added `ParserConfig` parameter to `buildDocument`; added `tryPreProcessors` function to run pre-processors before factories; removed `isInlineNode` usage; replaced with `isBlockType` check for NaturalBlock fallback; removed paragraph-specific `handleBlock` logic (now handled by pre-processor).
- `src/parse/parse.ts`: Updated `parse` function to import and use `createDefaultConfig`; pass config to `buildDocument`.

## Feedback

### For the planner

**Ambiguity 1: Inline node handling after removing `isInlineNode`**

- **Where:** Step 2 — Remove `isInlineNode` / `INLINE_TYPES`
- **Problem:** The instruction says to let factories try all nodes with NaturalBlock fallback, but doesn't clarify what happens to inline nodes (text, emphasis, etc.) that don't have factories. Creating NaturalBlocks for all nodes would incorrectly add text nodes as siblings of their parent paragraphs.
- **Decision:** Introduced `BLOCK_TYPES` set to distinguish block vs inline nodes. Block nodes without factories get NaturalBlock fallback; inline nodes without factories are skipped (return SKIP).
- **Snippet for plan file:**

  ```markdown
  ### Step 2 — Remove `isInlineNode` / `INLINE_TYPES`

  Delete the `INLINE_TYPES` set and `isInlineNode()` function. Replace with `BLOCK_TYPES` set containing block-level node types (paragraph, code, list, blockquote, table, thematicBreak, html).

  - Let `getFactory()` try all factories for every node (including text, emphasis, etc.)
  - If a factory matches → use it
  - If no factory matches and node is a block type → `NaturalBlock` fallback
  - If no factory matches and node is inline → SKIP (no NaturalBlock)

  This means inline constructs like `%identifiers` can have their own factory when needed, without special-casing.
  ```

**Ambiguity 2: Section tracking without `_section` on context**

- **Where:** Step 4 — Move tag detection out of `VisitContext.push()`
- **Problem:** The instruction says to remove `_section` from the context interface and keep `findTagable` as a utility function. But `findTagable` relied on `_section` being accessible on the context. The instruction doesn't specify how to maintain section tracking without polluting the interface.
- **Decision:** Used a `WeakMap<VisitContext, SectionBlock>` to store section associations internally. The context interface stays clean, but `findTagable` can still walk up the chain and look up sections via the WeakMap.
- **Snippet for plan file:**

  ````markdown
  ### Step 4 — Move tag detection out of `VisitContext.push()`

  Use a `WeakMap<VisitContext, SectionBlock>` to track section associations internally. This keeps the `VisitContext` interface clean while allowing `findTagable` to walk up the context chain and retrieve sections.

  ```typescript
  const sectionMap = new WeakMap<VisitContext, SectionBlock>();

  export function findTagable(context: VisitContext): SectionBlock | undefined {
    let current: VisitContext | undefined = context;
    while (current) {
      const section = sectionMap.get(current);
      if (section) return section;
      current = current.parent();
    }
    return undefined;
  }

  // In createNestedContext, when section is provided:
  if (section) {
    sectionMap.set(ctx, section);
  }
  ```
  ````

  ```

  ```

**Omission 1: Location of `ParserConfig` and `createDefaultConfig`**

- **Where:** Step 5 — Inject everything into `buildDocument`
- **Problem:** The instruction defines `ParserConfig` and `createDefaultConfig` but doesn't specify which file they should be in.
- **Decision:** Placed both in `factory.ts` alongside other factory/handler/config types.
- **Snippet for plan file:**

  ````markdown
  ### Step 5 — Inject everything into `buildDocument`

  Add `ParserConfig` interface and `createDefaultConfig` function to `factory.ts`:

  ```typescript
  export interface ParserConfig {
    preProcessors: ConstructPreProcessor[];
    factories: ConstructFactory[];
    handlers: ConstructHandler[];
  }

  export function createDefaultConfig(): ParserConfig {
    return {
      preProcessors: [createFieldDetectionPreProcessor()],
      factories: [sectionBlockFactory, tagFactory],
      handlers: [
        createSectionBlockHandler(createNestedContext),
        createFieldBlockHandler(createNestedContext),
        createTagRoutingHandler(),
      ],
    };
  }
  ```
  ````

  ```

  ```

**Contradiction 1: `fieldBlockFactory` still exists but not used**

- **Where:** Step 3 — Create `FieldDetectionHandler` (now `ConstructPreProcessor`)
- **Problem:** The instruction moves field detection to a pre-processor, but `fieldBlockFactory` still exists in the code. The default config doesn't include it in the factories list, making it dead code.
- **Decision:** Kept `fieldBlockFactory` for backward compatibility and potential future use, but excluded it from `createDefaultConfig`. The factory is still exported and can be used if needed.
- **Snippet for plan file:**

  ```markdown
  ### Step 3 — Create `ConstructPreProcessor` for field detection

  Move field detection from context into a pre-processor. Note: `fieldBlockFactory` is retained for backward compatibility but is not included in the default config. Future iterations may remove it if not needed.
  ```

### For the technical writers

No documentation or reference files were modified in this iteration. The `_pseudo.md` file may need updates to reflect the new architecture (pre-processors, WeakMap for section tracking, `ParserConfig` injection), but this was outside the scope of the implementation instructions.

### For the crew

The layer separation is now clean:

- `VisitContext` is a pure container with no construct-specific logic
- `ConstructPreProcessor` handles pre-factory detection (e.g., field detection)
- `ConstructFactory` detects and creates records
- `ConstructHandler` processes records after creation (e.g., section/field capture, tag routing)
- `buildDocument` receives everything via injection (no defaults)
- Inline and block nodes use the same factory/handler pattern (no special cases for inline types)

The WeakMap approach for section tracking is a bit unconventional but keeps the context interface clean. An alternative would be to pass the section through the handler chain explicitly, but that would require more refactoring.
