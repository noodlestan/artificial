# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Instruction Id:** `smoke-parse-section-block`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File | Description |
|------|-------------|
| `art-js/cli/poc-parse/src/parse/smoke-parse.ts` | Smoke-parse script: reads 8 target files, tokenizes through micromark, counts/inspects token types (headings, strong, directives, tags, code fences), writes findings |
| `_backlog/plan-poc-parse/instructions/smoke-parse-section-block__findings.md` | Findings report: tokenization summary, per-file counts, surprises/gaps, recommendation (micromark direct vs indirections) |

### Verification

- `npx tsc --noEmit` — clean, no errors
- `npx tsx src/parse/smoke-parse.ts` — runs successfully, produces output
- `git status` — exactly 2 new files staged and committed

### Commit

- **Hash:** `147ab64`
- **Message:** `poc-parse: smoke-parse the corpus through micromark`

## Feedback

### For the planner

- **F1 (Ambiguity):** The instruction says to use `import { parse } from 'micromark'` and describes the parse function returning "an event array". In reality, `parse()` returns a `ParseContext` object. Token events require the full pipeline: `preprocess() → parse().document().write() → doc.events → postprocess()`. The instruction should clarify this or reference `mdast-util-from-markdown`'s usage pattern as the canonical example.
  - **Ready-to-apply snippet for `smoke-parse.md`:** Change step 2 from "Parses each file through micromark's `parse` function (from `micromark` package)" to "Parses each file through micromark's tokenize pipeline: `preprocess() → parse().document().write() → postprocess(doc.events)` (imports from `micromark`: `parse`, `preprocess`, `postprocess`)"

- **F2 (Ambiguity):** The instruction mentions "The parse function returns an event array: `[token, type, enterExit][]`" — this is not the actual shape. Events are `[enterExit, token, context]` tuples after `postprocess()`, where `token` has `type` (string), `start`, `end` properties.
  - **Ready-to-apply snippet for `smoke-parse.md`:** Change "Collects and logs the token event stream for each file" to "Collects and logs the postprocessed token event stream: each event is `[enterExit, token, context]` where `token.type` is a string like `'atxHeading'`, `'strong'`, `'codeFenced'`, and `token.start/end` carry `{line, column, offset}`"

- **F3 (Omission):** The instruction does not mention installing `micromark` as a dependency. It was already available as a transitive dependency in the monorepo, but the instruction should note this for environments where it isn't.
  - **Ready-to-apply snippet for `smoke-parse.md`:** Add to Implementation notes: "micromark is available as a transitive dependency in the monorepo root. No additional install needed."

### For the technical writers

- **F4 (Contradiction):** `_research.md` best practice #1 says "Two layers, always — micromark owns syntax (tokens); a from-markdown-style stage owns semantics (records)". The findings recommend "micromark directly (no mdast-util-from-markdown indirection)" which seems to contradict this. In practice, the recommendation means we build our OWN from-markdown-style stage (construct-stack builder) rather than using mdast-util-from-markdown's — the two-layer principle is preserved, just with our own semantic layer. This should be clarified in the findings to avoid confusion.
  - **Ready-to-apply in findings:** The recommendation section should clarify "micromark direct" means "micromark + our own thin from-markdown layer" (two-layer architecture preserved), not "skip the semantic layer entirely".

### For the crew

- The `preprocess() → parse().document().write() → postprocess()` pipeline is not documented in micromark's main README. The canonical reference is `mdast-util-from-markdown`'s `fromMarkdown` function (line 79 of its `lib/index.js`). Worth bookmarking for future micromark work.
