# Instructions: `build(md-art-roundtrip): bootstrap serializer lib`

**Plan:** `implement-serializer`

**Commit.id:** `bootstrap-serializer-lib`

**Commit.message:**

```commit
build(md-art-roundtrip): bootstrap serializer lib

- Create `@art-js/artificial-serializer` package.
- Implement `serialize(document): string` — artast → mdast → md pipeline.
- Add unit tests for serializer.
```

NOTE: Before committing, update the body of the commit message to reflect the changes made as bullet points.

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Path Variables

| Variable              | Path                                                      | Purpose                                           |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| `$WORKSPACE`          | Current working directory.                                | explained in `$WORKSPACE/\_guide.md`.             |
| `$PROJECT`            | Provided with prompt                                      | Repository root for all code changes              |
| `$PACKAGE_SERIALIZER` | `$PROJECT/art-js/libs/serializer/`                        | Package being created in this instruction         |
| `$PACKAGE_PRIMITIVES` | `$PROJECT/art-js/libs/primitives/`                        | Reference layout for scaffold; runtime dependency |
| `$PACKAGE_CONSTRUCTS` | `$PROJECT/art-js/libs/constructs/`                        | Reference layout; runtime dependency (types)      |
| `$PACKAGE_PARSER`     | `$PROJECT/art-js/libs/parser/`                            | Reference for parse() entry point pattern         |
| `$RECORD_SERIALIZER`  | `$PROJECT/ops/records/packages/artificial-serializer.art` | Package record to create                          |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `bootstrap-serializer-lib`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Bootstrap the serializer package to enable lossless roundtrip: `parse .art → serialize back → zero diffs`.
The serializer inverts the parser — it walks the artast tree, delegates each construct to a co-located ToMdast function, and converts the resulting pure mdast back to markdown.

## Mandatory Reading

- `$PACKAGE_CONSTRUCTS/src/constructs/types.ts` — construct type definitions including the new `ConstructToMdast` and `ConstructToMdastFactory`.
- `$PACKAGE_CONSTRUCTS/src/constructs/` — construct directories (Document, SectionBlock, FieldBlock, NaturalBlock, Tag) that define the input shape for ToMdast functions.
- `$PACKAGE_PRIMITIVES/package.json` — reference layout to mirror for the new package.
- `$PACKAGE_CONSTRUCTS/package.json` — reference for dependencies pattern.
- `$PACKAGE_PARSER/src/index.ts` — reference for the parse() entry point pattern.
- `$PACKAGE_PARSER/src/config/createDefaultConfig.ts` — reference for the config pattern (parser factories).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from `$PROJECT` repository directory:

```bash
npm ci # to install dependencies.
```

## Changes

This iteration creates the serializer package and implements the core serialize function:

1. Scaffold the `@art-js/artificial-serializer` package at `$PACKAGE_SERIALIZER` (package.json, tsconfig, vite config, vitest config, license, dotfiles, src/index.ts). Mirrors `$PACKAGE_PRIMITIVES` scaffold.
2. Add `ConstructToMdast` and `ConstructToMdastFactory` types to `$PACKAGE_CONSTRUCTS/src/constructs/types.ts`.
3. Implement co-located ToMdast functions in each construct package (Document, SectionBlock, FieldBlock, NaturalBlock, Tag).
4. Implement `artAstToMdast(config, document)` that walks the artast tree depth-first, delegates to construct ToMdast functions, and produces a pure mdast Root.
5. Implement `serialize(document: ArtDocument): string` — artast → mdast → markdown pipeline.
6. Add unit tests covering the serialize function.
7. Register the package record at `$RECORD_SERIALIZER`.

## Workflow

You are going to perform a series of steps and check status after each one.

1. Scaffold the serializer package and add ConstructToMdast type
2. Implement the serializer and construct ToMdast functions
3. Add unit tests
4. Register the package record
5. Verify

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

### Rules

- RULE: You are FORBIDDEN from return to a previous step.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Steps

### Step `1 / 4` — Scaffold the serializer package and add ConstructToMdast type

Create `$PACKAGE_SERIALIZER` mirroring the layout of `$PACKAGE_PRIMITIVES`.
Add the `ConstructToMdast` type to `$PACKAGE_CONSTRUCTS` so both parser and serializer share the contract.

**Files to create:**

- `$PACKAGE_SERIALIZER/package.json` — based on `$PACKAGE_PRIMITIVES/package.json` pattern:
  - name: `@art-js/artificial-serializer`
  - version: `0.0.1`
  - description: "Serializes Art documents back to markdown."
  - dependencies: `@art-js/artificial-primitives: "*"`, `@art-js/artificial-constructs: "*"`
  - devDependencies: same as `$PACKAGE_PRIMITIVES/package.json` (vite, solid-js, etc.)
  - scripts: same as `$PACKAGE_PRIMITIVES/package.json` but test runs actual tests (not `echo none yet`)

- `$PACKAGE_SERIALIZER/tsconfig.json` — same as `$PACKAGE_PRIMITIVES/tsconfig.json`.
- `$PACKAGE_SERIALIZER/vite.config.ts` — same as `$PACKAGE_PRIMITIVES/vite.config.ts`.
- `$PACKAGE_SERIALIZER/vitest.config.ts` — same as `$PACKAGE_PRIMITIVES/vitest.config.ts`.
- `$PACKAGE_SERIALIZER/.npmignore` — same as `$PACKAGE_PRIMITIVES/.npmignore`.
- `$PACKAGE_SERIALIZER/.prettierignore` — same as `$PACKAGE_PRIMITIVES/.prettierignore`.
- `$PACKAGE_SERIALIZER/LICENSE-MIT` — same as `$PACKAGE_PRIMITIVES/LICENSE-MIT`.
- `$PACKAGE_SERIALIZER/README.md` — similar as `$PACKAGE_PRIMITIVES/README.md`.
- `$PACKAGE_SERIALIZER/src/index.ts` — entry point, initially exporting the `serialize` function.

**Type definition — add to `$PACKAGE_CONSTRUCTS`:**

```typescript
// $PACKAGE_CONSTRUCTS/src/constructs/types.ts — append:

import type { Node } from 'mdast';

/** A construct's serializer function. Receives the construct node and returns an mdast node. */
export interface ConstructToMdast {
  construct: string;
  toMdast(node: Construct, children: Node[]): Node;
}

/** Factory that creates a ConstructToMdast — same pattern as ConstructParserFactory. */
export type ConstructToMdastFactory = () => ConstructToMdast;
```

Export the new types from `$PACKAGE_CONSTRUCTS/src/index.ts`:

```typescript
export type { ConstructToMdast, ConstructToMdastFactory } from './constructs/types';
```

**Extra validation commands:**

```bash
cd $PACKAGE_SERIALIZER && npm run lint
```

### Step `2 / 4` — Implement the serializer and construct ToMdast functions

The serializer builds a pure mdast by walking the artast tree and calling each construct's ToMdast function, then converts the mdast to markdown using `mdast-util-to-markdown`.

**Design overview:**

```pseudo
serializer (artast)                  →  ArtDocument
  → artAstToMdast(config, document)  →  Root (mdast)
  → toMarkdown(root)                 →  string (markdown)
```

The serializer delegates to co-located ToMdast functions — one per construct — following the same factory pattern as the parser. The config registers which ToMdast factories to use, just like `createDefaultConfig` registers parser factories.

**File structure:**

- `$PACKAGE_SERIALIZER/src/serializer.ts` — the entry point; orchestrates the pipeline
- `$PACKAGE_SERIALIZER/src/artAstToMdast.ts` — converts ArtDocument to mdast Root by walking children
- `$PACKAGE_CONSTRUCTS/src/constructs/Document/createDocumentToMdast.ts` — Document → mdast
- `$PACKAGE_CONSTRUCTS/src/constructs/SectionBlock/createSectionBlockToMdast.ts` — SectionBlock → mdast Heading
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockToMdast.ts` — FieldBlock → mdast Strong + children
- `$PACKAGE_CONSTRUCTS/src/constructs/NaturalBlock/createNaturalBlockToMdast.ts` — NaturalBlock → passthrough
- `$PACKAGE_CONSTRUCTS/src/constructs/Tag/createTagToMdast.ts` — Tag → mdast Text
- `$PACKAGE_SERIALIZER/src/config/createDefaultSerializerConfig.ts` — registers ToMdast factories

**Contract — serializer → construct ToMdast:**

The serializer walks the artast tree. For each construct node it:

1. Looks up the matching `ConstructToMdast` by `construct` name from the config.
2. Recursively converts the construct's `children` to mdast nodes first (depth-first).
3. Calls `toMdast(node, children)` — the construct receives its already-converted children and returns a single mdast node.

This is the inverse of the parser: the parser's `ConstructCreator.detect` + `create` maps mdast → artast; the serializer's `ConstructToMdast.toMdast` maps artast → mdast.

**Config — `createDefaultSerializerConfig.ts`:**

Mirrors `createDefaultConfig` but returns `ConstructToMdastFactory[]`:

```typescript
import {
  createDocumentToMdast,
  createFieldBlockToMdast,
  createNaturalBlockToMdast,
  createSectionBlockToMdast,
  createTagToMdast,
} from '@art-js/artificial-constructs';

import type { SerializerConfig } from './types';

export function createDefaultSerializerConfig(): SerializerConfig {
  return {
    constructs: [
      createDocumentToMdast,
      createNaturalBlockToMdast,
      createFieldBlockToMdast,
      createSectionBlockToMdast,
      createTagToMdast,
    ],
  };
}
```

**`$PACKAGE_SERIALIZER/src/config/types.ts`:**

```typescript
import type { ConstructToMdastFactory } from '@art-js/artificial-constructs';

export interface SerializerConfig {
  constructs: ConstructToMdastFactory[];
}
```

---

**Pseudo: serializer → construct ToMdast contract**

Explore how the serializer invokes each construct's ToMdast function, how children are collected, and what the actual arguments are.

```pseudo
function artAstToMdast(config: SerializerConfig, document: ArtDocument): Root {
  // 1. Build a lookup: construct name → ConstructToMdast
  const registry = new Map<string, ConstructToMdast>();
  for (const factory of config.constructs) {
    const constructToMdast = factory();
    registry.set(constructToMdast.construct, constructToMdast);
  }

  // 2. Walk depth-first: convert children before parent
  function visit(node: Construct): Node {
    const children: Node[] = ('children' in node && node.children)
      ? node.children.map(visit)   // depth-first
      : [];

    // 3. Look up the ToMdast for this construct name
    const impl = registry.get(node.construct);
    if (!impl) {
      throw Error
    }
    return impl.toMdast(node, children);
  }

  // 4. Walk the Document's children, wrap in mdast Root
  const mdastChildren = document.children.map(visit);
  return { type: 'root', children: mdastChildren };
}

function serialize(document: ArtDocument): string {
  const config = createDefaultSerializerConfig();
  const root = artAstToMdast(config, document);
  return toMarkdown(root);  // mdast-util-to-markdown
}
```

**Key question: what does `toMdast` receive for each construct?**

- `node` — the original artast construct (SectionBlock, FieldBlock, etc.)
- `children` — the already-converted mdast nodes from the construct's children (depth-first)

For constructs without children (Tag), `children` is `[]`.
For NaturalBlock, the `value` is raw markdown — the ToMdast function re-parses it into mdast nodes (using `mdast-util-from-markdown`) and returns them directly, bypassing the children array.

**Concrete example — FieldBlock toMdast:**

Input:

```artast
FieldBlock { construct: 'FieldBlock', name: 'status', value: [NaturalBlock { value: 'active' }] }
```

The visitor depth-first converts `value` children first:

```pseudo
children = [Paragraph { children: [Text { value: 'active' }] }]
```

Then calls `fieldBlock.toMdast(node, children)`:

```typescript
// $PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockToMdast.ts

import type { ConstructToMdast } from '../types';

export function createFieldBlockToMdast(): ConstructToMdast {
  return {
    construct: 'FieldBlock',
    toMdast(node, children) {
      // node.name = 'status'
      // children = [Paragraph { children: [Text { value: 'active' }] }]
      return {
        type: 'paragraph',
        children: [
          { type: 'strong', children: [{ type: 'text', value: `${node.name}:` }] },
          { type: 'text', value: ' ' },
          ...children, // spread the already-converted value children
        ],
      };
    },
  };
}
```

Output:

```mdast
Paragraph { children: [
  Strong { children: [Text { value: 'status:' }] },
  Text { value: ' ' },
  Paragraph { children: [Text { value: 'active' }] }
] }
```

Which `mdast-util-to-markdown` renders as: `**status:** active`

---

**Entry point — `$PACKAGE_SERIALIZER/src/index.ts`:**

```typescript
export { serialize } from './serializer';
```

**`$PACKAGE_SERIALIZER/src/serializer.ts`:**

```typescript
import type { ArtDocument } from '@art-js/artificial-constructs';
import { toMarkdown } from 'mdast-util-to-markdown';

import { createDefaultSerializerConfig } from './config/createDefaultSerializerConfig';
import { artAstToMdast } from './artAstToMdast';

export function serialize(document: ArtDocument): string {
  const config = createDefaultSerializerConfig();
  const root = artAstToMdast(config, document);
  return toMarkdown(root);
}
```

**Extra validation commands:**

```bash
cd $PACKAGE_SERIALIZER && npm run build
```

### Step `3 / 4` — Add unit tests

Create test files for the serializer.

**Files to create:**

- `$PACKAGE_CONSTRUCTS/src/constructs/Document/createDocumentToMdast.test.ts` — Document → mdast
- `$PACKAGE_CONSTRUCTS/src/constructs/SectionBlock/createSectionBlockToMdast.test.ts` — SectionBlock → mdast Heading
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/createFieldBlockToMdast.test.ts` — FieldBlock → mdast Strong + children
- `$PACKAGE_CONSTRUCTS/src/constructs/NaturalBlock/createNaturalBlockToMdast.test.ts` — NaturalBlock → passthrough
- `$PACKAGE_CONSTRUCTS/src/constructs/Tag/createTagToMdast.test.ts` — Tag → mdast Text
- `$PACKAGE_SERIALIZER/src/serializer.test.ts` — vitest tests for the serialize function

**Test cases for src/constructs/\*/\*.test.ts:**

- Given Json return the expected mdast (Note: copy a relevant Json input in $PACKAGE_PARSER/test/fixture/\*.art.json and hardcode it in the next as `const input` along with `const output`)

**Test cases for serializer.test.ts:**

- Serialize a Document with nested SectionBlocks
- Serialize a Document with FieldBlocks
- Serialize a Document with NaturalBlocks (text, code, list)
- Serialize a Document with Tags
- Serialize a Document with unknown construct — throws an error;
- Serialize the `$PACKAGE_PARSER/test/fixtures/field-block.md.json` fixture: parse it as ArtDocument, serialize, verify output matches a known markdown shape
- Roundtrip smoke test: read `$PACKAGE_PARSER/test/fixtures/field-block.md`, parse it, serialize the result, verify the output is valid markdown

**Extra validation commands:**

```bash
cd $PACKAGE_SERIALIZER && npm run test
```

### Step `4 / 4` — Register the package record

Create the package record at `$RECORD_SERIALIZER` following the pattern of `artificial-parser.art` and `artificial-constructs.art`.

**File to create:**

```
$RECORD_SERIALIZER
```

Content should declare:

- Package: Artificial Serializer
- Purpose: Serializes Art documents back to markdown.
- Path: `libs/serializer/` (relative to `$PROJECT`)
- Canonical Name: `@art-js/artificial-serializer`
- Version: `0.0.1`
- Language: Typescript
- Dependencies: Runtime `@art-js/artificial-primitives`, `@art-js/artificial-constructs`
- Scripts: Package Script Set: Artificial Lib Build, Package Script Set: Common Scripts
- Scaffolders: Scaffolder Skeleton: Lib Package, Scaffolder Skeleton: Package Common

## Final Verification

**Sanity check:**

- The serializer package builds without errors
- The serializer unit tests pass
- The serialize function accepts an ArtDocument and returns a string
- The package record exists at `$RECORD_SERIALIZER`

**Verification:**

Run from `$PACKAGE_SERIALIZER` package directory:

```bash
npm run lint:fix && npm run lint && npm run build && npm run test
```

Runs on pre-commit hook from the repository root:

```bash
cd $PROJECT && npm run ci # lint, build and test at repository level
```

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `$PROJECT/_backlog/3-now/plan-implement-serializer/instructions/bootstrap-serializer-lib__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `bootstrap-serializer-lib`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
