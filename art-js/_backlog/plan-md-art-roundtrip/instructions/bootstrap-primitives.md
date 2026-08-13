# Implementation Instructions

**Plan:** `md-art-roundtrip`

**commit.Id:** `bootstrap-primitives`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `bootstrap-primitives`, types migrated, CI passes, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Bootstrap `@art-js/artificials-primitives` package with core types migrated from the POC parser. This is a types-only package with no runtime dependencies.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — source types to migrate.
- `repos/artificial/art-js/libs/primitives/package.json` — target package (already scaffolded).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Create type files

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
export type {
  Tag,
  SectionBlock,
  FieldBlock,
  NaturalBlock,
  Document,
} from './constructs.js';
export type {
  BlockConstructMap,
  InlineConstructMap,
  ConstructMap,
  BlockContent,
  InlineContent,
  Construct,
} from './registry.js';
```

### Step 2 — Update package.json

Update `repos/artificial/art-js/libs/primitives/package.json`:

1. Remove the Solid.js dev dependencies (not needed for types-only package):
   ```json
   "devDependencies": {}
   ```

2. Update scripts to use simple tsc:
   ```json
   "scripts": {
     "build": "tsc --emitDeclarationOnly",
     "build:clean": "rm -rf dist",
     "lint": "prettier . -c && eslint . && tsc --noEmit",
     "lint:fix": "prettier . -c --write && eslint . --fix",
     "ci": "npm run lint && npm run build && npm run test",
     "test": "echo none yet"
   }
   ```

### Step 3 — Update poc-parse to use primitives

Update `repos/artificial/art-js/cli/poc-parse/package.json`:

1. Add dependency:
   ```json
   "dependencies": {
     "@art-js/artificials-primitives": "*",
     "mdast-util-from-markdown": "^2.0.0",
     "unist-util-visit": "^5.0.0"
   }
   ```

### Step 4 — Verify

1. Run `npm run lint:fix` in `repos/artificial/art-js/libs/primitives/` to auto-fix formatting.
2. Run `npm run lint` in `repos/artificial/art-js/libs/primitives/` — must exit 0.
3. Run `npm run build` in `repos/artificial/art-js/libs/primitives/` — must exit 0.
4. Run `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 (types still work).

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/libs/primitives/src/**`, `repos/artificial/art-js/libs/primitives/package.json`, `repos/artificial/art-js/cli/poc-parse/package.json`.
- RULE: This is a types-only package. No runtime code, no dependencies.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The primitives package exports all core types. poc-parse can import from it. Lint and build pass.

**Verification steps**

1. Execute `npm run lint:fix` in `repos/artificial/art-js/libs/primitives/` to auto-fix formatting.
2. Execute `npm run lint` in `repos/artificial/art-js/libs/primitives/` — must exit 0 with no errors.
3. Execute `npm run build` in `repos/artificial/art-js/libs/primitives/` — must exit 0.
4. Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0.

**Commit and report**

- Stage all changes in `art-js/libs/primitives/` and `art-js/cli/poc-parse/package.json`.
- Commit with message: `art-js: bootstrap primitives package with core types`.
- Use `git commit --no-verify`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/art-js/_backlog/plan-md-art-roundtrip/instructions/bootstrap-primitives__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `bootstrap-primitives`, types migrated, CI passes, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
