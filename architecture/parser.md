# Parser Architecture

The parser converts Markdown into an Art document. Markdown is first parsed into mdast. The Art parser then walks that mdast tree, lets configured constructs claim nodes, and accumulates construct records in context-owned arrays.

## Entry Point

The public entry point is `art-js/libs/parser/src/index.ts`:

```ts
parse(markdown?: string): ArtDocument
```

`parse()` creates the default parser configuration and delegates to `buildDocument(config, markdown)`. The builder owns traversal and accumulation. Constructs own recognition and record creation.

## Configuration

`ParserConfig` contains:

- `defaultConstruct`: the fallback parser, currently `createNaturalBlockParser`.
- `constructs`: an injectable ordered list of specialised construct parsers.

The default order is FieldInline, FieldBlock, SectionBlock, and Tag. Order matters for preprocessors and factory detection: the first construct that returns a record or claims a node wins.

## Builder

`art-js/libs/parser/src/builder.ts` performs these operations:

1. Parse Markdown into mdast with `fromMarkdown`.
2. Create the root `Document` context.
3. Instantiate the configured parser factories.
4. Visit mdast nodes.
5. Give each node to preprocessors in configuration order.
6. If no preprocessor creates a record, ask specialised factories whether they detect the node.
7. If no specialised factory claims it, create a `NaturalBlock` for recognised block nodes.
8. Dispatch each record and return the document context target as `Document.children`.

The builder carries two pieces of traversal state:

- `currentContext`: the array and capture scope currently receiving records.
- `lastEnd`: the end position of the most recently dispatched record. It is used to preserve whitespace and other gaps as `NaturalBlock(type: "text")` records.

Before dispatching a record, the builder:

1. Calls `currentContext.beforeRecord(record)`.
2. Flushes the source gap before the record into the context.
3. Calls the construct handler, if one exists.
4. Otherwise calls `currentContext.push(record)`.
5. Updates `lastEnd` and the active context's `lastEnd`.

`push()` mutates the context's target array. `beforeRecord()` may return a different context. This is how a construct closes a nested capture without the builder knowing construct-specific boundary rules.

## Construct APIs

The current API is deliberately small:

### ConstructCreator

```ts
interface ConstructCreator {
  detect(node: MdastNode, context: VisitContext): boolean;
  create(node: MdastNode, context: VisitContext): Construct | Construct[];
}
```

`detect` decides whether a specialised construct owns an mdast node. `create` creates one or more records. The builder does not interpret the record's fields.

### ConstructPreProcessor

```ts
interface ConstructPreProcessor {
  preProcess(node: MdastNode, context: VisitContext): Construct | null;
}
```

The preprocessor combines matching and creation. It returns `null` when the node is not its construct. There is no separate predicate hook.

### ConstructHandler

```ts
interface ConstructHandler {
  handle(record: Construct, node: MdastNode, context: VisitContext): VisitContext;
}
```

Handlers mutate or accumulate construct state and may return a nested context. The builder passes the original mdast node because section handling needs heading depth, while other handlers can ignore it.

### ConstructParser

```ts
interface ConstructParser {
  preProcessor?: ConstructPreProcessor;
  handler?: ConstructHandler;
  factory?: ConstructCreator;
}
```

This is a configuration record grouping the hooks belonging to one construct. The hooks are optional because a construct may only need preprocessing, only need factory detection, or need a handler alongside either form.

`shouldVisit` was removed. Every claimed node is skipped after dispatch. Nested Art records that need to be created are created explicitly by the construct, not by allowing the generic mdast visitor to visit arbitrary descendants.

## FieldBlock Example

Input:

```md
**Description:**

Block description.

**Status:** Ready.
```

### Detection

`createFieldBlockPreProcessor()` receives every visited node through `preProcess(node, context)`.

It returns `null` unless:

1. The node is a paragraph.
2. Its first child is a strong node matching the field-label grammar.
3. The label has no value after the colon.

For `**Description:**`, it creates a `FieldBlock` record with an empty `value` array.

### Dispatch and Accumulation

The builder receives the record and executes:

```text
currentContext.beforeRecord(FieldBlock)
flushGap(..., currentContext)
FieldBlockHandler.handle(FieldBlock, paragraph, currentContext)
```

The handler:

1. Pushes the `FieldBlock` into the current section or document target array.
2. Creates a nested `FieldBlock` context whose target is `field.value`.
3. Installs a boundary callback on that context.
4. Returns the nested context to the builder.

The field's value records are therefore accumulated directly in `FieldBlock.value`, not in a temporary builder list.

### Capturing Children

While the FieldBlock context is active, the blank gap is pushed as a `NaturalBlock(type: "text")`. The paragraph is created by the default `NaturalBlock` creator. Its children are recursively converted:

- paragraph children are `NaturalExpression` records;
- block children are `NaturalBlock` records;
- list items retain `type: "listItem"` and their mdast attributes;
- descendants continue recursively.

### Closing the FieldBlock

The FieldBlock boundary callback runs from `VisitContext.beforeRecord(record)`. It checks the incoming record's `construct` against:

```ts
FieldBlock | FieldInline | SectionBlock;
```

When one of those records arrives:

1. The callback copies the nested context's `lastEnd` to its parent.
2. It returns the parent context.
3. The builder then dispatches the boundary record into that parent.

The builder does not know that the record closes a FieldBlock. The FieldBlock handler owns the capture boundary and the context transition. The accumulated field content remains in `field.value`; the sibling boundary record is pushed into the parent target.

## Ownership Summary

| Concern                  | Owner                                  | Persisted or accumulated in      |
| ------------------------ | -------------------------------------- | -------------------------------- |
| mdast traversal          | Builder                                | Local traversal state            |
| Construct selection      | Preprocessor or creator                | Returned construct record        |
| Record creation          | Construct                              | Returned record fields           |
| Record insertion         | `VisitContext.push`                    | Context target array             |
| Capture transition       | Construct handler or boundary callback | Returned `VisitContext`          |
| Whitespace preservation  | Builder and `flushGap`                 | `NaturalBlock` in current target |
| FieldBlock child capture | FieldBlock handler                     | `FieldBlock.value`               |
| Natural nested children  | NaturalBlock creator                   | `NaturalBlock.children`          |
