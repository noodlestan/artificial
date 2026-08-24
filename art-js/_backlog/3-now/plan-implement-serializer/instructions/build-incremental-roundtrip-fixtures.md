# Instructions: `test(md-art-roundtrip): add incremental parser and serializer fixtures`

**Plan:** `implement-serializer`

**Commit.id:** `build-incremental-roundtrip-fixtures`

**Commit.message:** `build(md-art-roundtrip): add incremental parser and serializer fixtures`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

- RULE: If a fixture exposes a parser, construct, serializer, or test failure, investigate the root cause before proceeding.
- RULE: Do not rename or remove existing fixtures.
- RULE: Do not create fixture files beginning with `_`; the serializer test intentionally skips those files.
- RULE: Keep each fixture tiny and focused on the construct combination it names.
- RULE: After each fixture, inspect its generated AST snapshot before creating the next fixture.
- RULE: If a command reports errors, attempt to fix them; if the error persists, STOP and report a blocker.

## Path Variables

| Variable              | Resolved Path                                 | Purpose                                           |
| --------------------- | --------------------------------------------- | ------------------------------------------------- |
| `$PROJECT`            | `$WORKSPACE/repos/artificial-parser-planning` | project repository root                           |
| `$PACKAGE_PARSER`     | `$PROJECT/art-js/libs/parser/`                | parser package and fixture suite                  |
| `$PACKAGE_CONSTRUCTS` | `$PROJECT/art-js/libs/constructs/`            | construct implementations and unit tests          |
| `$PACKAGE_SERIALIZER` | `$PROJECT/art-js/libs/serializer/`            | serializer implementation used by roundtrip tests |

## Working Agreements

1. **This instruction is self-contained.** Everything needed is in this file plus its mandatory reading.
2. **The report is self-contained.** Record every fixture, AST observation, command result, fix, and remaining oddity in the rendered report.
3. **User interaction is minimal.** Report only completion or a blocker in chat; keep the execution trail in the report.

## Goals

Build a small, deliberately incremental fixture ladder from the passing `hello-world.md` baseline. Each fixture must isolate one additional parser/serializer responsibility: a section heading, an inline field, a block field, and their combinations. The fixtures should make construct detection and roundtrip regressions easy to diagnose rather than relying on large real-world documents.

The instruction also documents the current architecture while executing the fixtures:

## Parser Architecture

### Parse pipeline: preprocessor, handler, factory

- The builder parses Markdown to mdast, visits nodes in source order, and offers each node to configured preprocessors before specialised factories and the natural fallback.
- A **preprocessor** (`preProcess`) combines detection and creation for constructs that claim a complete mdast node immediately. It returns a record or `null`; `FieldInline` and `FieldBlock` use this path for field paragraphs.
- A **factory** (`detect`/`create`) recognises and creates specialised records when no preprocessor claims the node. `SectionBlock` uses this path for headings. The builder does not inspect construct fields and there is no `shouldVisit` hook; claimed records own any child conversion they need.
- A **handler** (`handle`) inserts a record, mutates construct-owned capture state, and may return a nested `VisitContext`. `SectionBlock` and `FieldBlock` use handlers; `FieldInline` is a leaf preprocessor.
- Before dispatching each record, the builder calls `currentContext.beforeRecord(record)`. This lets the active FieldBlock context return to its parent when a boundary record arrives. The builder remains construct-agnostic.
- The current API is therefore `preProcess`, `detect/create`, and `handle`, grouped by the optional `ConstructParser` record. `canPreProcess` and `shouldVisit` are removed.

### Insights

- The parser and construct-parser APIs need a readability pass. Their responsibilities should be expressed as capture rules and tested as state transitions rather than inferred from generic callbacks.
- The intended capture rules are simple in pseudocode but difficult to see in the current implementation. For example:

  ```text
  FieldBlock:
    capture the following NaturalBlock values in field.value
    stop when the next SectionBlock, FieldBlock, or FieldInline begins
  ```

  The implementation should make this lifecycle and its stopping conditions explicit.

- `FieldInline` cannot reduce the paragraph tail to a raw string. It must continue parsing every child after the field label. Phrasing children are represented as `NaturalExpression` records, preserving their mdast `type`, attributes, value, and recursively converted children.
- A field paragraph must consume the complete paragraph tail so that every inline child can be processed. This should leave room for future constructs, such as a `Tag`, to claim or transform an inline child instead of silently losing its structure.
- MDAST already distinguishes headings, paragraphs, and other block-level nodes from phrasing children such as text, emphasis, links, and code. The parser now models that boundary deliberately: `NaturalBlock` handles block content and `NaturalExpression` handles `PhrasingContent`.
- Natural conversion should recurse through all mdast children and retain generic attributes, including list-item attributes, instead of maintaining restrictive special cases for individual node types.
- Add this parser/construct API cleanup to the parking lot: document dispatch and capture semantics, extract capture rules into readable helpers or state transitions, and add focused tests for child traversal, capture stopping, nesting, and inline-child preservation.

### toMdast pipeline: construct name and `toMdast()`

- Each serializer adapter is selected by the construct name (`construct`, for example `SectionBlock`, `FieldInline`, or `FieldBlock`).
- `toMdast(node)` converts one AST construct into mdast nodes. `NaturalExpression` reconstructs its mdast node from the stored type, attributes, value, and children. `FieldInline.toMdast()` emits a paragraph containing a strong `Name:` node, a space, and the inline value. Section and block-field converters preserve their respective heading or block structure.
- Read the relevant `create*ToMdast.ts` files before diagnosing a roundtrip mismatch. Do not “fix” a fixture by changing its expected output without understanding the construct conversion.

## Mandatory Reading

- `$PROJECT/architecture/index.md` — ecosystem and AST conventions.
- `$PACKAGE_PARSER/test/fixtures/hello-world.md` and `hello-world.md.json` — passing baseline.
- `$PACKAGE_PARSER/src/builder.ts` — parser dispatch order and context handling.
- `$PACKAGE_PARSER/src/config/createDefaultConfig.ts` — enabled parser constructs and their order.
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/createFieldInlinePreProcessor.ts` — inline field detection and capture.
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldInline/createFieldInlineToMdast.ts` — inline field rendering.
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/private/createFieldBlockPreProcessor.ts` — block field detection.
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/private/createFieldBlockHandler.ts` — block field nesting/context behavior.
- `$PACKAGE_CONSTRUCTS/src/constructs/FieldBlock/private/createFieldBlockCreator.ts` — block field factory behavior.
- `$PACKAGE_CONSTRUCTS/src/constructs/SectionBlock/createSectionBlockParser.ts` — section factory and handler wiring.
- `$PACKAGE_CONSTRUCTS/src/constructs/SectionBlock/private/createSectionBlockCreator.ts` — section AST creation.
- `$PACKAGE_CONSTRUCTS/src/constructs/SectionBlock/private/createSectionBlockHandler.ts` — section nesting behavior.

## Setup

Run from `$PROJECT`:

```bash
npm ci
```

## Changes

Add focused markdown fixtures and their generated parser snapshots, plus narrowly scoped construct implementation or unit-test changes required by demonstrated failures. Numbered fixtures are roundtrip-ready; underscore-prefixed fixtures are parser-only exploratory material and may be regenerated deliberately for analysis, but are not serializer acceptance criteria.

## Fixture Ladder

Create and verify these fixtures in order. Use the exact names so `--fixture {name}` is unambiguous:

1. Existing baseline: `hello-world.md` — `# Hello World` only; confirm it still passes.
2. `section-block.md` — `# Hello World` followed by one child heading, `## Details`; exercises two `SectionBlock` records and nesting.
3. `field-inline.md` — `# Hello World` followed by `**Greeting:** Hello world.`; exercises one `SectionBlock` and one `FieldInline`.
4. `field-block.md` — `# Hello World` followed by `**Description:**` and one paragraph on the next line; exercises one `SectionBlock` and one `FieldBlock`.
5. `section-inline-field.md` — `# Hello World`, `## Details`, and one inline field under the child section; combines section nesting with `FieldInline`.
6. `section-block-field.md` — `# Hello World`, `## Details`, and one block field under the child section; combines section nesting with `FieldBlock`.
7. `section-inline-and-block-fields.md` — `# Hello World`, `## Details`, one inline field, and one block field; combines all target constructs in a single small document.

Use simple field names and values. Keep blank lines conventional and stable. Do not add unrelated prose, tags, lists, emphasis, or multiple nesting levels until all seven cases pass.

## Per-Fixture Workflow

For each fixture, in ladder order:

1. Create `$PACKAGE_PARSER/test/fixtures/{fixture}.md`.
2. Generate its snapshot with:

   ```bash
   cd $PACKAGE_PARSER
   npm run test-parser -- --fixture {fixture} --write
   ```

   The parser runner is `test-parser`.

3. Inspect `$PACKAGE_PARSER/test/fixtures/{fixture}.md.json` as JSON. Record:
   - every construct name and nesting relationship;
   - captured names, values, depths, children, and source positions;
   - whether inline content became `FieldInline` and next-line content became `FieldBlock`;
   - any omission, duplication, surprising whitespace, incorrect parent, or unexpected `NaturalBlock`.
4. Run the focused serializer check:

   ```bash
   cd $PACKAGE_PARSER
   npm run test-serializer -- --fixture {fixture}
   ```

   The fixture name is the basename without `.md`; use an unambiguous substring only when necessary.

5. Treat a non-zero failure or a reported roundtrip mismatch as a debugging task, not as an acceptable snapshot update. Use `--debug-write` to compare generated parser JSON or serialized Markdown with the fixture source.
6. If the fixture fails, inspect the responsible parser/construct/serializer code, make the smallest corrective change, add or update a focused unit test under `$PACKAGE_CONSTRUCTS` when the behavior belongs to a construct, and run `cd $PACKAGE_CONSTRUCTS && npm run test` before retrying the fixture.
7. Only after the focused fixture passes, continue to the next ladder case.

## Steps

### Step 1/7 — Confirm the baseline

Run the per-fixture workflow for `hello-world`. Confirm its snapshot contains the expected `Document → SectionBlock` shape and its serializer roundtrip passes.

### Step 2/7 — Add section-only fixture

Create and verify `section-block.md`. Confirm the child heading is captured as a nested `SectionBlock`, with correct heading depths and parent-child relationship.

### Step 3/7 — Add inline-field fixture

Create and verify `field-inline.md`. Confirm the inline field is a leaf `FieldInline` with the expected `name`, `value`, and position; confirm `FieldInline.toMdast()` emits `**Greeting:** Hello world.`.

### Step 4/7 — Add block-field fixture

Create and verify `field-block.md`. Confirm the field is a `FieldBlock`, its value captures the following content, and the handler nests content under the field rather than flattening it or creating an unexpected natural block.

### Step 5/7 — Combine section and inline field

Create and verify `section-inline-field.md`. Confirm the inline field belongs to `Details` and does not escape to the parent section.

### Step 6/7 — Combine section and block field

Create and verify `section-block-field.md`. Confirm the block field belongs to `Details`, its nested value is correct, and section transitions close the field context correctly.

### Step 7/7 — Combine inline and block fields

Create and verify `section-inline-and-block-fields.md`. Confirm both field forms coexist in order under the same section and serialize without one field consuming or reclassifying the other.

## Verification

After every fixture:

```bash
cd $PACKAGE_PARSER
npm run test-parser -- --fixture {fixture} --write
npm run test-serializer -- --fixture {fixture}
```

Use `--debug-write` to create a `.debug.json` parser snapshot or `.parsed.md` serializer output for comparison; do not confuse either debug output with the checked-in acceptance snapshot.

When a construct fix is made:

```bash
cd $PACKAGE_CONSTRUCTS
npm run test
npm run lint
npm run build
```

Final verification:

```bash
cd $PACKAGE_PARSER
npm run test-parser
npm run test-serializer

cd $PACKAGE_CONSTRUCTS
npm run lint
npm run build
npm run test

cd $PROJECT
git status
npm run ci
```

Confirm that all seven named fixtures are tested, no new fixture begins with `_`, each `.md.json` snapshot matches the inspected AST, and the report contains the per-fixture construct observations and any fixes.

## How to Report Back to the Delegator

1. State whether reporting completion or a BLOCKER.
2. Render the report next to this instruction as `build-incremental-roundtrip-fixtures__report.md`.
3. Include a compact row or bullet for every fixture: source file, detected constructs, AST oddities, serializer result, and any code/test fix.
4. Include the actual parser script name used (`test-parser`) and final verification results.
5. Keep the chat response terse: state completion or the blocker and point to the report.
