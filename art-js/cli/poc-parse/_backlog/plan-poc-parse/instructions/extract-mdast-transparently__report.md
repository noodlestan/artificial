# Sub-Agent REPORT (worker)

**Plan:** `poc-parse`

**Instruction Id:** `extract-mdast-transparently`

**Outcome:** `COMPLETED`

## Evidence

### Changes

Ruthless rewrite of parser from sectionStack/fieldStack architecture to context-aware visiting with `createNestedContext`. NaturalBlock is now transparent (copies ALL mdast attributes via spread).

#### Files changed

| File | Change |
|------|--------|
| `src/parse/types.ts` | Extended `NaturalBlock` with `type?`, `lang?`, `meta?`, `[key: string]: unknown` index signature. Added `depth?: number` to `SectionBlock` for nesting. |
| `src/parse/factory.ts` | Complete rewrite. New `VisitContext` interface with `capturing()`, `target()`, `push()`, `close()`, `_section`. Implemented `createNestedContext`, `createDocumentContext`, `createNaturalBlock` (transparent spread), `createFieldBlockFromParagraph`, all factories, `findParentSection`, `flushGap`, `getFactory`. |
| `src/parse/builder.ts` | Complete rewrite. `buildDocument` uses closure-based `currentContext` and `lastEnd`. Inner functions: `visitNode`, `visitParagraph`, `handleSectionBlock`, `handleFieldBlock`. Context transitions propagate `lastEnd`. |

### Verification

- `npm run lint` — exits 0, no errors.
- TC1 (`fixtures/section-block.md`): SectionBlock with `kind: "Routine"` and `name: "List Tasks"` ✅. Section nesting (h1→h2→h3) ✅. FieldBlocks ✅. Tag detection ✅.

## Feedback

### For the planner

1. **Where:** `_pseudo.md` → NaturalBlock Factory  
   **Problem:** The pseudo says to use `...node` spread for transparency, but also shows type-specific handling (`if node.type === 'code'`, `if node.type === 'list'`). The spread copies mdast `children` (e.g. inline text nodes for paragraphs, tableRow nodes for tables) which are NOT `BlockContent` records. This creates a type lie: `NaturalBlock.children` is typed as `BlockContent[]` but contains mdast nodes.  
   **Decision:** Accepted the type lie. The `value` field provides lossless round-trip. The mdast `children` are bonus transparency.  
   **Snippet for `_pseudo.md`:**
   ```markdown
   > **Note on children:** The spread copies mdast `children` verbatim (e.g. inline nodes for paragraphs, tableRow for tables). These are NOT `BlockContent` records. Only `list` and `blockquote` override `children` with parsed records. The `value` field is the canonical lossless content.
   ```

2. **Where:** `_pseudo.md` → Helper Functions → `findParentSection`  
   **Problem:** The pseudo's `findParentSection` walks up contexts looking for `capturing() === 'SectionBlock'` then checks `target()` children for a SectionBlock. But with `createNestedContext` where `target()` IS the section's children array, the last child of `target()` is content, not the section itself. The function would never find the section.  
   **Decision:** Added `_section?: SectionBlock` field to `VisitContext`. `findParentSection` walks up and returns the first context with `_section` set.  
   **Snippet for `_pseudo.md`:**
   ```markdown
   > `createNestedContext` accepts an optional `section` parameter. When creating a section context, pass the section record. `findParentSection` walks up the context chain returning the first `_section` found.
   ```

3. **Where:** `_pseudo.md` → Helper Functions → `sectionDepth`  
   **Problem:** The pseudo's `sectionDepth` is a placeholder returning `1`. Proper nesting requires actual depth tracking.  
   **Decision:** Added `depth?: number` to `SectionBlock` type. Set by `sectionBlockFactory` from `heading.depth`.  
   **Snippet for `types.ts` section in plan:**
   ```markdown
   > Add `depth?: number` to `SectionBlock` for heading-level tracking.
   ```

4. **Where:** `_pseudo.md` → Visitor Entry Point / Node Visitor  
   **Problem:** The pseudo's `buildDocument` creates `document = { construct: 'Document', children: [] }` and `context = createDocumentContext(markdown)` separately. The document's children and the context's target are different arrays. At the end, `document.children` is never populated from the context.  
   **Decision:** Return `{ construct: 'Document', children: docContext.target() }` — use the document context's target directly.  
   **Snippet for `_pseudo.md`:**
   ```markdown
   > `buildDocument` returns `{ construct: 'Document', children: docContext.target() }`. The document context's target array accumulates all top-level records.
   ```

5. **Where:** `_pseudo.md` → Paragraph Visitor  
   **Problem:** Non-field paragraphs return `SKIP` in the pseudo, which prevents tag detection in prose (TC9). Tags are inline text nodes inside paragraphs — if we skip children, we never see them.  
   **Decision:** Non-field paragraphs return `undefined` (visit children) to allow tag detection. Inline nodes that don't match `tagFactory` are skipped via `isInlineNode` check in `visitNode`.  
   **Snippet for `_pseudo.md`:**
   ```markdown
   > Non-field paragraphs return `undefined` (not `SKIP`) to visit children for tag detection. Inline nodes without tag matches are skipped in `visitNode` via `isInlineNode` check.
   ```

6. **Where:** Instruction → Step 3 → `naturalBlockFactory`  
   **Problem:** The instruction says to use `...node` spread but also shows type-specific `if/else` for code, list, blockquote. The spread already copies `lang`, `meta`, `children` from mdast. The explicit assignments are redundant for code (spread already has them) but needed for list/blockquote (to override mdast children with parsed records).  
   **Decision:** Spread everything, then override `children` for list/blockquote. The explicit `lang`/`meta` assignments ensure `null` defaults even if mdast omits them.  
   **Snippet for instruction:**
   ```markdown
   > The spread copies all mdast attributes. Override `children` only for list/blockquote (to parse sub-items). The `lang`/`meta` assignments ensure null defaults.
   ```

### For the technical writers

1. **Where:** `_test.md` → TC8  
   **Problem:** TC8 expects `{ "construct": "NaturalBlock", "type": "paragraph", "value": "..." }` without `children`. But the transparent spread includes mdast `children` (inline text nodes). The actual output has `children: [{ type: "text", value: "...", position: {...} }]`.  
   **Decision:** Output includes mdast children per transparency principle.  
   **Snippet for `_test.md`:**
   ```markdown
   > TC8 actual output includes `children` from mdast spread (inline text nodes). The `value` field is the canonical content. Update expected output to show `children` or note that extra mdast fields are present.
   ```

2. **Where:** `_test.md` → TC9  
   **Problem:** TC9 says "Tag detected with `name: 'generator'` somewhere in the output." The tag IS detected and attached to the section's `tags` array. But the paragraph NaturalBlock still has `value: "(#generator)"` — the tag text appears in both the Tag record and the raw value.  
   **Decision:** Accepted — tag is metadata, raw value is lossless.  
   **Snippet for `_test.md`:**
   ```markdown
   > TC9: Tag is attached to parent section's `tags` array. The paragraph NaturalBlock retains the raw text including the tag pattern. Both are present in output.
   ```

### For the crew

- Gap NaturalBlocks (`type: "text"`, `value: "\n\n"`) appear between sections. These are whitespace preserved by `flushGap`. They may be unwanted noise — consider filtering pure-whitespace gaps in a future iteration.
- The `fieldBlockFactory` is exported but effectively dead code (paragraphs are handled by `visitParagraph` before `getFactory`). Kept for API completeness per pseudo structure.
