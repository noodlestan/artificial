# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `apply-conventions-and-extend-test-coverage`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `apply-conventions-and-extend-test-coverage`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Prepare POC source code for migration to parser package by:

1. Extending test coverage with real-world fixture files from the corpus
2. Applying code conventions to organize types, constants, and helper functions
3. Ensuring each construct module exposes a clean public API via index.ts barrels
4. Verifying tag detection works correctly across fixtures

## Mandatory Reading

- `art-js/cli/poc-parse/src/parse/types.ts` — core record schema
- `art-js/cli/poc-parse/src/parse/index.ts` — current public API
- `art-js/cli/poc-parse/src/parse/framework/createNestedContext.ts` — VisitContext and MdastNode types
- `art-js/cli/poc-parse/src/parse/framework/getFactory.ts` — ConstructFactory interface
- `art-js/cli/poc-parse/src/parse/constructs/FieldBlock/factory.ts` — isFieldStrong helper
- `art-js/cli/poc-parse/src/parse/constructs/SectionBlock/factory.ts` — TAG_PATTERN, KIND_PATTERN constants
- `art-js/cli/poc-parse/src/parse/constructs/Tag/factory.ts` — TAG_PATTERN constant
- `art-js/cli/poc-parse/scripts/test-fixtures.sh` — fixture test script
- `architecture/records/adr/parser.art` — real-world ADR with multiple decisions
- `architecture/records/adr/configuration.art` — smaller ADR example

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. Add Real-World Fixtures

Copy real `.art` files from the corpus to `fixtures/`:

- `parser.art` → `fixtures/parser.art` (46 lines, multiple decisions with fields)
- `configuration.art` → `fixtures/configuration.art` (13 lines, smaller example)

Update `scripts/test-fixtures.sh` to include these new fixtures in the FIXTURES array.

Add `fixtures/README.md` documenting:

- Purpose of each fixture file
- What constructs each fixture tests
- How to run the fixture tests

### 2. Apply Code Conventions

#### 2.1 Extract Types to framework/types.ts

Move type definitions from `framework/createNestedContext.ts` and `framework/getFactory.ts` to a new `framework/types.ts`:

```typescript
// framework/types.ts
export type MdastNode = Node;

export interface VisitContext {
  capturing(): string | undefined;
  target(): BlockContent[];
  push(record: BlockContent): void;
  parent(): VisitContext | undefined;
  source: string;
  lastEnd: Point | undefined;
}

export interface ConstructFactory {
  detect(node: MdastNode, context: VisitContext): boolean;
  create(node: MdastNode, context: VisitContext): Construct;
  shouldVisit: boolean;
}
```

Update imports in all framework files to import from `./types`.

#### 2.2 Extract Constants to constants.ts Files

For each construct, extract pattern constants:

**FieldBlock/constants.ts:**

```typescript
export const FIELD_TEXT_PATTERN = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;
```

**SectionBlock/constants.ts:**

```typescript
export const TAG_PATTERN_G = /\(#([\w-]+)\)/g;
export const KIND_PATTERN = /^([\w-]+(?: [\w-]+)*):\s*(.+)$/;
```

**Tag/constants.ts:**

```typescript
export const TAG_PATTERN = /\(#([\w-]+)\)/;
```

**src/parse/constants.ts:**

```typescript
export const BLOCK_TYPES = new Set([
  'paragraph',
  'code',
  'list',
  'blockquote',
  'table',
  'thematicBreak',
  'html',
  'definition',
]);
```

#### 2.3 Extract Helper Functions to private/

Move single-purpose helper functions to `private/` files:

**FieldBlock/private/isFieldStrong.ts:**

```typescript
import type { Strong } from 'mdast';
import type { MdastNode, VisitContext } from '../../framework/types';
import { rawSlice } from '../../framework/rawSlice';
import { FIELD_TEXT_PATTERN } from '../constants';

function stripStrong(node: Strong, context: VisitContext): string {
  const raw = rawSlice(node, context);
  if (raw.length >= 4 && raw.startsWith('**') && raw.endsWith('**')) return raw.slice(2, -2);
  if (raw.length >= 4 && raw.startsWith('__') && raw.endsWith('__')) return raw.slice(2, -2);
  return raw;
}

export function isFieldStrong(node: MdastNode, context: VisitContext): node is Strong {
  return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
}
```

**SectionBlock/private/extractTags.ts:**

```typescript
import type { Tag } from '../../types';
import { TAG_PATTERN_G } from '../constants';

export function extractTags(text: string): Tag[] {
  const tags: Tag[] = [];
  for (const match of text.matchAll(TAG_PATTERN_G)) {
    tags.push({ construct: 'Tag', name: match[1] });
  }
  return tags;
}
```

#### 2.4 Add index.ts Barrels for Each Construct

Each construct directory should have an `index.ts` that explicitly exports the public API:

**FieldBlock/index.ts:**

```typescript
export { fieldBlockFactory, createFieldBlockFromParagraph } from './factory';
export { createFieldBlockHandler } from './handler';
export { createFieldDetectionPreProcessor } from './preProcessor';
export type { ConstructPreProcessor } from './preProcessor';
```

**SectionBlock/index.ts:**

```typescript
export { sectionBlockFactory } from './factory';
export { createSectionBlockHandler } from './handler';
export type { ConstructHandler } from './handler';
```

**NaturalBlock/index.ts:**

```typescript
export { naturalBlockFactory, createNaturalBlock } from './factory';
```

**Tag/index.ts:**

```typescript
export { tagFactory } from './factory';
export { createTagRoutingHandler } from './handler';
```

#### 2.5 Clean Up src/parse/index.ts

Move types and constants out of `src/parse/index.ts`:

- Remove `BLOCK_TYPES` constant → move to `src/parse/constants.ts`
- Remove `ParserConfig` interface → move to `src/parse/types.ts` or `src/parse/framework/types.ts`
- Keep only re-exports and `createDefaultConfig`, `isBlockType` functions

Update `src/parse/index.ts` to:

```typescript
// Re-export framework types
export type { MdastNode, VisitContext, ConstructFactory } from './framework/types';

// Re-export construct public APIs
export type { ConstructHandler } from './constructs/SectionBlock';
export type { ConstructPreProcessor } from './constructs/FieldBlock';

export {
  // Framework
  cleanPosition,
  createDocumentContext,
  createNestedContext,
  findTagable,
  flushGap,
  getFactory,
  rawSlice,
  sectionDepth,
  // Constructs
  createFieldBlockFromParagraph,
  createFieldBlockHandler,
  createFieldDetectionPreProcessor,
  createNaturalBlock,
  createSectionBlockHandler,
  createTagRoutingHandler,
  fieldBlockFactory,
  naturalBlockFactory,
  sectionBlockFactory,
  tagFactory,
} from './constructs';

// Local exports
export { isBlockType } from './constants';
export { createDefaultConfig } from './config';
export type { ParserConfig } from './types';
```

Create `src/parse/config.ts`:

```typescript
import { createFieldDetectionPreProcessor } from './constructs/FieldBlock';
import { createFieldBlockHandler } from './constructs/FieldBlock';
import { fieldBlockFactory } from './constructs/FieldBlock';
import { createSectionBlockHandler } from './constructs/SectionBlock';
import { sectionBlockFactory } from './constructs/SectionBlock';
import { createTagRoutingHandler } from './constructs/Tag';
import { tagFactory } from './constructs/Tag';
import type { ParserConfig } from './types';

export function createDefaultConfig(): ParserConfig {
  return {
    preProcessors: [createFieldDetectionPreProcessor()],
    factories: [sectionBlockFactory, tagFactory],
    handlers: [createSectionBlockHandler(), createFieldBlockHandler(), createTagRoutingHandler()],
  };
}
```

### 3. Verify Tag Detection

Inspect the existing fixture `.art.json` files to verify:

1. `markdown.art.json` contains Tag records for `(#generator)` and `(#wip)` in the "Tags in Prose" section
2. `section-block.art.json` contains Tag records for `(#generator)` in the "Decision: Two Main Use Cases" section
3. Tags are NOT detected inside code blocks (verify "Tags in Code" section has no Tag records)

Run the parser on the new fixtures (`parser.art`, `configuration.art`) and verify the output structure is correct.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Add real-world fixture files and update test script
Step 2. Extract types to framework/types.ts
Step 3. Extract constants to constants.ts files
Step 4. Extract helper functions to private/ directories
Step 5. Add index.ts barrels for each construct
Step 6. Clean up src/parse/index.ts and create config.ts
Step 7. Verify tag detection and run full test suite

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck
- Execute `npm run ci` in `art-js/cli/poc-parse/` to run full CI suite

## Steps

## Step `1 / 7` — Add real-world fixture files and update test script

Copy real `.art` files from the corpus:

```bash
cp architecture/records/adr/parser.art art-js/cli/poc-parse/fixtures/parser.art
cp architecture/records/adr/configuration.art art-js/cli/poc-parse/fixtures/configuration.art
```

Update `art-js/cli/poc-parse/scripts/test-fixtures.sh`:

```bash
FIXTURES=("markdown.md" "section-block.md" "field-block.md" "parser.art" "configuration.art")
```

Create `art-js/cli/poc-parse/fixtures/README.md`:

````markdown
# Parser Fixtures

Test fixtures for the poc-parse parser.

## Fixture Files

- `markdown.md` — Standard markdown syntax (paragraphs, lists, code, blockquotes, tables, tags in prose)
- `section-block.md` — SectionBlock constructs with tags
- `field-block.md` — FieldBlock constructs with various value types
- `parser.art` — Real-world ADR with multiple Decision sections and fields
- `configuration.art` — Smaller ADR example

## Generated Files

- `*.art.json` — Parser output for each fixture (auto-generated by test-fixtures.sh)

## Running Tests

```bash
cd art-js/cli/poc-parse
npm run ci
# or directly:
bash scripts/test-fixtures.sh
```
````

The test script runs each fixture 3 times and verifies identical output (deterministic parsing).

````

**Extra validation commands:**

- Execute `bash scripts/test-fixtures.sh` in `art-js/cli/poc-parse/` to generate .art.json files for new fixtures

## Step `2 / 7` — Extract types to framework/types.ts

Create `art-js/cli/poc-parse/src/parse/framework/types.ts`:

```typescript
import type { Node } from 'unist';

import type { BlockContent, Construct, Point } from '../types';

export type MdastNode = Node;

export interface VisitContext {
  capturing(): string | undefined;
  target(): BlockContent[];
  push(record: BlockContent): void;
  parent(): VisitContext | undefined;
  source: string;
  lastEnd: Point | undefined;
}

export interface ConstructFactory {
  detect(node: MdastNode, context: VisitContext): boolean;
  create(node: MdastNode, context: VisitContext): Construct;
  shouldVisit: boolean;
}
````

Update `framework/createNestedContext.ts`:

- Remove `MdastNode` and `VisitContext` type definitions
- Import from `./types`
- Keep `getSectionMap` and `createNestedContext` functions

Update `framework/getFactory.ts`:

- Remove `ConstructFactory` interface
- Import from `./types`
- Keep `getFactory` function

Update all files that import these types to import from `./types` instead.

**Extra validation commands:**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck

## Step `3 / 7` — Extract constants to constants.ts files

Create constant files for each construct:

**FieldBlock/constants.ts:**

```typescript
export const FIELD_TEXT_PATTERN = /^[A-Za-z][A-Za-z ]*:(?:\s|$)/;
```

**SectionBlock/constants.ts:**

```typescript
export const TAG_PATTERN_G = /\(#([\w-]+)\)/g;
export const KIND_PATTERN = /^([\w-]+(?: [\w-]+)*):\s*(.+)$/;
```

**Tag/constants.ts:**

```typescript
export const TAG_PATTERN = /\(#([\w-]+)\)/;
```

**src/parse/constants.ts:**

```typescript
export const BLOCK_TYPES = new Set([
  'paragraph',
  'code',
  'list',
  'blockquote',
  'table',
  'thematicBreak',
  'html',
  'definition',
]);
```

Update the corresponding factory files to import constants from `./constants` instead of defining them inline.

**Extra validation commands:**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck

## Step `4 / 7` — Extract helper functions to private/ directories

Create `private/` directories and extract helper functions:

**FieldBlock/private/isFieldStrong.ts:**

```typescript
import type { Strong } from 'mdast';

import type { MdastNode, VisitContext } from '../../framework/types';
import { rawSlice } from '../../framework/rawSlice';
import { FIELD_TEXT_PATTERN } from '../constants';

function stripStrong(node: Strong, context: VisitContext): string {
  const raw = rawSlice(node, context);
  if (raw.length >= 4 && raw.startsWith('**') && raw.endsWith('**')) return raw.slice(2, -2);
  if (raw.length >= 4 && raw.startsWith('__') && raw.endsWith('__')) return raw.slice(2, -2);
  return raw;
}

export function isFieldStrong(node: MdastNode, context: VisitContext): node is Strong {
  return node.type === 'strong' && FIELD_TEXT_PATTERN.test(stripStrong(node as Strong, context));
}
```

**SectionBlock/private/extractTags.ts:**

```typescript
import type { Tag } from '../../types';
import { TAG_PATTERN_G } from '../constants';

export function extractTags(text: string): Tag[] {
  const tags: Tag[] = [];
  for (const match of text.matchAll(TAG_PATTERN_G)) {
    tags.push({ construct: 'Tag', name: match[1] });
  }
  return tags;
}
```

Update `FieldBlock/factory.ts` to import `isFieldStrong` from `./private/isFieldStrong`.
Update `SectionBlock/factory.ts` to import `extractTags` from `./private/extractTags`.

**Extra validation commands:**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck

## Step `5 / 7` — Add index.ts barrels for each construct

Create `index.ts` files for each construct directory that explicitly export the public API:

**FieldBlock/index.ts:**

```typescript
export { fieldBlockFactory, createFieldBlockFromParagraph } from './factory';
export { createFieldBlockHandler } from './handler';
export { createFieldDetectionPreProcessor } from './preProcessor';
export type { ConstructPreProcessor } from './preProcessor';
```

**SectionBlock/index.ts:**

```typescript
export { sectionBlockFactory } from './factory';
export { createSectionBlockHandler } from './handler';
export type { ConstructHandler } from './handler';
```

**NaturalBlock/index.ts:**

```typescript
export { naturalBlockFactory, createNaturalBlock } from './factory';
```

**Tag/index.ts:**

```typescript
export { tagFactory } from './factory';
export { createTagRoutingHandler } from './handler';
```

Update `src/parse/index.ts` to import from construct barrels instead of individual files.

**Extra validation commands:**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck

## Step `6 / 7` — Clean up src/parse/index.ts and create config.ts

Move `ParserConfig` interface to `src/parse/types.ts`:

```typescript
// Add to types.ts
export interface ParserConfig {
  preProcessors: ConstructPreProcessor[];
  factories: ConstructFactory[];
  handlers: ConstructHandler[];
}
```

Create `src/parse/config.ts`:

```typescript
import {
  createFieldDetectionPreProcessor,
  createFieldBlockHandler,
  fieldBlockFactory,
} from './constructs/FieldBlock';
import { createSectionBlockHandler, sectionBlockFactory } from './constructs/SectionBlock';
import { createTagRoutingHandler, tagFactory } from './constructs/Tag';
import type { ParserConfig } from './types';

export function createDefaultConfig(): ParserConfig {
  return {
    preProcessors: [createFieldDetectionPreProcessor()],
    factories: [sectionBlockFactory, tagFactory],
    handlers: [createSectionBlockHandler(), createFieldBlockHandler(), createTagRoutingHandler()],
  };
}
```

Update `src/parse/index.ts` to:

- Remove `ParserConfig` interface (now in types.ts)
- Remove `BLOCK_TYPES` constant (now in constants.ts)
- Remove `createDefaultConfig` function (now in config.ts)
- Keep only re-exports and `isBlockType` function

```typescript
// Re-export framework types
export type { MdastNode, VisitContext, ConstructFactory } from './framework/types';

// Re-export construct public APIs
export type { ConstructHandler } from './constructs/SectionBlock';
export type { ConstructPreProcessor } from './constructs/FieldBlock';

// Re-export construct implementations
export {
  cleanPosition,
  createDocumentContext,
  createFieldBlockFromParagraph,
  createFieldBlockHandler,
  createFieldDetectionPreProcessor,
  createNaturalBlock,
  createNestedContext,
  createSectionBlockHandler,
  createTagRoutingHandler,
  fieldBlockFactory,
  findTagable,
  flushGap,
  getFactory,
  naturalBlockFactory,
  rawSlice,
  sectionBlockFactory,
  sectionDepth,
  tagFactory,
} from './constructs';

// Local exports
export { isBlockType } from './constants';
export { createDefaultConfig } from './config';
export type { ParserConfig } from './types';
```

Update `builder.ts` and `parse.ts` to import from the updated locations.

**Extra validation commands:**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck

## Step `7 / 7` — Verify tag detection and run full test suite

Inspect the generated `.art.json` files to verify tag detection:

1. Check `fixtures/markdown.art.json`:
   - Verify "Tags in Prose" section contains Tag records for `(#generator)` and `(#wip)`
   - Verify "Tags in Code" section does NOT contain Tag records (tags inside code blocks should not be detected)

2. Check `fixtures/section-block.art.json`:
   - Verify "Decision: Two Main Use Cases" section contains Tag record for `(#generator)`

3. Check `fixtures/parser.art.json` and `fixtures/configuration.art.json`:
   - Verify the output structure is correct (SectionBlock → FieldBlock/NaturalBlock hierarchy)
   - Verify all fields are correctly classified

Run the full test suite:

```bash
npm run ci
```

Verify:

- All fixtures pass (3 runs produce identical output)
- Lint passes
- Typecheck passes

**Extra validation commands:**

- Execute `npm run ci` in `art-js/cli/poc-parse/` to run full CI suite

## Final Verification

**Sanity check**

The POC source code should now follow consistent conventions:

- Types are centralized in `framework/types.ts` and `types.ts`
- Constants are close to where they're used in `constants.ts` files
- Helper functions are in `private/` directories
- Each construct exposes a clean public API via `index.ts` barrels
- The main `index.ts` is clean and only re-exports

**Verification steps**

- Execute `npm run lint` in `art-js/cli/poc-parse/` to validate format and typecheck
- Execute `npm run ci` in `art-js/cli/poc-parse/` to run full CI suite
- Verify all fixtures pass (including new `parser.art` and `configuration.art`)
- Verify tag detection works correctly across all fixtures
- Verify the code structure is clean and follows conventions

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-poc-parse/instructions/apply-conventions-and-extend-test-coverage__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `apply-conventions-and-extend-test-coverage`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
