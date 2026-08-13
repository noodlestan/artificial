# Plan: MD Art Roundtrip

**ID:** `md-art-roundtrip`

**Status:** `PLANNED`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Migrate the poc-parse parser into proper packages, establish CI, verify roundtrip (parse `art-mantras.art` → serialize back with zero diffs), archive poc-parse, and publish first version.

## Source Tasks

- `_backlog/_architect.md` — MD Art Roundtrip milestone
- `_backlog/plan-poc-parse/plan.md` — POC learnings and current state
- `ops/records/packages/art-mantras.art` — roundtrip target fixture

## Mandatory Reading

For the delegator (execution mechanics):

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `.agents/skills/execute-plan/SKILL.md` — how this plan is executed by delegation.

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/_backlog/_architect.md` — approach and milestones.
- `art-js/cli/poc-parse/_pseudo.md` — parser architecture (source of truth).
- `art-js/cli/poc-parse/src/parse/` — current POC implementation to migrate.

## Packages

### Package Map

| Package | Path | Purpose | Dependencies |
|---------|------|---------|--------------|
| `@art-js/artificials-primitives` | `art-js/libs/primitives/` | Core types: `Point`, `Position`, `RecordBase`, construct interfaces, `ConstructMap` | None |
| `@art-js/artificials-parser` | `art-js/libs/parser/` | Parser: `buildDocument`, factories, handlers, context | `@art-js/artificials-primitives` |
| `@art-js/artificials-spec` | `art-js/spec/` | Grammar specs (`.art` files) — already exists | `@art-js/artificials-primitives` |
| `@art-js/poc-parse` | `art-js/cli/poc-parse/` | CLI entry point — will be archived after migration | `@art-js/artificials-parser` |

### Package Responsibilities

**`@art-js/artificials-primitives`** (types only)
- `Point`, `Position`, `RecordBase`
- `SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`, `Document`
- `BlockConstructMap`, `InlineConstructMap`, `ConstructMap`
- `BlockContent`, `InlineContent`, `Construct` (derived unions)
- NO runtime code, NO dependencies

**`@art-js/artificials-parser`** (parser + builder + context)
- `VisitContext` interface + `createNestedContext`
- `ConstructFactory` interface + factories (`sectionBlockFactory`, `fieldBlockFactory`, `tagFactory`, `naturalBlockFactory`)
- `ConstructHandler` interface + handlers (`sectionBlockHandler`, `fieldBlockHandler`, `tagRoutingHandler`)
- `ConstructPreProcessor` interface + pre-processors (`fieldDetectionPreProcessor`)
- `buildDocument(markdown, config)` + `createDefaultConfig()`
- `ParserConfig` interface
- Dependencies: `mdast-util-from-markdown`, `unist-util-visit`, `@art-js/artificials-primitives`

**`@art-js/poc-parse`** (CLI entry point — temporary)
- CLI that uses `@art-js/artificials-parser`
- Will be archived after migration is complete
- Keep for development iteration

## Commits

### Phase 1 — Bootstrap packages

#### `bootstrap-primitives` - `PLANNED`

**Commit Message:** `art-js: bootstrap primitives package with core types`

**Instructions File:** `_backlog/plan-md-art-roundtrip/instructions/bootstrap-primitives.md`

**Scope:**
- Migrate types from `poc-parse/src/parse/types.ts` to `art-js/libs/primitives/src/`
- Create entry point `src/index.ts` re-exporting all types
- Verify: `npm run lint`, `npm run build`, `npm run test` (placeholder)
- Add `@art-js/artificials-primitives` as dependency to poc-parse

#### `bootstrap-parser` - `PLANNED`

**Commit Message:** `art-js: bootstrap parser package with migrated parser`

**Instructions File:** `_backlog/plan-md-art-roundtrip/instructions/bootstrap-parser.md`

**Scope:**
- Migrate `factory.ts`, `builder.ts` from `poc-parse/src/parse/` to `art-js/libs/parser/src/`
- Update imports to use `@art-js/artificials-primitives`
- Create entry point `src/index.ts` re-exporting public API
- Verify: `npm run lint`, `npm run build`, `npm run test` (placeholder)
- Update poc-parse to import from `@art-js/artificials-parser`

### Phase 2 — Migrate and verify

#### `migrate-parser-code` - `PLANNED`

**Commit Message:** `art-js: migrate all parser code to packages`

**Instructions File:** `_backlog/plan-md-art-roundtrip/instructions/migrate-parser-code.md`

**Scope:**
- Move all parser logic to `@art-js/artificials-parser`
- Move fixtures to parser package test directory
- Create unit tests for each factory and handler
- Verify: `npm run test` passes in parser package
- poc-parse becomes thin CLI wrapper

#### `roundtrip-verification` - `PLANNED`

**Commit Message:** `art-js: verify MD Art roundtrip`

**Instructions File:** `_backlog/plan-md-art-roundtrip/instructions/roundtrip-verification.md`

**Scope:**
- Parse `ops/records/packages/art-mantras.art` → artast
- Serialize artast → markdown
- Assert zero diffs
- Add roundtrip test to parser package
- Verify: `npm run test` passes

### Phase 3 — Archive and publish

#### `archive-poc-parse` - `PLANNED`

**Commit Message:** `art-js: archive poc-parse package`

**Instructions File:** `_backlog/plan-md-art-roundtrip/instructions/archive-poc-parse.md`

**Scope:**
- Mark poc-parse as `private: true` in package.json
- Add README noting it's archived
- Keep for reference but remove from active workspace

#### `publish-v0.1.0` - `PLANNED`

**Commit Message:** `art-js: publish v0.1.0`

**Instructions File:** `_backlog/plan-md-art-roundtrip/instructions/publish-v0.1.0.md`

**Scope:**
- Ensure all packages have correct `publishConfig`
- Version bump to `0.1.0`
- Run `npm publish` for primitives and parser
- Verify: packages installable from npm

## Follow ups

- Split POC into packages (after roundtrip)
- Reactive core (chokidar → signals → memo recompute)
- Template engine research (Nunjucks/Handlebars/Liquid vs `.tart` requirements)
- Precompiled rewrite (install-time compilation + per-project overrides)
- Standalone build of the compile command (`artificials/bin/compile`)
