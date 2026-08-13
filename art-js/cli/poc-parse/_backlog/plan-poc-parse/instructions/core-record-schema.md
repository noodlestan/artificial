# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `core-record-schema`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `core-record-schema`, created `src/parse/types.ts`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Author the core record schema for the artificials parser POC — the parser's output contract — as composable TS types in `art-js/cli/poc-parse/src/parse/types.ts`, per POC Step 2 and the substrate research best practices: a discriminated union on `construct`, open per-position registries with derived unions (the mdast `RootContentMap` pattern), position metadata on every record, and depth/parent derived from the tree rather than stored. Types only — no parsing logic, no micromark, no runtime code.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `artificials/_backlog/plan-poc-parse/plan.md` — the plan; this commit is `core-record-schema`.
- `artificials/_guide.md` — the Artificials System overview: the compiler pipeline, the declaration model (`# Kind: Name`), and the kind-agnostic parser. Context only.
- `artificials/_architect.md` — Approach (schema-first in TS) + Step 2 (core record schema).
- `artificials/_wip.md` — only to identify the current step; NEVER modify it.
- `artificials/architecture/records/adr/_research.md` — best practices 1–6; esp. #4 (open registries + derived unions) and #5 (positions sacred, depth/parent derived).
- `artificials/art-js/spec/grammar/structures/construct.art` — the grammar construct meta-model (context).
- `artificials/art-js/spec/grammar/constructs/structural/section-block.art` — SectionBlock schema: `kind?`, `name`, `tags?`, `content`.
- `artificials/art-js/spec/grammar/constructs/structural/field-block.art` — FieldBlock schema: `name`, `value`; and the value containment rules.
- `artificials/art-js/spec/grammar/constructs/structural/natural-block.art` — NaturalBlock, the catch-all classification.
- `artificials/art-js/spec/grammar/constructs/expressions/tag.art` — Tag form `(#<identifier>)`, category Expressions.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Create `src/parse/types.ts` (relative to `art-js/cli/poc-parse/`) declaring the core record schema. The file exports types only — interfaces and type aliases, no runtime code.

The schema below is the prescribed shape. Transcribe it into the file with JSDoc comments per construct; do not redesign it. It expresses the parser's output contract per `_plan.md` Step 2 (`kind`, `name`, recursive `children`, extensible via declaration merging) and `_research.md` best practices:

```ts
/** A point in the source. */
export interface Point {
  line: number;
  column: number;
  offset: number;
}

/** The source span of a record. */
export interface Position {
  start: Point;
  end: Point;
}

/** Base interface implemented by every construct record. */
export interface RecordBase {
  /** Discriminator — the construct class (e.g. 'SectionBlock'). */
  construct: string;
  /** Source position, carried from the token stream. */
  position?: Position;
}

/** SectionBlock — a resource declaration `# Kind: Name` plus its content. */
export interface SectionBlock extends RecordBase {
  construct: 'SectionBlock';
  /** Declared resource kind (e.g. 'Routine'); absent for kindless headings. */
  kind?: string;
  /** Declared resource name (e.g. 'List Tasks'). */
  name: string;
  /** Projection tags attached to the heading. */
  tags?: Tag[];
  /** Ordered block-level content, including FieldBlock records in source order. */
  children: BlockContent[];
}

/** FieldBlock — a named property `**Name:**` within a SectionBlock. */
export interface FieldBlock extends RecordBase {
  construct: 'FieldBlock';
  name: string;
  /** Block-level value: everything until the next terminator. */
  value: BlockContent[];
}

/** NaturalBlock — the catch-all: plain markdown not classified as art. */
export interface NaturalBlock extends RecordBase {
  construct: 'NaturalBlock';
  /** Raw markdown content. */
  value: string;
}

/** Tag — a projection tag `(#identifier)`. */
export interface Tag extends RecordBase {
  construct: 'Tag';
  /** Kebab-case tag name, without `#` or parentheses. */
  name: string;
}

/** Document — the parse result for one source file. */
export interface Document extends RecordBase {
  construct: 'Document';
  children: BlockContent[];
}

/** Open registry of block-level constructs. Augment via declaration merging when new constructs land. */
export interface BlockConstructMap {
  SectionBlock: SectionBlock;
  FieldBlock: FieldBlock;
  NaturalBlock: NaturalBlock;
}

/** Open registry of inline/expression-level constructs. */
export interface InlineConstructMap {
  Tag: Tag;
}

/** Open registry of all constructs. */
export interface ConstructMap extends BlockConstructMap, InlineConstructMap {}

export type BlockContent = BlockConstructMap[keyof BlockConstructMap];
export type InlineContent = InlineConstructMap[keyof InlineConstructMap];
export type Construct = ConstructMap[keyof ConstructMap];
```

**Prescribed design decisions (implement as specified, do not second-guess):**

- The discriminated-union discriminator is `construct` (per `_wip.md`); the declared resource kind is `kind` (per `_plan.md` Step 2 and the `section-block.art` Schema). The stale `type?` vs `kind` question in the grammar spec is a POC Step 6 reconciliation, not this commit.
- A SectionBlock's named fields are FieldBlock records inside `children`, in source order — there is no separate `fields` slot. Per `field-block.art`: a FieldBlock is "a named property within a SectionBlock", and a SectionBlock's content is an ordered sequence of blocks.
- `FieldBlock.value` is `BlockContent[]`, not a single NaturalBlock — per `field-block.art` Rules: a value MAY contain procedure blocks, example blocks, directives, and raw markdown content.
- `NaturalBlock.value` is raw markdown (`string`). The POC does not classify plain markdown further (no mdast, per `_plan.md` Approach); NaturalBlock is the catch-all per `natural-block.art`.
- `Tag` lives in the inline registry (expression-level construct per `tag.art` Category: Expressions). Tags are only declared on `SectionBlock.tags` in this commit — FieldBlock/ExampleBlock tag support is a Step 6 reconciliation.
- `Document` is the top-level parse result for one source file; it is a container, not a grammar construct, so it is NOT registered in any construct map.
- No `depth` or `parent` fields anywhere — they are derived from the tree, never stored (per `_plan.md` Step 2 and `_research.md` #5).
- `position` is optional on records (tree-crafted records may lack it); `Point` fields are required (token positions always carry line/column/offset).

## Rules

- NEVER modify `artificials/_guide.md`, `artificials/_architect.md`, `artificials/_wip.md`, `artificials/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `artificials/records/**` file.
- Only create: `art-js/cli/poc-parse/src/parse/types.ts`. Do NOT touch `src/index.ts`, `package.json`, tsconfigs, or any other existing file.
- Do NOT run `npm run lint` or `npm run lint:fix` — prettier/eslint are not installed (dev deps deliberately deferred; the deferral lifts when the package's lint/CI is first exercised, POC step 4+). Type-check with `tsc --noEmit` directly (see Final Verification).
- If the plan or a reference is ambiguous or contradicts the repo conventions: resolve it with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The artificials POC step 2 goal is met: the parser's output contract exists as composable TS types at `src/parse/types.ts`, expressing `SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`, and `Document` — discriminated on `construct`, with open per-position registries and derived unions, position metadata on every record, and no stored depth/parent.

**Verification steps**

- Execute `npx tsc --noEmit` in `art-js/cli/poc-parse/` — resolves the repo root's typescript and `@types/node` (upward node_modules walk); must exit 0 with no errors. If `npx` attempts to download typescript, run the repo-root binary directly: `../../../../node_modules/.bin/tsc --noEmit`.
- Re-read `src/parse/types.ts` and confirm it matches the prescribed shape exactly: `construct` discriminator, `kind`/`name` on SectionBlock, recursive `children`/`value`, the three open registries with derived unions (`BlockContent`, `InlineContent`, `Construct`), `position?` on every record, and NO `depth`/`parent` fields.
- Confirm `git status` shows exactly one new file: `art-js/cli/poc-parse/src/parse/types.ts`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `artificials/_backlog/plan-poc-parse/instructions/core-record-schema__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `core-record-schema`, created `src/parse/types.ts`, thumbs up). The full trail lives in the report file; never repeat it in chat.
7. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `core-record-schema`, created `src/parse/types.ts`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `artificials/_architect.md`, or `artificials/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
