# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Instruction Id:** `mdast-based-parse`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File                                              | Description                                                                                                                                                                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `art-js/cli/poc-parse/package.json`               | Added runtime dependencies `mdast-util-from-markdown` (^2.0.0) and `unist-util-visit` (^5.0.0) (Step 1)                                                                                                                                                              |
| `art-js/cli/poc-parse/src/parse/factory.ts` (new) | Construct factory system: `VisitContext`, `ConstructFactory`, `sectionBlockFactory` / `fieldBlockFactory` / `tagFactory` / `naturalBlockFactory`, `getFactory` dispatch, `cleanPosition` (EC7), `rawSlice`/`stripStrong` helpers (Step 2)                            |
| `art-js/cli/poc-parse/src/parse/builder.ts`       | Rewritten as mdast-based builder: `buildDocument` visits mdast via `unist-util-visit`, maps nodes through factories, manages a section stack keyed on heading depth (EC8), preserves blank-line gaps as NaturalBlocks (EC5), attaches sections exactly once at close |
| `art-js/cli/poc-parse/src/parse/types.ts`         | `NaturalBlock.children?: BlockContent[]` for structured content (list items) (EC2)                                                                                                                                                                                   |
| `art-js/cli/poc-parse/package-lock.json`          | Lockfile updated by `npm install`                                                                                                                                                                                                                                    |

`src/parse/parse.ts` was not modified — the CLI entry point was preserved as-is (Step 4).

### Verification

- `npm install` in `art-js/cli/poc-parse/` — clean.
- `npx tsc --noEmit` — exit 0, no errors.
- `npx tsx src/parse/parse.ts repos/artificial/ops/records/dependencies/build-tools-dev.art` — `**Canonical Name:**` detected as FieldBlock (EC1); list under `**Dependencies:**` parsed into structured children (EC2).
- `npx tsx src/parse/parse.ts repos/artificial/architecture/records/adr/language.art` — `# Module` (level 1) nests `## Decision: ...` (level 2) sections by heading level (EC8); FieldBlock detection and NaturalBlock fallback confirmed; heading `# Any Markdown is Valid \`.art\`` preserves inline backticks (EC4).
- `npx tsx src/parse/parse.ts repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art` — no Tag records produced from fenced code blocks (EC3); fenced/indented code blocks are NaturalBlocks (EC6).
- No position object contains `_bufferIndex` or `_index` (EC7) — verified across all three outputs.
- `npm run lint` — clean (`prettier`, `eslint`, `tsc --noEmit`).

## Blockers (if any)

None.

## Feedback

### For the planner

- **F1 (Contradiction):** Step 2 → "SectionBlockFactory" says `visitChildren: true (content under the heading must be processed)`. With `unist-util-visit`, returning `SKIP` on a heading only skips the heading's own inline children; the block content under the heading is sibling nodes and is always visited. Setting `visitChildren: true` re-visits the heading's inline children as separate records, duplicating the heading text into stray NaturalBlocks. The builder also uses `visitChildren ? undefined : SKIP`, so the flag drives real behaviour.
  - **Ready-to-apply snippet for `mdast-based-parse.md`:** Change the SectionBlockFactory bullet to `visitChildren: false (the heading's inline text is captured raw by create; the content under the heading is a sibling traversal, which visit.SKIP does not interrupt)`.

- **F2 (Omission):** Step 2 → `VisitContext` lists only `sectionStack` and `documentChildren`. Factories need the source markdown to slice lossless raw text from node positions (names with inline markup per EC4, field/block values, tag detection). `rawSlice`/`stripStrong` depend on it.
  - **Ready-to-apply snippet for `mdast-based-parse.md`:** Add `source: string;` (comment: "Source markdown, used to slice lossless raw text from node positions") to the `VisitContext` interface.

- **F3 (Contradiction with repo lint):** Step 3 → the `cleanPosition` helper is specified with `raw: any`, which violates the repo's `@typescript-eslint/no-explicit-any` rule and fails `npm run lint`. It also cannot copy unist's `Position` (optional `end`, optional `offset`) onto the required `Position` type in `types.ts`.
  - **Ready-to-apply snippet for `mdast-based-parse.md`:** Replace the helper with `import type { Position as UnistPosition } from 'unist'` and a signature `cleanPosition(raw: UnistPosition | undefined): Position | undefined` that returns `undefined` when `end` is absent and coalesces `offset ?? 0`.

### For the technical writers

- **F4 (Clarification):** Blank-line gap placement follows the containment rule — a gap is attached to whatever record is open at that source position (a field value, section children, or the document), so the blank line before a new section heading lands inside the section being closed, and the blank between a heading and its first field lands inside that section. Trailing blank lines at EOF are dropped (only gaps _between_ records are preserved). The `language.art` containment model is consistent with this, but it is worth stating explicitly next to EC5.

### For the crew

- `unist-util-visit`'s `SKIP` return value is easy to misread as "skip this subtree entirely". It only skips a node's own children; sibling traversal continues. This is the mechanism that makes the factory pattern work for headings (inline text captured raw, sibling blocks still visited).
