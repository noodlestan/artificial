# Smoke Parse Findings

**Plan:** poc-parse
**Instruction:** smoke-parse-section-block
**Date:** 2026-08-10

## Summary of Tokenization

### ATX Headings (`# Kind: Name` pattern)

Headings tokenize as expected — micromark's ATX heading tokenizer handles `# Kind: Name` and `## Section` as plain CommonMark headings. The heading level is captured in the token stream. This confirms the early spike insight from `_research.md`: the composing trio (SectionBlock, FieldBlock, NaturalBlock) is a semantic-stage concern, not a custom micromark construct.

- Total headings across corpus: 41
- Token type: `atxHeading`
- The token includes the heading sequence (hash characters) and heading content.
- Sub-tokens: `atxHeadingSequence` (the `#` chars), `atxHeadingText` (the text after `#`)

### Strong Emphasis (`**Field:**`)

Bold text tokenizes correctly. Strong emphasis is captured as a `strong` token type with `strongSequence` for the `**` delimiters.

- Total strong tokens across corpus: 114
- Token type: `strong`, `strongSequence`
- Block fields like `**Purpose:**`, `**Status:**` tokenize as strong emphasis wrapping text content.

### Directive Text (`::READ`)

Directives like `::READ ... FROM ...` tokenize as regular inline text — the `::` is not a special token type. They appear as `data` tokens within paragraph content.

- Total directive lines across corpus: 3
- Token type: `data` (no dedicated directive token type)
- micromark treats `::READ` as ordinary markdown text, not as a special construct
- This means directive handling is a semantic-stage concern (custom from-markdown logic needed)

### Tags (`(#identifier)`)

Tag patterns like `(#generator)` tokenize as inline text — no dedicated tag token type. They appear as `data` tokens within the token stream.

- Total tag occurrences across corpus: 2
- Token type: `data` (no dedicated tag token type)
- This is a candidate for a custom micromark syntax extension (as identified in `_research.md`)

### Code Fences

Code fences (```) tokenize correctly as `codeFenced`tokens. The fence info (language) is captured in`codeFencedSequence`.

- Total code fences across corpus: 5
- Token type: `codeFenced`, `codeFencedSequence`, `codeFencedText`
- Both opening and closing fences are captured with position info.

## Per-File Summary

| File                                                        | Headings | Strong  | Directives | Tags  | Code Fences |
| ----------------------------------------------------------- | -------- | ------- | ---------- | ----- | ----------- |
| architecture/records/adr/\_research.md                      | 8        | 9       | 0          | 0     | 0           |
| architecture/records/adr/compiler.art                       | 10       | 33      | 0          | 0     | 0           |
| architecture/records/adr/configuration.art                  | 2        | 5       | 0          | 0     | 0           |
| architecture/records/adr/distribution.art                   | 5        | 20      | 0          | 0     | 0           |
| architecture/records/adr/documentation.art                  | 3        | 7       | 0          | 0     | 0           |
| architecture/records/adr/installation.art                   | 2        | 4       | 0          | 0     | 0           |
| architecture/records/adr/language.art                       | 9        | 29      | 0          | 0     | 0           |
| art-js/spec/grammar/constructs/structural/section-block.art | 2        | 7       | 3          | 2     | 5           |
| **Total**                                                   | **41**   | **114** | **3**      | **2** | **5**       |

## Surprises and Gaps

1. **No dedicated directive token** — `::READ` and similar directives are parsed as plain text. The construct-stack builder will need semantic-stage logic to detect and classify directive patterns.

2. **No dedicated tag token** — `(#identifier)` tags are plain inline text. A custom micromark syntax extension would be needed to tokenize them as first-class constructs. For now, the semantic stage can detect them via regex.

3. **Strong emphasis splits across tokens** — `**Field:**` may split into multiple tokens depending on surrounding content (e.g. whitespace, punctuation). The from-markdown layer needs to reconstruct the complete bold span.

4. **ATX headings carry level info** — heading levels (1-6) are available in the token stream, which is essential for nesting SectionBlocks.

5. **Code fences work out of the box** — no special handling needed; micromark's code fence tokenizer handles CommonMark fences correctly.

## Recommendation: Micromark Direct vs Indirections

**Recommendation: Use micromark directly with our own thin from-markdown layer (no `mdast-util-from-markdown` indirection).**

This preserves the two-layer architecture from `_research.md` best practice #1: micromark owns syntax (tokens), our construct-stack builder owns semantics (records). "Micromark direct" means we skip mdast-util-from-markdown's record mapping, not that we skip the semantic layer entirely.

Rationale:

1. **Custom constructs are minimal.** The art syntax has only two custom-syntax candidates: tags (`(#identifier)`) and directives (`::READ`). Everything else (headings, bold, code fences) is standard CommonMark. A thin from-markdown layer handling enter/exit hooks for these few token types is simpler than adopting mdast-util-from-markdown's full record mapping.

2. **Record schema is art-specific.** Our records (`SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`) don't map to mdast nodes. Using mdast-util-from-markdown would mean mapping mdast nodes to art records — an extra layer that adds complexity without value.

3. **Extension pattern is straightforward.** Enter/exit hooks per token type + an explicit construct stack (per `_research.md` best practice #2) is the established pattern and directly produces our record types.

4. **Tag extension is the only custom syntax.** If tags need first-class tokenization, a small micromark extension (10-20 lines) handles it. The rest is semantic-stage detection.

The decision is consistent with the `_architect.md` approach: "micromark substrate... with our own thin extension (enter/exit hooks per token type) and an explicit construct stack. The parser emits art's own AST records, not mdast."
