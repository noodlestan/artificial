# Instructions: `test(md-art-roundtrip): add incremental parser and serializer fixtures`

**Plan:** `implement-serializer`

**Commit.id:** `build-incremental-roundtrip-fixtures`

**Commit.message:** `test(md-art-roundtrip): add incremental parser and serializer fixtures`

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

### Parse pipeline: preprocessor, handler, factory

- **Preprocessor** (`preProcessor`) runs first for a matching mdast node and can replace it immediately. `FieldInline` and `FieldBlock` use this path to recognise field paragraphs. `canPreProcess()` decides whether the node belongs to the construct; `preProcess()` captures the construct data and source position.
- **Factory** (`factory`) detects and creates constructs when preprocessing did not claim the node. `detect()` recognises a node, `create()` builds the AST record, and `shouldVisit` controls whether child mdast nodes are visited. `SectionBlock` uses this path for headings.
- **Handler** (`handler`) manages nesting and context. `handle()` pushes the record into the current context, closes or unwinds a prior capture when needed, and creates a nested context for children. `SectionBlock` and `FieldBlock` use handlers; `FieldInline` is a leaf preprocessor and has no handler.
- The parser builder checks preprocessors before factories, then applies handlers or pushes leaf records. Read `$PACKAGE_PARSER/src/builder.ts` to verify this order.

### toMdast pipeline: construct name and `toMdast()`

- Each serializer adapter is selected by the construct name (`construct`, for example `SectionBlock`, `FieldInline`, or `FieldBlock`).
- `toMdast(node)` converts one AST construct into mdast nodes. `FieldInline.toMdast()` emits a paragraph containing a strong `Name:` node, a space, and the inline value. Section and block-field converters preserve their respective heading or block structure.
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

Add only focused markdown fixtures and their generated parser snapshots, plus any narrowly scoped construct implementation or construct unit-test changes required to correct a demonstrated failure. Do not modify skipped underscore-prefixed fixtures.

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
   npm run test-parse -- --fixture {fixture} --write
   ```

   If this repository exposes the script as `test-parser` rather than `test-parse`, use `npm run test-parser -- --fixture {fixture} --write` and record the script-name discrepancy in the report.

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

5. Treat a non-zero failure or a reported roundtrip mismatch as a debugging task, not as an acceptable snapshot update. Use `--debug-write-result` to compare the generated markdown with the fixture source.
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
npm run test-parse -- --fixture {fixture} --write
npm run test-serializer -- --fixture {fixture}
```

Use `npm run test-parser -- --fixture {fixture} --write` when `test-parse` is not an available script.

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
2. Render the report with `.agents/domains/plans/templates/report__template.md` next to this instruction as `build-incremental-roundtrip-fixtures__report.md`.
3. Include a compact row or bullet for every fixture: source file, detected constructs, AST oddities, serializer result, and any code/test fix.
4. Include the actual parser script name used (`test-parse` or `test-parser`) and final verification results.
5. Keep the chat response terse: happy face + up to 3 bullets (done `build-incremental-roundtrip-fixtures`, created artefacts, thumbs up).
