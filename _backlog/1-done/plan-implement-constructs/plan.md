# Plan: Implement Constructs

**ID:** `implement-constructs`

**Status:** `DONE`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Move the construct factories (blocks, fields, sections, and the `NaturalBlock`/text fallthrough) out of `@art-js/artificial-parser` into a new `@art-js/artificial-constructs` package: constructs depends on primitives, is a dependency of the parser, and will be a dependency of the serializer. Executed within the Artificial repository (`repos/artificial-art-js-build`) as phase 4 of the MD Art Roundtrip milestone, after the parser is verified against the POC snapshots (phase 3). The parser keeps its orchestration (context-aware visiting, handlers wiring, `buildDocument`); the factories it owns migrate.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: serializer package (constructs becomes its dependency), addressed by the serializer bootstrap in phase 5 (`plan-implement-serializer`).
- Out of scope: pipeline tests and roundtrip gap refinements, addressed in phase 6 (`plan-migrate-tests-pipeline`) and phase 8 (`plan-implement-gaps`; whitespace gaps preserved).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial-art-js-build` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Constructs – Canonical `@art-js/artificial-constructs` (public @0.0.1); described by `ops/records/packages/artificial-constructs.art` (record created in this plan); located at `art-js/libs/constructs/`.
- Package: Artificial Primitives – Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art`; located at `art-js/libs/primitives/` (dependency of constructs).
- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/` (factories migrate out; gains a constructs dependency).
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/3-now/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 4; package table (constructs added); Decisions section (preserve whitespace gaps; JSON-affecting logic frozen until after phase 3).
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence; POC split design (primitives / parser / serializer boundaries).
- Parking Lot: `_backlog/_parking-lot.md` – pending items relevant to constructs.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback.

### Guides

- `repos/artificial-art-js-build/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial-art-js-build/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Pseudo: `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth): context-aware visiting, factories, handlers; the factory/handler partition this plan uses to split constructs out.
- Architecture: `architecture/index.md` – artificial ecosystem overview.
- ADR: `architecture/records/adr/parser.art` – mdast-based substrate research behind the parser.
- Parser state: `art-js/libs/parser/src/` – migrated parser code (phase 3); the factories to extract and the call sites to rewire.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth): factories and handlers partition.
- `art-js/libs/parser/src/` – migrated parser code: factories to extract, call sites to rewire.

## Execution Context

Execution occurs in `$WORKSPACE/artificial-art-js-build` on branch `main`; working directories are `$PROJECT/art-js/libs/constructs` and `$PROJECT/art-js/libs/parser`.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

The parser fixture suite (md/art → art.json vs POC snapshots) must still pass unchanged after the extraction.

## Commits

### `implement-constructs-package` - `COMMITTED`

**Commit Message:** `build(md-art-roundtrip): implement constructs package with migrated factories`

**Commit Id:** `cd51c4014aec70d85478644b1716c46c7fd663dd`

**Instructions File:** `_backlog/1-done/plan-implement-constructs/instructions/implement-constructs-package.md`

**Report:** `_backlog/1-done/plan-implement-constructs/instructions/implement-constructs-package__report.md`

**Scope:**

- Scaffold `@art-js/artificial-constructs` at `art-js/libs/constructs/` (vite build, tsconfig, package.json; mirror `libs/primitives` layout)
- Move construct factories (blocks, fields, sections, and the `NaturalBlock`/text fallthrough) from `art-js/libs/parser/src/` to `art-js/libs/constructs/src/`
- Add `@art-js/artificial-primitives` as a dependency of constructs; add `@art-js/artificial-constructs` as a dependency of the parser
- Rewire parser call sites to import factories from constructs; the parser keeps orchestration (context-aware visiting, handlers wiring, `buildDocument`)
- Register package record `ops/records/packages/artificial-constructs.art`
- Verify: `npm run lint`, `npm run build`, `npm run test` in constructs and parser; parser fixture suite unchanged
- Do not modify poc-parse (migration source; read-only)

**CHANGELOG:**

- Add `@art-js/artificial-constructs` with the migrated construct factories.
- Rewire `@art-js/artificial-parser` to consume constructs while retaining parser orchestration.
- Register the constructs package record and preserve parser snapshot output.

## Follow ups

None.

## Feedback

- implement-constructs-package: `COMMITTED` — report: `_backlog/1-done/plan-implement-constructs/instructions/implement-constructs-package__report.md`

Planner reflection:

- Constructs package scaffolded and all four construct factories migrated with the private directory pattern.
- Parser rewired to use `ConstructParserFactory` config shape; fixture snapshots verified unchanged.
- Follow-ups noted in the report where applicable.
