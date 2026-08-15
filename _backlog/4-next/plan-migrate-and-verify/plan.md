# Plan: Migrate and Verify

**ID:** `migrate-and-verify`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Migrate all parser code to `@art-js/artificials-parser`, verify the lossless MD Art roundtrip (parse `.art` → serialize back → zero diffs), and add unit tests for factories and handlers, executed within the Artificial repository (`repos/artificial`) as phase 2 of the MD Art Roundtrip milestone.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificials Primitives – Canonical `@art-js/artificials-primitives` (public @0.0.1); described by `ops/records/packages/artificials-primitives.art`; located at `art-js/libs/primitives/`.
- Package: Artificials Parser – Canonical `@art-js/artificials-parser` (public @0.0.1); described by `ops/records/packages/artificials-parser.art`; located at `art-js/libs/parser/`.
- Package: Artificials Serializer – Canonical `@art-js/artificials-serializer`; required for the roundtrip (milestone finding), NOT yet scaffolded; to be bootstrapped at `art-js/libs/serializer/`.
- Package: Artificials Spec – Canonical `@art-js/artificials-spec`; located at `art-js/spec/` (grammar specs; hosts the roundtrip fixture per milestone finding).
- Package: Artificials POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificials-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 2; package table (incl. serializer "required for the roundtrip, not yet scaffolded"); roundtrip fixture strategy (`ops/records/packages/art-mantras.art` stored as fixture in `@art-js/artificials-spec`); open questions (gap `NaturalBlock`s, dead `fieldBlockFactory`, `createNestedContext` injection).
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items relevant to migration and verification.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback; source code at `art-js/cli/poc-parse/src/parse/`.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Pseudo: `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth): context-aware visiting, factories, handlers.
- Architecture: `architecture/index.md` – artificials ecosystem overview.
- ADR: `architecture/records/adr/parser.art` – mdast-based substrate research behind the parser.
- ADR: `architecture/records/adr/language.art` – language and parser containment model decisions.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth).
- `art-js/cli/poc-parse/src/parse/` – current POC implementation to migrate.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directories are `$PROJECT/art-js/libs/parser` and `$PROJECT/art-js/libs/serializer`.

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

## Commits

### `migrate-parser-code` - `DRAFT`

**Commit Message:** `art-js: migrate all parser code to packages`

**Instructions File:** `_backlog/4-next/plan-migrate-and-verify/instructions/migrate-parser-code.md`

**Scope:**

- Move all parser logic to `@art-js/artificials-parser`
- Move fixtures to parser package test directory
- Create unit tests for each factory and handler
- Verify: `npm run test` passes in parser package
- Do not modify poc-parse (migration source; read-only) — `@art-js/artificials-parser` takes over as the parser; poc-parse stays untouched until archived in phase 3

### `bootstrap-serializer` - `DRAFT`

**Commit Message:** `art-js: bootstrap serializer package for md roundtrip`

**Instructions File:** `_backlog/4-next/plan-migrate-and-verify/instructions/bootstrap-serializer.md`

**Scope:**

- Scaffold `@art-js/artificials-serializer` at `art-js/libs/serializer/` (milestone finding: required for the roundtrip, not yet scaffolded)
- Implement `serialize(document): string` — artast → mdast → md — based on the lossless roundtrip contract
- Register package record `ops/records/packages/artificials-serializer.art`
- Verify: `npm run lint`, `npm run build`, `npm run test` in serializer package

### `roundtrip-verification` - `DRAFT`

**Commit Message:** `art-js: verify MD Art roundtrip`

**Instructions File:** `_backlog/4-next/plan-migrate-and-verify/instructions/roundtrip-verification.md`

**Scope:**

- Parse `ops/records/packages/art-mantras.art` → artast
- Serialize artast → markdown
- Assert zero diffs
- Store the file contents as fixture in `@art-js/artificials-spec` (milestone fixture strategy); parser package imports the fixture from there
- Add roundtrip test to parser package
- Verify: `npm run test` passes

## Follow ups

- Phase 3 (`archive-and-publish`) of the MD Art Roundtrip milestone.
- Milestone open questions to resolve during migration: pure-whitespace gap `NaturalBlock`s (filter consistently or preserve), dead `fieldBlockFactory` export (keep or remove), remove `createNestedContext` injection from handler factories.

## Feedback

No sub-agent reports yet.
