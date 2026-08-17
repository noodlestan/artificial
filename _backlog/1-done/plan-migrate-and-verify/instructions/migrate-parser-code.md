# Instructions: `migrate-parser-code`

**Plan:** `migrate-and-verify`

**Commit.id:** `migrate-parser-code`

**Commit.message:** `build(md-art-roundtrip): migrate all parser code to packages`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to the requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its Mandatory Reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

- Migrate parser logic into package `@art-js/artificial-parser` under `art-js/libs/parser/`.
- Eliminate `createNestedContext` injection from handler factories (milestone decision).
- Avoid keeping the dead `fieldBlockFactory` export.
- Migrate fixtures required for parser tests into the parser package tests (byte-identical copies).
- Add minimal, representative unit tests for migrated factories/handlers so the parser package test suite passes.

## Mandatory Reading

- ::READ `plan.md` — the plan being executed (do not rely on chat context).
- ::READ `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` — milestone context and decisions.
- ::READ `art-js/cli/poc-parse/_pseudo.md` — parser architecture (source of truth).
- ::READ `art-js/cli/poc-parse/src/parse/` — POC implementation to migrate (read-only).
- ::READ `repos/artificial/_guide.md` — repository guide with setup and verification commands.

### Execution Context

**Workspace:** Running on `$WORKSPACE = CWD` managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

If a git workspace tree was created, it is likely that the workspace CLI is not installed AND that the checkout(s) of the repository or repositories where work is performed do not exist yet.

### Setup

Execute in `$WORKSPACE`, to clone and branch the repo:

```bash
npm install # installs workspace cli
npm run workspace clone artificial # creates checkout at repos/artificial
npm run branch migrate-and-verify artificial # branches it to migrate-and-verify
```

And check `repos/artificial` exists and is on branch `migrate-and-verify`.

Run from the `repos/artificial` repository root:

```bash
npm ci
```

## Verification

Run per-package verification from the repository root (repeat until green):

```bash
npm run lint:fix
npm run build
npm run test
```

## Changes (authoritative; do not deviate)

1. Copy (do not move) parser source files required for the migrated package into `art-js/libs/parser/src/` as appropriate. Preserve original files in `poc-parse` (read-only source).
2. Refactor handler and factory code to remove `createNestedContext` injection points. Keep behaviour identical except for the removal of the injected dependency.
3. Ensure the parser package exposes a stable entrypoint API (e.g., `export function parse(content: string): Document`) in `art-js/libs/parser/src/index.ts` that tests import.
4. Add minimum viable unit tests for representative factories and handlers under `art-js/libs/parser/src/__tests__/` (one test per migrated module sufficient to assert basic behaviour).
5. Wire `art-js/libs/parser/package.json` test script to run the fixture runner if needed and add devDependencies used by the runner.
6. Run `npm install` at the repository root only if package.json changes require lockfile regeneration. Do NOT hand-edit lockfiles.

NOTE: Fixture migration was covered by phase 2 (`plan-migrate-testing-fixtures`). Do NOT copy fixtures as part of this instruction.

## Steps (recommended order)

1. Read `plan.md` and all Mandatory Reading.
2. Verify the existing parser package skeleton at `art-js/libs/parser/` (package.json and `src/index.ts`) and reuse it — do NOT create a new package.json. If package.json requires minor updates (scripts/devDependencies), apply them in a focused commit.
3. Incrementally migrate code pieces (one module / factory at a time) from the POC parse implementation into `art-js/libs/parser/src/`, adding/updating tests alongside each migration.
4. After migrating a component, run verification commands and fix issues until green.
5. Coordinate with `plan-migrate-testing-fixtures` for fixture migration — do NOT copy fixtures here. Once fixtures are available (migrated by phase 2), run the fixture runner (see `verify` instruction) to validate end-to-end behaviour.
6. Finalise by ensuring `npm run test` passes for the parser package and commit all changes with clear messages per logical unit.

## Source → Target mapping (authoritative guidance)

Copy and adapt the following POC parse sources into the parser package. Use the exact logical mapping below — prefer copying modules and preserving filenames, then refactor imports to the new package layout.

- Source: `art-js/cli/poc-parse/src/parse/builder.ts` → Target: `art-js/libs/parser/src/builder.ts`
- Source: `art-js/cli/poc-parse/src/parse/config.ts` → Target: `art-js/libs/parser/src/config.ts`
- Source: `art-js/cli/poc-parse/src/parse/constants.ts` → Target: `art-js/libs/parser/src/constants.ts`
- Source: `art-js/cli/poc-parse/src/parse/types.ts` → Target: `art-js/libs/parser/src/types.ts`
- Source: `art-js/cli/poc-parse/src/parse/parse.ts` (parser entrypoints/CLI helper) → Target: Do NOT copy CLI glue verbatim; instead implement `src/index.ts` that exports `createDefaultConfig()` and `parse(markdown: string)` implemented via `builder.buildDocument(markdown, config)`.
- Source dirs: `art-js/cli/poc-parse/src/parse/constructs/**` → Target: `art-js/libs/parser/src/constructs/**` (copy modules: FieldBlock, NaturalBlock, SectionBlock, Tag, etc.)
- Source dirs: `art-js/cli/poc-parse/src/parse/framework/**` → Target: `art-js/libs/parser/src/framework/**` (copy helper utilities: createDocumentContext, createNestedContext, getFactory, flushGap, rawSlice, etc.)

Notes on adaptation:

- After copying, update import paths within each moved file to reference the new relative locations (e.g., `from './framework/getFactory'` may remain but check directory nesting).
- The POC's `createNestedContext` helper is subject to the milestone decision to eliminate injection — refactor factories to remove reliance on injected createNestedContext where required. Where immediate changes are invasive, leave a clear TODO comment and prefer adding a small adapter that preserves behaviour while making the removal explicit in a later PR.
- Ensure `src/index.ts` exports the public API:
  - `export function parse(markdown: string): Document` — implemented using `createDefaultConfig()` + `buildDocument`.
  - `export { createDefaultConfig }` if present in POC config.

Validation checklist after mapping:

- All TypeScript files compile (run `tsc --noEmit` or `npm run lint` depending on repo rules).
- Unit tests for migrated modules exist and pass locally (run `npm run test` for parser package).
- No runtime imports remain pointing at `cli/poc-parse/**` (search for occurrences before delegating).
- Any TODOs or adapters introduced must be documented in the commit message and in the instruction's Follow ups section.

## Rules

- Only modify files under `art-js/libs/parser/**` for this instruction (source POC remains read-only).
- Do not import runtime code from `art-js/cli/poc-parse/**` — the migrated code must be self-contained.
- Use small, well-scoped commits; each commit must include tests that demonstrate the change.
- If a change affects other packages, isolate it into a separate follow-up plan and document it in the plan's Follow ups section.

## How to Report Back

Render a report file at the instruction's report path: `<instruction-dir>/<instruction-id>__report.md` including:

- Commit SHAs (one per logical commit performed)
- `npm run test` output (truncated to the failing section if failures remain)
- A short summary of what was changed (3 bullets)
- Any remaining blockers and reproduction steps

Then reply in chat with a single line: `done migrate-parser-code {report-file}`

If blocked, create the report with evidence and reply: `blocked migrate-parser-code {report-file}`
