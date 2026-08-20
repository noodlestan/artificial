# Sub-Agent REPORT (#producer)

**Plan:** `implement-serializer`

**Instruction Id:** `build-incremental-roundtrip-fixtures`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Area                       | Files                                                                                                                                                                                                 | Summary                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Fixture ladder             | `art-js/libs/parser/test/fixtures/hello-world.md`, `section-block.md`, `field-inline.md`, `field-block.md`, `section-inline-field.md`, `section-block-field.md`, `section-inline-and-block-fields.md` | Added the 7 requested incremental roundtrip fixtures.                                                                                      |
| Parser snapshots           | `art-js/libs/parser/test/fixtures/*.md.json`                                                                                                                                                          | Regenerated snapshots for the new fixtures and refreshed existing snapshots whose construct classification changed after the parser fixes. |
| Inline field parser        | `art-js/libs/constructs/src/constructs/FieldInline/createFieldInlinePreProcessor.ts`                                                                                                                  | Captures inline field values from paragraph text after the bold label instead of reading only the strong node.                             |
| Inline field test          | `art-js/libs/constructs/src/constructs/FieldInline/createFieldInlinePreProcessor.test.ts`                                                                                                             | Added a focused construct test for inline field capture.                                                                                   |
| Block field serializer     | `art-js/libs/constructs/src/constructs/FieldBlock/createFieldBlockToMdast.ts`                                                                                                                         | Emits the `FieldBlock` label as a paragraph only; nested value content is handled as siblings.                                             |
| Block field test           | `art-js/libs/constructs/src/constructs/FieldBlock/createFieldBlockToMdast.test.ts`                                                                                                                    | Updated the construct test to match the label-only serializer shape.                                                                       |
| Markdown serializer        | `art-js/libs/serializer/src/artAstToMdast.ts`                                                                                                                                                         | Flattened `root` fragments and emitted `FieldBlock` value content as sibling markdown nodes.                                               |
| Serializer regression test | `art-js/libs/serializer/src/serializer.test.ts`                                                                                                                                                       | Added a nested section regression test that covers the root-flattening path.                                                               |

### Retrospective Architecture

The fixture work exposed that the parser's original child model was too uniform for Markdown and Art. Natural conversion now preserves the mdast block/phrasing boundary recursively:

- `NaturalBlock` represents block-shaped mdast nodes and recursively converts their descendants.
- `NaturalExpression` represents mdast `PhrasingContent`; it stores the mdast `type`, all mdast attributes except `children`, the optional `value`, and recursively converted children.
- List items and other natural nodes retain their mdast attributes instead of being reduced to anonymous child arrays.

Field capture is owned by `FieldBlock`. It captures following natural block records into `FieldBlock.value` and closes its active context when the next `FieldBlock`, `FieldInline`, or `SectionBlock` is encountered. The generic builder only calls `beforeRecord()` and dispatches the returned context; it does not contain field-specific stopping rules, and `FieldInline` does not close a FieldBlock.

The construct API was reduced to the responsibilities that are used: `preProcess` for immediate claims, `detect/create` for factory-based claims, and `handle` for insertion and context transitions. `canPreProcess` and `shouldVisit` were redundant message hooks and were removed. The remaining API and capture ownership are documented in `$PROJECT/architecture/parser.md`.

The fixture tooling convention is also explicit: numbered fixtures are roundtrip-ready acceptance cases; underscore-prefixed fixtures are parser-only exploratory cases. `test-parser --debug-write` produces `.debug.json`, and `test-serializer --debug-write` produces `.parsed.md`; neither replaces a normal snapshot. Snapshot writes must be scoped with `--fixture {pattern}` and reviewed against the source and debug output.

#### Files changed

- `art-js/libs/parser/test/fixtures/hello-world.md` and `hello-world.md.json` - baseline confirmation; `Document -> SectionBlock`.
- `art-js/libs/parser/test/fixtures/section-block.md` and `section-block.md.json` - `SectionBlock -> SectionBlock` nesting with a `NaturalBlock` gap; serializer initially added an extra blank line, fixed by flattening root fragments in `artAstToMdast`.
- `art-js/libs/parser/test/fixtures/field-inline.md` and `field-inline.md.json` - initially classified as `FieldBlock`; fixed by reading the inline value from the paragraph tail, yielding a leaf `FieldInline`.
- `art-js/libs/parser/test/fixtures/field-block.md` and `field-block.md.json` - source adjusted to include the blank line required for a true block field; parser now captures a `FieldBlock` with block value content.
- `art-js/libs/parser/test/fixtures/section-inline-field.md` and `section-inline-field.md.json` - `FieldInline` remains scoped under the nested `Details` section.
- `art-js/libs/parser/test/fixtures/section-block-field.md` and `section-block-field.md.json` - `FieldBlock` remains scoped under the nested `Details` section and roundtrips losslessly after the serializer fix.
- `art-js/libs/parser/test/fixtures/section-inline-and-block-fields.md` and `section-inline-and-block-fields.md.json` - both field forms coexist under `Details` in source order and roundtrip losslessly.
- `art-js/libs/parser/test/fixtures/_artificial.art.json`, `_configuration.art.json`, `_field-block.md.json`, `_language.art.json`, `_parser.art.json`, `_project-lint.art.json`, `_scalar.art.json`, `_section-block.art.json`, `_semantics.art.json` - refreshed because the parser fix changed field classification in existing snapshots.
- `art-js/libs/constructs/src/constructs/FieldInline/createFieldInlinePreProcessor.ts` - now checks the paragraph tail for inline field content.
- `art-js/libs/constructs/src/constructs/FieldInline/createFieldInlinePreProcessor.test.ts` - validates inline field extraction from paragraph siblings.
- `art-js/libs/constructs/src/constructs/FieldBlock/createFieldBlockToMdast.ts` - now emits only the field label paragraph.
- `art-js/libs/constructs/src/constructs/FieldBlock/createFieldBlockToMdast.test.ts` - updated expected mdast for the label-only shape.
- `art-js/libs/serializer/src/artAstToMdast.ts` - now flattens root wrappers and keeps `FieldBlock` value nodes as siblings.
- `art-js/libs/serializer/src/serializer.test.ts` - added a serializer regression for nested sections and blank-line handling.

#### Fixture observations

| Fixture                              | AST observation                                                                                    | Serializer result                      | Fix / note                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `hello-world.md`                     | `Document -> SectionBlock("Hello World")`                                                          | LOSSLESS ROUNDTRIP                     | Baseline stayed stable.                                                                           |
| `section-block.md`                   | `SectionBlock("Hello World") -> SectionBlock("Details")` with a `NaturalBlock` gap                 | Initially produced an extra blank line | Fixed by flattening `root` fragments in `artAstToMdast`.                                          |
| `field-inline.md`                    | Initially parsed as `FieldBlock`; after fix it is a leaf `FieldInline("Greeting", "Hello world.")` | LOSSLESS ROUNDTRIP                     | Fixed parser preprocessor to read inline value from paragraph siblings.                           |
| `field-block.md`                     | `FieldBlock("Description")` with block value content on the following paragraph                    | LOSSLESS ROUNDTRIP                     | Fixture source needed the blank line that separates the label paragraph from its value paragraph. |
| `section-inline-field.md`            | `FieldInline("Greeting")` nested under `SectionBlock("Details")`                                   | LOSSLESS ROUNDTRIP                     | Verified inline field stays scoped under the child section.                                       |
| `section-block-field.md`             | `FieldBlock("Description")` nested under `SectionBlock("Details")`                                 | LOSSLESS ROUNDTRIP                     | Fixed serializer to keep block value content as sibling markdown nodes.                           |
| `section-inline-and-block-fields.md` | `FieldInline("Greeting")` followed by `FieldBlock("Description")` under the same `Details` section | LOSSLESS ROUNDTRIP                     | Verified both field forms coexist in source order.                                                |

### Verification

- `npm ci` at the workspace root completed successfully.
- `cd art-js/libs/parser && npm run test-parser -- --fixture hello-world --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture hello-world`
- `cd art-js/libs/parser && npm run test-parser -- --fixture section-block --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture section-block`
- `cd art-js/libs/parser && npm run test-parser -- --fixture field-inline --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture field-inline`
- `cd art-js/libs/parser && npm run test-parser -- --fixture field-block --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture field-block`
- `cd art-js/libs/parser && npm run test-parser -- --fixture section-inline-field --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture section-inline-field`
- `cd art-js/libs/parser && npm run test-parser -- --fixture section-block-field --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture section-block-field`
- `cd art-js/libs/parser && npm run test-parser -- --fixture section-inline-and-block-fields --write`
- `cd art-js/libs/parser && npm run test-serializer -- --fixture section-inline-and-block-fields`
- `cd art-js/libs/parser && npm run test-parser`
- `cd art-js/libs/parser && npm run test-serializer`
- `cd art-js/libs/constructs && npm run test`
- `cd art-js/libs/constructs && npm run lint`
- `cd art-js/libs/constructs && npm run build`
- `cd art-js/libs/serializer && npm run test`
- `cd art-js/libs/serializer && npm run lint`
- `cd art-js/libs/serializer && npm run build`
- `cd /opt/noodlestan/_workspaces/project-parser/repos/artificial-parser-planning && npm run ci`
- The first workspace `ci` run hit a sandbox `tsx` IPC `EPERM` in `@art-js/poc-parse`; rerunning with escalated permissions completed successfully.

### Script names

- Parser fixture runner: `test-parser`
- Serializer fixture runner: `test-serializer`

### Final state

- The incremental numbered fixture ladder and focused boundary cases were added and verified.
- Maintained numbered parser snapshots match the inspected construct tree, including recursive natural children and FieldBlock closure before FieldInline.
- The new and maintained numbered serializer roundtrips pass; underscore fixtures remain exploratory and are not serializer acceptance criteria.
- The remaining known WIP is formatted SectionBlock heading fidelity, where formatted heading content is currently stored as plain text and therefore escaped by serialization.
