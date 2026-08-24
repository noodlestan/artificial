# Instructions: `build(md-art-roundtrip): implement constructs package with parser factory bundling`

**Plan:** `implement-constructs`

**Commit.id:** `implement-constructs-package`

**Commit.message:** `build(md-art-roundtrip): implement constructs package with parser factory bundling`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `implement-constructs-package`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Create `@art-js/artificial-constructs` and migrate the parser-owned construct factories into it while preserving parser orchestration and the existing fixture snapshots. Each construct bundles its preprocessor, handler, and creator into a single `ConstructParserFactory`. The constructs package depends on primitives; the parser depends on constructs.

## Mandatory Reading

- `art-js/cli/poc-parse/_pseudo.md` — parser architecture and the factory/handler partition.
- `art-js/libs/parser/src/` — migrated parser source, factories to extract, and call sites to rewire.
- `repos/artificial-art-js-build/_guide.md` — repository setup and package verification commands.
- `architecture/index.md` — Artificial ecosystem architecture.
- `architecture/records/adr/parser.art` — parser substrate decisions.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from `repos/artificial-art-js-build` repository directory:

```bash
npm ci # to install dependencies.
```

If setup fails, resolve the issue before proceeding. Do not modify `art-js/cli/poc-parse/`; it is the migration source and is read-only for this instruction.

## Changes

Tests are implemented first for every changed API or package boundary. Keep the parser's context-aware visiting, handlers, and `buildDocument` orchestration unchanged except for imports and dependency wiring.

1. Scaffold `art-js/libs/constructs/` as `@art-js/artificial-constructs`, mirroring the primitives package layout and build configuration.
2. Move the construct factories for blocks, fields, sections, and the `NaturalBlock`/text fallthrough from `art-js/libs/parser/src/` into the constructs package. Preserve public exports and behavior.
3. Add `@art-js/artificial-primitives` as a constructs dependency and `@art-js/artificial-constructs` as a parser dependency. Update workspace/package records as required, including `ops/records/packages/artificial-constructs.art`.
4. Rewire parser imports and exports to consume factories from constructs. Remove the migrated factory implementations from parser without moving handlers or parser orchestration.
5. Update focused tests and package exports/configuration so constructs and parser build independently and the parser fixture snapshots remain unchanged.

## Rules

- RULE: Tests first — update or add tests before changing each package boundary.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: Do not modify `art-js/cli/poc-parse/`.
- RULE: Preserve pure-whitespace `NaturalBlock` gaps; do not introduce filtering or normalization.
- RULE: Do not alter parser behavior or fixture snapshots to make verification pass.

## Workflow

Perform the steps autonomously in order, running the prescribed verification after each step. Do not return to a previous step.

## Step Verification

After each step, run the relevant package checks from the modified package directory:

```bash
npm run lint
npm run build
npm run test
```

## Verification

Run from each modified package directory (`art-js/libs/constructs` and `art-js/libs/parser`):

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

The parser fixture suite (md/art → art.json compared with POC snapshots) must still pass unchanged after the extraction.

## Steps

### Step 1 / 5 — Inspect boundaries and establish tests

Read the mandatory sources and inspect the primitives and parser package layouts. Identify every factory export, parser import, test, package manifest, and workspace record affected by the extraction. Add or update focused tests for the constructs package boundary before implementation. Verify the parser fixture baseline before changing behavior.

### Step 2 / 5 — Scaffold the constructs package — completed in pairing session

#### Package metadata

- Package name: `@art-js/artificial-constructs`.
- Public entry point: `art-js/libs/constructs/src/index.ts`.
- Runtime dependency: `@art-js/artificial-primitives` only.
- Package remains publishable and uses the existing repository metadata.

#### Package configuration

- Added `art-js/libs/constructs/.npmignore`.
- Added `art-js/libs/constructs/.prettierignore`.
- Added `art-js/libs/constructs/README.md`.
- Added `art-js/libs/constructs/vitest.config.ts`.
- Updated `tsconfig.json` to include the package `scripts/` directory.
- Retained the primitives-aligned Vite, TypeScript, lint, build, and test setup.

#### Source layout established for the next step

- `src/constructs/` owns construct factories and construct-specific helpers.
- `src/framework/` owns shared factory contracts, MDAST typing, source slicing, and position utilities.
- `src/index.ts` owns the constructs package public exports.

### Step 3 / 5 — Migrate factories — completed in pairing session

#### Constructs package: `art-js/libs/constructs/src/constructs/`

- `src/constructs/FieldBlock/` — field constants, strong-field detection, paragraph construction, and `createFieldBlockCreator`.
- `src/constructs/NaturalBlock/` — natural-block construction and `createNaturalBlockCreator`, preserving raw whitespace gaps and source positions.
- `src/constructs/SectionBlock/` — section matching, heading tag extraction, and `createSectionBlockCreator`.
- `src/constructs/Tag/` — tag matching and `createTagCreator`.

#### Constructs package: `art-js/libs/constructs/src/helpers/`

- `cleanPosition.ts` — normalises MDAST positions for construct records.
- `rawSlice.ts` — reads source text for factories that need exact Markdown content.
- `index.ts` — exports the shared helper API.

#### Constructs package: `art-js/libs/constructs/src/constructs/types.ts`

- `ConstructCreator` — factory contract (detect + create + shouldVisit).
- `ConstructPreProcessor` — pre-processing contract (canPreProcess + preProcess).
- `ConstructHandler` — handler contract (canHandle + handle).
- `ConstructParser` — bundle of optional preProcessor + handler + creator.
- `ConstructParserFactory` — function `() => ConstructParser`.

#### Parser factory bundling

Each construct exposes a single `create*Parser` factory (e.g. `createFieldBlockParser`) that returns a `ConstructParser` object bundling:
- `preProcessor` — optional construct-specific preprocessor.
- `handler` — optional construct-specific handler.
- `factory` — the construct creator (detect + create).

Example:
```ts
export const createFieldBlockParser: ConstructParserFactory = () => ({
  preProcessor: createFieldBlockPreProcessor(),
  handler: createFieldBlockHandler(),
  factory: createFieldBlockCreator(),
});
```

#### Private directory pattern

Each construct directory uses a `private/` subdirectory for internal files:
- `private/` — creators, handlers, preprocessors, constants, helpers, concrete types.
- Root — only `index.ts` (exports parser factory) and `create*Parser.ts` (parser factory).

#### Public API

- `src/index.ts` exports the four parser factories:
  - `createFieldBlockParser`
  - `createNaturalBlockParser`
  - `createSectionBlockParser`
  - `createTagParser`
- Also exports: `ConstructCreator`, `ConstructHandler`, `ConstructParser`, `ConstructParserFactory`, `ConstructPreProcessor`, `BlockContent`, `Construct`, `ArtDocument`, `cleanPosition`, `rawSlice`.

#### Parser package boundary: `art-js/libs/parser/src/`

- Removed migrated factory implementations from `src/constructs/`.
- Moved parser-specific handlers to `src/handlers/`.
- Kept visitor traversal, context creation, gap flushing, and `buildDocument` in parser.
- Factories produce construct records; handlers route records into nested `VisitContext` objects.
- Preserved factory names, types, constructors, and parser-facing behavior.
- `Tag` detection remains limited to visited MDAST text nodes; fenced code blocks are not treated as prose.

### Step 4 / 5 — Rewire parser and records — completed in pairing session

#### Parser config shape

```ts
interface ParserConfig {
  defaultConstruct: ConstructParserFactory;
  constructs: ConstructParserFactory[];
}
```

The parser instantiates constructs at build time:
```ts
const defaultConstruct = config.defaultConstruct();
const constructs = [defaultConstruct, ...config.constructs.map(create => create())];
```

#### Parser changes

- `src/config/types.ts` — `ParserConfig` uses `ConstructParserFactory`.
- `src/config/createDefaultConfig.ts` — wires `createNaturalBlockParser` as default, others as `constructs`.
- `src/private/getFactory.ts` — iterates constructs, delegates to `construct.factory.detect`.
- `src/builder.ts` — orchestrates preprocessors, handlers, and factories from construct bundles.
- `src/private/flushGap.ts` — uses `BlockContent` for gap blocks.
- Removed obsolete handler/framework/factory source from parser.

### Step 5 / 5 — Validate the package boundary — in progress

#### Completed checks

- Constructs lint/build checks pass.
- Parser lint/build checks pass after import rewiring.
- Migrated factory implementations were removed from parser.

#### Fixture update

- Regenerated `art-js/libs/parser/test/fixtures/markdown.md.json`.
- Removed the obsolete `Tag` record from `Tags in Code (should NOT be detected)`.
- Prose tags remain expected parser output.

#### Remaining checks

- Rerun constructs and parser test commands.
- Confirm `constructs → primitives` and `parser → constructs` dependency direction.
- Confirm no parser factory imports or duplicate factory implementations remain.

## Final Verification

**Sanity check:** `@art-js/artificial-constructs` builds and tests independently; each construct exports only its parser factory; internal files live in `private/` subdirectories; parser orchestration uses the new `ConstructParserFactory` config shape; the POC package is unchanged; and parser fixture snapshots still pass without updates.

**Verification:**

Run from each modified package directory:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with `.agents/domains/plans/templates/report__template.md` to render the report and write it next to this instruction file: `_backlog/3-now/plan-implement-constructs/instructions/implement-constructs-package__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `implement-constructs-package`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
