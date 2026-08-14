# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `split-factory-modules`

## Goal

Split `factory.ts` into modular structure for better code organization.

## Scope

Split `src/parse/factory.ts` into:

```
src/parse/
  types.ts              (existing — keep as-is)
  framework/
    createNestedContext.ts
    createDocumentContext.ts
    cleanPosition.ts
    rawSlice.ts
    getFactory.ts
    findTagable.ts
    sectionDepth.ts
    flushGap.ts
  constructs/
    SectionBlock/
      factory.ts
      handler.ts
    FieldBlock/
      factory.ts
      handler.ts
      preProcessor.ts
    NaturalBlock/
      factory.ts
    Tag/
      factory.ts
      handler.ts
  index.ts              (re-exports public API)
```

## Rules

- Each file exports one function/interface
- `index.ts` re-exports everything needed by `builder.ts`
- Update `builder.ts` imports to use new paths
- Keep `types.ts` unchanged

## Final Verification

1. `npm run ci` must pass
2. Run: `npx tsx src/parse/parse.ts fixtures/markdown.md > fixtures/markdown.art.json`
3. Repeat 2 more times — all 3 JSON outputs must be identical (no changes between runs)

## How to Report Back

Render report to `_backlog/plan-poc-parse/instructions/split-factory-modules__report.md`
