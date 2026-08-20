# Architecture WIP

## Current Notes

- NaturalBlock now delegates child conversion to the mdast phrasing abstraction instead of maintaining separate list, blockquote, and paragraph conversion branches.
- List items are retained as `NaturalBlock(type: "listItem")` records with their mdast attributes and recursively converted descendants.
- `ConstructCreator.shouldVisit` and `ConstructPreProcessor.canPreProcess` were redundant in the current implementation and have been removed.
- `ConstructCreator.detect/create` remains necessary because specialised constructs must compete with the NaturalBlock fallback.
- `ConstructHandler` remains necessary because FieldBlock and SectionBlock change the active capture context.
- `VisitContext.beforeRecord()` is the current construct-owned mechanism for closing FieldBlock capture. The builder invokes it but does not know FieldBlock boundary rules.
- `flushGap()` still creates NaturalBlock records directly. The source contains a WIP note to replace that path with a factory call.
- Serializer round-trip coverage still has a WIP around formatted SectionBlock headings. `SectionBlock.name` currently stores formatted Markdown as plain text, so serialization escapes the formatting.
- The serializer debug flag is currently `--debug-write`; the shorter `--debug` spelling is not implemented.
- Underscore fixtures are exploratory and are intentionally excluded from serializer round-trip coverage.

## Questions to Revisit

- Should `ConstructParser` remain a grouping record, or should the parser configuration expose specialised preprocessors, creators, and handlers directly?
- Should `ConstructHandler.handle()` receive the original mdast node, or should constructs retain any source information needed during record creation?
- Should capture boundaries become an explicit construct callback instead of being encoded through `VisitContext.beforeRecord()`?
- Should gap preservation be delegated to the NaturalBlock factory rather than constructed by `flushGap()`?
- Should serializer debug accept both `--debug` and `--debug-write` while the fixture tooling is still evolving?
