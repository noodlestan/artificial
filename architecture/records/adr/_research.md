# Research: Parse Substrate Best-Practices

**Status:** Done (2026-08-08)

**Purpose:** Record the ecosystem research behind the parse POC (`cli/poc-parse`): the surveyed projects on the micromark stack, the best practices extracted from them, and the open spike questions they frame.

**Scope:** Parser substrate only — how projects parse custom markdown dialects / structured documents on top of micromark. Template, transform, and render best-practices are out of scope here.

## Surveyed projects

### Core stack

| GitHub | What it is | Why it matters to the parse POC |
| --- | --- | --- |
| micromark/micromark | CommonMark (optionally GFM/MDX) parser: a state machine emitting tokens with position info, no AST | The chosen substrate; its "Extending markdown" guide and the "Case: variables" walkthrough are the canonical extension tutorial |
| syntax-tree/mdast-util-from-markdown | Turns micromark token events into an AST via `enter`/`exit` handlers + an explicit token stack | The construct-stack record-builder pattern, verbatim |
| syntax-tree/mdast-util-to-markdown | Serialises an AST back to markdown | Needed later for render / round-trip |
| remarkjs/remark | Full parse → transform → compile pipeline on micromark | Shows how parse composes; deliberately skipped for the POC (no unist-util-visit, no remark packages) |

### Close analogues — custom dialects on micromark

| GitHub | Why it matters |
| --- | --- |
| mdx-js/mdx | Flagship "your own markdown": a dialect composed of micromark syntax extensions + mdast-util extensions |
| wooorm/xdm | MDX's slim predecessor: a self-contained package wrapping micromark + mdx extensions — a model for a self-contained CLI POC |
| facebook/lexical | `@lexical/mdast`: micromark/mdast in a WYSIWYG editor; granular one-construct-each extensions; split import/export |

### Extension patterns — how a custom construct hooks in

| GitHub | Why it matters |
| --- | --- |
| micromark/micromark-extension-directive (+ remarkjs/remark-directive) | Generic directives (container/leaf/text) — the closest "add a generic construct" pattern |
| micromark/micromark-extension-frontmatter | Structured metadata block at the top of a document — relevant to module-level metadata |
| micromark/micromark-extension-gfm | The reference full extension suite: syntax + html + mdast-util + to-markdown — the 4-part anatomy to copy |
| micromark/micromark-extension-math | A smaller full 4-part extension |
| wataru-chocola/micromark-extension-definition-list | Community (non-official) extension — the pattern for "our own construct" |

### Structured-knowledge-base analogue

| GitHub | Why it matters |
| --- | --- |
| dendronhq/dendron | Structured superset of markdown (hierarchies, tags, metadata, wikilinks) on unified/remark via remark plugins — the closest "markdown as structured source of truth" project. Maintenance-only now: borrow patterns, not architecture |

## Best-practices synthesis

1. **Two layers, always.** micromark owns syntax (tokens); a `from-markdown`-style stage owns semantics (records/tree). Keep them separate.
2. **Explicit stack + enter/exit hooks per token type** is the established way to build a tree/records from token events — matches the planned construct-stack spike.
3. **Extension anatomy.** A publishable extension ships 4 parts (syntax, HTML/rendering, from-markdown, to-markdown); an internal one ships only what it needs. For the POC: syntax (if any) + from-markdown only.
4. **Open registries + derived unions.** mdast per-position registries (`RootContentMap`, `BlockContentMap`, `PhrasingContentMap`) augmented by declaration merging, unions derived by `keyof`. Contrast: `@types/estree` closed unions forced node redefinition (typescript-eslint issue #413).
5. **Positions are sacred.** Tokens carry start/end positions; carry them into records; derive depth/parent from the tree, never store it.
6. **Early spike insight.** `# Kind: Name` is a plain CommonMark ATX heading — micromark already tokenises it. SectionBlock/FieldBlock/NaturalBlock containment is therefore a semantic-stage (from-markdown) concern, not a custom micromark construct. The genuine custom-syntax candidates are the closed-syntax elements (e.g. Tag).

## Open spike questions

- micromark direct vs indirections (e.g. the `mdast-util-from-markdown` layer) — to be decided by the spike itself.
- Which constructs need a custom micromark syntax extension vs semantic-stage handling (initial hypothesis: none for the composing trio; Tag is the candidate).
