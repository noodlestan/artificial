# Serializer Architecture

The serializer converts an Art document back into Markdown. It is intentionally simpler than the parser: it walks construct records, asks each registered construct how to produce mdast, and passes the resulting mdast root to `mdast-util-to-markdown`.

## Entry Point

The public entry point is `art-js/libs/serializer/src/serializer.ts`:

```ts
serialize(document: ArtDocument): string
```

`serialize()` creates the default serializer configuration, converts the Art document to mdast with `artAstToMdast`, and renders the mdast root as Markdown.

## Configuration

The default serializer configuration registers one `ConstructToMdast` implementation per serializable construct:

- Document
- NaturalBlock
- NaturalExpression
- FieldBlock
- FieldInline
- SectionBlock
- Tag

The registry is injectable through `SerializerConfig` when a caller needs additional or replacement construct serializers.

## Art-to-mdast Walk

`artAstToMdast()` recursively visits construct records.

For each record it:

1. Reads child records from `children`, or from array-valued `value` for FieldBlock and related nested-value constructs.
2. Recursively converts those records to mdast children.
3. Looks up the record's `construct` in the serializer registry.
4. Calls `toMdast(record, children)`.
5. Returns the resulting mdast node or root children.

Construct serializers decide how child mdast nodes are nested. NaturalExpression uses its mdast `type`, attributes, value, and converted children. NaturalBlock uses its canonical raw `value` and reparses it when reconstructing natural Markdown content. Field and section serializers create their labels or headings and place their captured children in the appropriate Markdown structure.

## Markdown Rendering

The final mdast root is rendered by `mdast-util-to-markdown`. The current serializer configuration preserves the fixture conventions by using `-` for unordered list bullets and `_` for emphasis.
