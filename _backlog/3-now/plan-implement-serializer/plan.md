# Plan: Implement Serializer

**ID:** `implement-serializer`

**Status:** `READY`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Path Variables

| Variable              | Path                               | Purpose                               |
| --------------------- | ---------------------------------- | ------------------------------------- |
| `$WORKSPACE`          | Current working directory.         | explained in `$WORKSPACE/\_guide.md`. |
| `$PROJECT`            | Provided with prompt               | Repository root for all code changes  |
| `$PACKAGE_SERIALIZER` | `$PROJECT/art-js/libs/serializer/` | Package being created (phase 5)       |
| `$PACKAGE_PRIMITIVES` | `$PROJECT/art-js/libs/primitives/` | Dependency of serializer              |
| `$PACKAGE_CONSTRUCTS` | `$PROJECT/art-js/libs/constructs/` | Dependency of serializer              |
| `$PACKAGE_PARSER`     | `$PROJECT/art-js/libs/parser/`     | Fixture suite extended in this plan   |

## Summary

Bootstrap `@art-js/artificial-serializer` (artast → mdast → md) at `$PACKAGE_SERIALIZER` with test coverage, and extend the fixture tests to two directions: `source.md → art.json` (already asserted) and `art.json → parsed.md`, diffing `source.md` against `parsed.md` (diff counted as overhead). Executed within the Artificial repository (`$PROJECT`) as phase 5 of the MD Art Roundtrip milestone. The serializer depends on primitives and constructs; it is responsible for the last part of (lossless) roundtrip.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: pipeline test suite (`$PROJECT/art-js/cli/pipeline-tests/`, `scripts/roundtrip.ts`, `fixtures/roundtrip/`), addressed in phase 6 (`plan-migrate-tests-pipeline`).
- Out of scope: roundtrip gap refinements (whitespace gaps preserved), addressed reactively in phase 8 (`plan-implement-gaps`).

### Project Repositories

- Repository: Artificial — Checked out at `$PROJECT` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Serializer — Canonical `@art-js/artificial-serializer` (public @0.0.1); described by `ops/records/packages/artificial-serializer.art` (record created in this plan); located at `$PACKAGE_SERIALIZER`.
- Package: Artificial Primitives — Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art`; located at `$PACKAGE_PRIMITIVES` (dependency of serializer).
- Package: Artificial Constructs — Canonical `@art-js/artificial-constructs` (public @0.0.1); described by `ops/records/packages/artificial-constructs.art`; located at `$PACKAGE_CONSTRUCTS` (dependency of serializer; factories it owns map back to md).
- Package: Artificial Parser — Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `$PACKAGE_PARSER` (fixture suite extended to two directions in this plan).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/3-now/milestone-md-art-roundtrip/milestone.md` — defines this plan as phase 5; package table (serializer + constructs).
- Briefing: `_backlog/_architect.md` — approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence;

### Guides

- `$PROJECT/_guide.md` — repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.

### Knowledge

- Architecture: `architecture/index.md` — artificial ecosystem overview.
- ADR: `architecture/records/adr/parser.art` — mdast-based substrate research behind the parser (mdast round-trip substrate for the serializer).
- Fixture suite: `$PACKAGE_PARSER/test/fixtures/` — migrated fixture inputs and `.art.json` snapshots (phase 2); the roundtrip direction reuses them.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `$PACKAGE_PARSER/test/fixtures/` — fixture inputs and snapshots used by the two-way tests.

## Execution Context

Execution occurs in `$PROJECT` on branch `main`; working directories are `$PACKAGE_SERIALIZER` and `$PACKAGE_PARSER`.

## Setup

Run from `$PROJECT` repository directory:

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

Serializer package: unit tests for `serialize(document): string`. Parser package: two-way fixture tests pass — forward direction (`md/art → art.json` vs checked in `art.json`) and return direction (`art.json → parsed.md`, diffed against `source.md`).

## Commits

### `bootstrap-serializer-lib` - `PLANNED`

**Commit Message:** `build(md-art-roundtrip): bootstrap serializer lib`

**Instructions File:** `_backlog/3-now/plan-implement-serializer/instructions/bootstrap-serializer-lib.md`

**Scope:**

- Scaffold `@art-js/artificial-serializer` at `$PACKAGE_SERIALIZER` (vite build, tsconfig, package.json; license, dotfiles; mirrors `$PACKAGE_PRIMITIVES` scaffold).
- Implement `serialize(document): string` — artast → mdast → md — based on the lossless roundtrip contract; depends on primitives and constructs.
- Add unit test coverage for the serializer.
- Register package record `$PROJECT/ops/records/packages/artificial-serializer.art`.
- Verify: `npm run lint`, `npm run build`, `npm run test` in serializer package.

### `two-way-fixture-tests` - `PLANNED`

**Commit Message:** `build(md-art-roundtrip): extend fixture tests to roundtrip both directions`

**Instructions File:** `_backlog/3-now/plan-implement-serializer/instructions/two-way-fixture-tests.md`

**Scope:**

- Extend the parser fixture suite (phase 2 runner) to test both directions: `source.md → art.json` (forward, vs POC snapshots) and `art.json → parsed.md` (return, via the serializer).
- Diff `source.md` against `parsed.md`; report the diff as overhead.
- When `--write` is provided, also write `{fixture}.parsed.md` for debugging.
- Verify: `npm run test` passes in parser package with the two-way suite.

## Follow ups

None.

## Feedback

No sub-agent reports yet.
