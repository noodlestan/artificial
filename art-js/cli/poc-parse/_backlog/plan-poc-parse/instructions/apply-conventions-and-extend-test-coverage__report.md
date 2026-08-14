# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Instruction Id:** `apply-conventions-and-extend-test-coverage`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Goal                                          | Change                                                                                                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extend test coverage with real-world fixtures | Added `parser.art` (46 lines, multiple decisions) and `configuration.art` (13 lines, smaller ADR) to `fixtures/`. Updated `test-fixtures.sh` to handle `.art` extension. Created `fixtures/README.md`.                                        |
| Apply code conventions — types                | Extracted `MdastNode`, `VisitContext`, `ConstructFactory` to `framework/types.ts`. Updated all imports across framework and construct files.                                                                                                  |
| Apply code conventions — constants            | Created per-construct `constants.ts` files: `FieldBlock/constants.ts` (FIELD_TEXT_PATTERN), `SectionBlock/constants.ts` (TAG_PATTERN_G, KIND_PATTERN), `Tag/constants.ts` (TAG_PATTERN), `src/parse/constants.ts` (BLOCK_TYPES, isBlockType). |
| Apply code conventions — helpers              | Extracted `isFieldStrong` + `stripStrong` to `FieldBlock/private/isFieldStrong.ts`. Extracted `extractTags` to `SectionBlock/private/extractTags.ts`.                                                                                         |
| Clean public API via index.ts barrels         | Created `index.ts` barrels for FieldBlock, SectionBlock, NaturalBlock, and Tag constructs.                                                                                                                                                    |
| Clean up src/parse/index.ts                   | Created `config.ts` with `ParserConfig` and `createDefaultConfig`. Refactored `index.ts` to re-export from barrels and config.                                                                                                                |
| Verify tag detection                          | Confirmed tags detected in prose sections, NOT detected in code blocks. All 5 fixtures pass deterministic parsing (3 runs identical).                                                                                                         |

#### Files changed

- `fixtures/parser.art` — real-world ADR with multiple Decision sections
- `fixtures/configuration.art` — smaller ADR example
- `fixtures/parser.art.json` — generated parser output
- `fixtures/configuration.art.json` — generated parser output
- `fixtures/README.md` — fixture documentation
- `scripts/test-fixtures.sh` — updated FIXTURES array and output naming logic
- `src/parse/framework/types.ts` — centralized MdastNode, VisitContext, ConstructFactory
- `src/parse/constants.ts` — BLOCK_TYPES set and isBlockType function
- `src/parse/config.ts` — ParserConfig interface and createDefaultConfig
- `src/parse/constructs/FieldBlock/constants.ts` — FIELD_TEXT_PATTERN
- `src/parse/constructs/FieldBlock/index.ts` — barrel exports
- `src/parse/constructs/FieldBlock/private/isFieldStrong.ts` — extracted helper
- `src/parse/constructs/SectionBlock/constants.ts` — TAG_PATTERN_G, KIND_PATTERN
- `src/parse/constructs/SectionBlock/index.ts` — barrel exports
- `src/parse/constructs/SectionBlock/private/extractTags.ts` — extracted helper
- `src/parse/constructs/NaturalBlock/index.ts` — barrel exports
- `src/parse/constructs/Tag/constants.ts` — TAG_PATTERN
- `src/parse/constructs/Tag/index.ts` — barrel exports
- `src/parse/index.ts` — refactored to re-export from barrels and config
- `src/parse/framework/createNestedContext.ts` — updated imports
- `src/parse/framework/getFactory.ts` — updated imports
- `src/parse/framework/rawSlice.ts` — updated imports
- `src/parse/framework/flushGap.ts` — updated imports
- `src/parse/framework/findTagable.ts` — updated imports
- `src/parse/framework/createDocumentContext.ts` — updated imports
- `src/parse/constructs/FieldBlock/factory.ts` — updated imports, removed inline helpers
- `src/parse/constructs/FieldBlock/preProcessor.ts` — updated imports
- `src/parse/constructs/SectionBlock/factory.ts` — updated imports, removed inline helpers
- `src/parse/constructs/SectionBlock/handler.ts` — updated imports
- `src/parse/constructs/NaturalBlock/factory.ts` — updated imports
- `src/parse/constructs/Tag/factory.ts` — updated imports

## Feedback

### For the planner

Instructions were clear and well-structured. The step-by-step workflow with validation commands after each step was effective. One note: the instruction suggested moving `ParserConfig` to `types.ts`, but this would create circular dependencies since it references `ConstructPreProcessor`, `ConstructFactory`, and `ConstructHandler` from construct files. Placing it in `config.ts` was the correct resolution.

### For the technical writers

No documentation issues encountered. The fixture README provides clear guidance on running tests.

### For the crew

All lint, typecheck, and test passes. The code structure is now cleaner with centralized types, co-located constants, extracted helpers, and barrel exports. Ready for parser package migration.
