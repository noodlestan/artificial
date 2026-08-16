# Instructions: `art-js: bootstrap primitives and parser libs`

**Plan:** `bootstrap-packages`

**Commit:** `bootstrap-primitives-and-parse-libs`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `bootstrap-primitives-and-parse-libs`, primitives types + parser entry point, CI passes, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Bootstrap `@art-js/artificial-primitives` with the core types migrated from the POC parser, and bootstrap `@art-js/artificial-parser` consuming primitives from its entry point — one commit, two packages.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, setup, verification, working agreements, workflows.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` — POC package guide (migration source); references `_pseudo.md` and architecture; notes the archived backlog.
- `repos/artificial/art-js/cli/poc-parse/_pseudo.md` — parser architecture (source of truth): context-aware visiting, factories, handlers.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — source types to migrate.
- `repos/artificial/art-js/libs/primitives/package.json` — target package (already scaffolded; keep the vite build).
- `repos/artificial/art-js/libs/parser/package.json` — target package (already scaffolded; add the primitives dependency).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Changes

This is a types-only package for now but will later host utils such as assertions.

1. Create the type files in `art-js/libs/primitives/src/` (`point.ts`, `record.ts`, `constructs.ts`, `registry.ts`, `index.ts`).
2. Bootstrap `@art-js/artificial-parser` consuming `@art-js/artificial-primitives` from its entry point: import a simple type, declare a const of that type, `console.info(value)` (allow-listed by the root `no-console` rule — `allow: ['info', 'warn', 'error']`; no disable comment needed); add the primitives dependency to `art-js/libs/parser/package.json`; regenerate the lockfile via `npm install` at the repository root.
3. Verify lint and build pass in both packages.

## Rules

- Only modify: `repos/artificial/art-js/libs/primitives/src/**`, `repos/artificial/art-js/libs/parser/src/**`, `repos/artificial/art-js/libs/parser/package.json`, `repos/artificial/package-lock.json` (regenerated via `npm install`, never hand-edited).
- RULE: Do NOT modify `repos/artificial/art-js/libs/primitives/package.json` — keep the vite build and its devDependencies as-is.
- RULE: Do NOT modify `repos/artificial/art-js/cli/poc-parse/**` — POC Parse is a read-only migration source; it cannot be used to test, cannot be modified, and is superseded by `@art-js/artificial-parser`.
- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_backlog/**`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- RULE: This is a types-only package for now but will later host utils such as assertions.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Create primitives type files
Step 2. Bootstrap parser entry point
Step 3. Verify

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Verification

- After Step 1: `npm run lint` in `art-js/libs/primitives/` passes.
- After Step 2: `npm install` at the repository root exits 0 (lockfile regenerated); `npm run build` in `art-js/libs/parser/` passes.
- After Step 3: full verification below.

## Verification

Run from `repos/artificial/art-js/libs/primitives/` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
```

Run from `repos/artificial/art-js/libs/parser/` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
```

## Steps

### Step 1 of 3 — Create primitives type files

Create the following files in `repos/artificial/art-js/libs/primitives/src/`:

**`point.ts`** — Point and Position types:

```typescript
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
```

**`record.ts`** — Base record and construct interfaces:

```typescript
import type { Position } from './point.js';

/** Base interface implemented by every construct record. */
export interface RecordBase {
  /** Discriminator — the construct class (e.g. 'SectionBlock'). */
  construct: string;
  /** Source position, carried from the token stream. */
  position?: Position;
}
```

**`constructs.ts`** — All construct interfaces:

```typescript
import type { RecordBase } from './record.js';

/** Tag — a projection tag `(#identifier)`. */
export interface Tag extends RecordBase {
  construct: 'Tag';
  /** Kebab-case tag name, without `#` or parentheses. */
  name: string;
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
  /** Heading depth (1–6), tracked for section nesting. */
  depth?: number;
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
  /** Raw markdown content (always present, lossless round-trip). */
  value: string;
  /** Parsed sub-records when the content is structured (e.g. list items). */
  children?: BlockContent[];
  /** mdast node type (e.g. 'paragraph', 'code', 'list', 'table'). */
  type?: string;
  /** Code language (for code blocks). */
  lang?: string | null;
  /** Code metadata (for code blocks). */
  meta?: string | null;
  /** Allow any other mdast attributes to pass through. */
  [key: string]: unknown;
}

/** Document — the parse result for one source file. */
export interface Document extends RecordBase {
  construct: 'Document';
  children: BlockContent[];
}
```

**`registry.ts`** — Open registries and derived types:

```typescript
import type { FieldBlock, NaturalBlock, SectionBlock } from './constructs.js';
import type { Tag } from './constructs.js';

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

**`index.ts`** — Entry point re-exporting everything:

```typescript
export type { Point, Position } from './point.js';
export type { RecordBase } from './record.js';
export type { Tag, SectionBlock, FieldBlock, NaturalBlock, Document } from './constructs.js';
export type {
  BlockConstructMap,
  InlineConstructMap,
  ConstructMap,
  BlockContent,
  InlineContent,
  Construct,
} from './registry.js';
```

### Step 2 of 3 — Bootstrap parser entry point

Update `repos/artificial/art-js/libs/parser/src/index.ts` — replace the `// placeholder` with a primitives consumption smoke:

```typescript
import type { Point } from '@art-js/artificial-primitives';

/** Origin point — smoke value proving the parser→primitives dependency resolves. */
const origin: Point = { line: 1, column: 1, offset: 0 };

console.info(origin);
```

Note: the `console.info` is intended smoke output — keep it. It is allow-listed by the root `no-console` rule (`allow: ['info', 'warn', 'error']`), so no `eslint-disable` comment is needed; do not add one.

Update `repos/artificial/art-js/libs/parser/package.json` — add the primitives dependency (keep everything else, including the vite build):

```json
"dependencies": {
  "@art-js/artificial-primitives": "*"
}
```

Then run `npm install` from `repos/artificial/` (the repository root) to register the workspace link and regenerate `package-lock.json` — confirm exit 0. Do NOT hand-edit the lockfile.

### Step 3 of 3 — Verify

1. Run `npm run lint:fix` in `repos/artificial/art-js/libs/primitives/` to auto-fix formatting.
2. Run `npm run lint` in `repos/artificial/art-js/libs/primitives/` — must exit 0.
3. Run `npm run build` in `repos/artificial/art-js/libs/primitives/` — must exit 0.
4. Run `npm run lint` in `repos/artificial/art-js/libs/parser/` — must exit 0.
5. Run `npm run build` in `repos/artificial/art-js/libs/parser/` — must exit 0.

## Final Verification

**Sanity check**

The primitives package exports all core types. The parser package imports a primitives type from its entry point, declares a const of that type, and `console.info`s it (allow-listed by `no-console`). The `@art-js/artificial-primitives` workspace dependency is wired and the lockfile regenerated. Lint and build pass in both packages. POC Parse is untouched.

**Verification:**

Run from `repos/artificial/art-js/libs/primitives/` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
```

Run from `repos/artificial/art-js/libs/parser/` package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
```

**Commit and report**

- Stage all changes in `art-js/libs/primitives/` and `art-js/libs/parser/`.
- Commit with message: `art-js: bootstrap primitives and parser libs`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/3-now/plan-bootstrap-packages/instructions/bootstrap-primitives-and-parse-libs__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `bootstrap-primitives-and-parse-libs`, primitives types + parser entry point, CI passes, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_backlog/_architect.md`, or `repos/artificial/_backlog/_parking-lot.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
