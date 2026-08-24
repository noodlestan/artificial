# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Instruction Id:** `construct-stack-record-builder`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File                                            | Change  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `art-js/cli/poc-parse/src/parse/builder.ts`     | created | `buildDocument(markdown): Document` — construct-stack record builder. Runs `preprocess() → parse().document().write() → postprocess(doc.events)`, maintains an explicit section + field stack, hooks `atxHeading`/`atxHeadingText`/`strong`/`paragraph`/`codeFenced`/`codeIndented`/`codeText`/`link`/`autolink`/`data`/`lineEnding` enter/exit events, extracts `kind`/`name`/tags from headings, detects `**Field:**` spans, classifies everything else as `NaturalBlock`, and attaches `Tag`s to the nearest open `SectionBlock`. |
| `art-js/cli/poc-parse/src/parse/parse.ts`       | created | Exports `parse(markdown): Document` delegating to `buildDocument`; CLI entry point (`npx tsx src/parse/parse.ts <file.art>`) prints the record tree as JSON when run directly.                                                                                                                                                                                                                                                                                                                                                       |
| `art-js/cli/poc-parse/src/parse/smoke-parse.ts` | deleted | Token-inspection spike superseded by the builder; findings live in `_backlog/plan-poc-parse/instructions/smoke-parse-section-block__findings.md`.                                                                                                                                                                                                                                                                                                                                                                                    |

Commit `7d23a6e` — `poc-parse: add construct-stack record builder` (rebase of `9ba1657` onto `origin/main` after remote advanced; pushed with `--no-verify`).

### Verification

- `npx tsc --noEmit` in `art-js/cli/poc-parse/` — exit 0, no errors.
- `npx tsx src/parse/parse.ts repos/artificial/architecture/records/adr/language.art` — exit 0, prints a JSON record tree; top-level and nested `SectionBlock`s carry `kind`, `name`, `children` (e.g. `kind: "Module", name: "Language"` → nested `kind: "Decision"` children with `FieldBlock`/`NaturalBlock` descendants).
- `npx prettier --check src/parse/builder.ts src/parse/parse.ts` — clean (files match the repo `.prettierrc`).
- `npx eslint src/parse/builder.ts src/parse/parse.ts` — one finding: `import/no-extraneous-dependencies` for `micromark` (not declared in `package.json` deps). True positive; deps are deliberately deferred per the plan and `package.json` is out of scope, so left unresolved (see Feedback).
- `npm run lint` / `npm run lint:fix` — NOT executed (Rules section explicitly forbids them; see Feedback, contradiction F5).
- `git status` after work: new `src/parse/builder.ts`, new `src/parse/parse.ts`, deleted `src/parse/smoke-parse.ts`. The working tree additionally shows the delegator's `plan.md` edit and the untracked instruction file, both left untouched.
- Corpus regression vs smoke findings: `_research.md` 8 sections/3 fields, `compiler.art` 10/33, `configuration.art` 2/5, `distribution.art` 5/15, `documentation.art` 3/7, `installation.art` 2/4, `language.art` 9/29, `section-block.art` 2/7 — all match the smoke-parse heading/strong counts; both corpus tags (`generator`, `wip`) surfaced.

## Blockers (if any)

None.

## Feedback

### For the planner

Directive feedback — every ambiguity/omission/contradiction encountered, with the simplest reading implemented.

- `where`: Instruction Step 1, "On `strong` exit: pops the `FieldBlock` if one was pushed".
- `problem`: Popping the field at strong exit leaves its value empty. For `**Status:** Adopted`, the "Adopted" data arrives after the strong exits, so it would be orphaned as a section `NaturalBlock` instead of becoming the field value. This contradicts the type docstring (`FieldBlock.value` = "everything until the next terminator") and ADR `language.art` "Construct Containment" (a FieldBlock value terminates at the next FieldBlock/SectionBlock/end of enclosing SectionBlock).
- `decision`: the field stays open after its strong exits and is popped only at a terminator — the next field's strong enter, the next heading enter, or EOF. Value accumulates across data events and paragraphs (one `NaturalBlock` per paragraph). The whole-bold-span case (`**Decision: Two Main Use Cases**`) appends the span remainder after the `Name:` to the value on strong exit.
- READY-TO-APPLY:

```md
### `construct-stack-record-builder` - changes applied in 7d23a6e

Step 1 "On strong exit" reads: pops the FieldBlock **and appends its value span remainder**; the field stays open until the next terminator (next FieldBlock, next SectionBlock, or end of the enclosing SectionBlock), per ADR language.art "Construct Containment".
```

- `where`: Instruction Step 1, "On `atxHeading` exit: pops the `SectionBlock` from the stack and attaches it as a child of the parent" vs the design note "use [heading level] for nesting SectionBlocks (level > parent level = child)".
- `problem`: micromark emits headings as flat sibling events (verified empirically), so popping a section at its own heading exit empties the stack and a level-2 heading can never resolve its level-1 parent. The two instructions are mutually inconsistent.
- `decision`: sections stay open until a heading of level <= enters (or EOF); nesting is driven purely by level (`closeSections(level)` on heading enter). The section is pushed at `atxHeadingText` enter (kind/name need the heading text), and attached to its parent at pop time.
- READY-TO-APPLY:

```md
Step 1 "atxHeading" hooks: a SectionBlock is pushed at `atxHeadingText` enter; it is popped and attached to its parent when a heading of level <= enters, or at EOF — not at `atxHeading` exit (headings are flat events; level drives nesting).
```

- `where`: Instruction Step 2, "reads a file path from `process.argv[1]`".
- `problem`: under `npx tsx src/parse/parse.ts <file>` argv is `[node, script, file]` — verified empirically with `tsx v4.23.12` (`argv[1]` is the script path, the file lands on `argv[2]`).
- `decision`: the CLI reads `process.argv[2]`.
- READY-TO-APPLY:

```md
Step 2 CLI reads the file path from `process.argv[2]` (argv[1] is the script under tsx).
```

- `where`: Instruction Step 2 + Final Verification — CLI arg is a workspace-relative path (`repos/artificial/...`) but the command runs with cwd `art-js/cli/poc-parse`.
- `problem`: `readFileSync` resolves relative to cwd; `repos/artificial/...` does not exist under `poc-parse`, so the stated verification command would fail without extra handling (omission).
- `decision`: `resolveInputPath` tries the path as-is (cwd-relative), then resolves against the workspace root (7 levels up from `src/parse`, matching the deleted `smoke-parse.ts` `REPO_ROOT` convention).
- READY-TO-APPLY:

```md
Step 2/Verification: the CLI resolves the file arg against cwd first, then against the workspace root (as smoke-parse.ts did), so workspace-relative paths work from any cwd.
```

### For the technical writers

- `where`: Rules section "Do NOT run `npm run lint` or `npm run lint:fix` — prettier/eslint are not installed (dev deps deliberately deferred)" vs Final Verification "Execute `npm run lint:fix` … Execute `npm run lint`".
- `problem`: direct contradiction in the same instruction, and the premise is stale — prettier and eslint ARE installed (binaries in `node_modules/.bin`, plus repo-root `.prettierrc`/`.eslintrc.cjs`).
- `decision`: followed the explicit Rules prohibition; ran read-only `prettier --check` (clean) and `npx eslint` on the new files (single finding below). The deferral note should be lifted.
- READY-TO-APPLY:

```md
Rules: lint deps are installed; replace "Do NOT run npm run lint / lint:fix" with the Final Verification steps as written.
```

- `where`: Instruction Step 1, "Tags `(#identifier)` are detected via regex in text content".
- `problem`: the only two tags in the corpus (`section-block.art` line 69) live inside a fenced code _example_, so a raw-text regex attaches `generator`/`wip` to the nearest open section (`Construct`) even though they are example content. The smoke findings counted those same two tags with the identical raw regex, so the behaviour matches the documented finding.
- `decision`: followed the instruction literally (regex over accumulated text at flush time, heading text at section creation). Flagged so the planner can decide whether fenced spans should be excluded from tag detection.
- READY-TO-APPLY:

````md
Step 1 Tags: consider excluding fenced code spans from tag detection — the corpus' only tags are inside a ```md example block and currently surface on the enclosing section.
````

- Minor: heading names keep raw inline markup (e.g. ``name: "Any Markdown is Valid `.art`"``) since `atxHeadingText` is sliced verbatim. Acceptable for the POC; a later step can strip inline formatting from names.

### For the crew

- The builder reconstructs complete bold spans, code spans, links, autolinks and fenced blocks from token offsets (tokens are fully positioned after `postprocess`), so "raw markdown" `NaturalBlock`s stay lossless — inline code was initially dropped until `codeText`/`link`/`autolink`/`codeIndented` were added to the span-capture set.
- `micromark` reports `import/no-extraneous-dependencies` until the package's dependencies are declared (deferred per plan); do not treat it as a regression.
- Pushed with `git push` after a `--autostash` rebase onto a remote commit (`aea2484`, workspace-cli) that landed mid-session; the delegator's `plan.md` edit and the untracked instruction file were preserved untouched.
