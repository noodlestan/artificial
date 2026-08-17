# Plan: Implement Serializer

**ID:** `implement-serializer`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Bootstrap `@art-js/artificial-serializer` (artast → mdast → md) at `art-js/libs/serializer/` with test coverage, and extend the fixture tests to two directions: `source.md → art.json` (already asserted) and `art.json → parsed.md`, diffing `source.md` against `parsed.md` (diff counted as overhead). Executed within the Artificial repository (`repos/artificial`) as phase 5 of the MD Art Roundtrip milestone. The serializer depends on primitives and constructs; it is required for the lossless roundtrip (finding from the archived POC briefing).

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: pipeline test suite (`art-js/cli/pipeline-tests/`, `scripts/roundtrip.ts`, `fixtures/roundtrip/`), addressed in phase 6 (`plan-migrate-tests-pipeline`).
- Out of scope: roundtrip gap refinements (whitespace gaps preserved), addressed reactively in phase 8 (`plan-implement-gaps`).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Serializer – Canonical `@art-js/artificial-serializer` (public @0.0.1); described by `ops/records/packages/artificial-serializer.art` (record created in this plan); located at `art-js/libs/serializer/`.
- Package: Artificial Primitives – Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art`; located at `art-js/libs/primitives/` (dependency of serializer).
- Package: Artificial Constructs – Canonical `@art-js/artificial-constructs` (public @0.0.1); described by `ops/records/packages/artificial-constructs.art`; located at `art-js/libs/constructs/` (dependency of serializer; factories it owns map back to md).
- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/` (fixture suite extended to two directions in this plan).
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/3-now/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 5; package table (serializer + constructs); Decisions (two-way fixture diffing: `source.md → art.json` and `art.json → parsed.md`, diffing `source.md` vs `parsed.md`, counted as overhead); roundtrip fixture strategy (`ops/records/packages/art-mantras.art` stored as fixture in `@art-js/artificial-spec`).
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence; POC split design (the serializer is the missing module).
- Parking Lot: `_backlog/_parking-lot.md` – pending items relevant to serialization.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Pseudo: `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth); the artast shape the serializer must invert.
- Architecture: `architecture/index.md` – artificial ecosystem overview.
- ADR: `architecture/records/adr/parser.art` – mdast-based substrate research behind the parser (mdast round-trip substrate for the serializer).
- Fixture suite: `art-js/libs/parser/test/fixtures/` – migrated fixture inputs and `.art.json` snapshots (phase 2); the roundtrip direction reuses them.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/poc-parse/_pseudo.md` – artast shape to invert.
- `art-js/libs/parser/test/fixtures/` – fixture inputs and snapshots used by the two-way tests.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directories are `$PROJECT/art-js/libs/serializer` and `$PROJECT/art-js/libs/parser`.

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

Serializer package: unit tests for `serialize(document): string`. Parser package: two-way fixture tests pass — forward direction (`md/art → art.json` vs POC snapshots) and return direction (`art.json → parsed.md`, diffed against `source.md`; diff counted as overhead).

## Commits

### `bootstrap-serializer-lib` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): bootstrap serializer lib`

**Instructions File:** `_backlog/4-next/plan-implement-serializer/instructions/bootstrap-serializer-lib.md`

**Scope:**

- Scaffold `@art-js/artificial-serializer` at `art-js/libs/serializer/` (vite build, tsconfig, package.json; mirror `libs/primitives` layout)
- Implement `serialize(document): string` — artast → mdast → md — based on the lossless roundtrip contract; depends on primitives and constructs
- Add unit test coverage for the serializer
- Register package record `ops/records/packages/artificial-serializer.art`
- Verify: `npm run lint`, `npm run build`, `npm run test` in serializer package
- Do not modify poc-parse (migration source; read-only)

### `two-way-fixture-tests` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): extend fixture tests to roundtrip both directions`

**Instructions File:** `_backlog/4-next/plan-implement-serializer/instructions/two-way-fixture-tests.md`

**Scope:**

- Extend the parser fixture suite (phase 2 runner) to test both directions: `source.md → art.json` (forward, vs POC snapshots) and `art.json → parsed.md` (return, via the serializer)
- Diff `source.md` against `parsed.md`; report the diff as overhead
- Add the roundtrip fixture (`ops/records/packages/art-mantras.art`) to `@art-js/artificial-spec` per the milestone fixture strategy
- Verify: `npm run test` passes in parser package with the two-way suite
- Do not modify poc-parse (migration source; read-only)

## Follow ups

None.

## Feedback

No sub-agent reports yet.
