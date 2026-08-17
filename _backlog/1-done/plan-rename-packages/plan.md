# Plan: Rename Packages

**ID:** `rename-packages`

**Status:** `DONE`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Singularize the accidental plural in the `@art-js/artificials-*` package names: rename to `@art-js/artificial-*` across the live tree of the Artificial repository — `package.json` names, `ops/records/packages/` records, `ops/records/namespaces/art-js.art`, the `artificials-lib-build.art` script-set record, and every `@art-js/artificials-*` reference in `*.art` and `*.md` docs (READMEs, architecture ADRs). Executed within the Artificial repository (`repos/artificial`) as phase 0 of the MD Art Roundtrip milestone — before anything else, even before bootstrapping packages. The `artificials-watcher` package/record and the `artificials-build` / `artificials-watch` commands (workspace-tooling territory) are NOT renamed here; a message for that architect is filed at `_backlog/_message-workspace-tooling-architect.md`.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: `artificials-build` and `artificials-watch` (owned by the workspace-tooling package), addressed by a message filed for that architect at `_backlog/_message-workspace-tooling-architect.md` — requires releasing a new CLI version and updating all consumers. This includes `art-js/cli/watcher/**` (the `@art-js/artificials-watcher` package), `ops/records/packages/artificials-watcher.art`, `ops/records/scripts/artificials-cli-build.art`, and `ops/records/dependencies/cli-dev.art` — all stay as-is.
- Out of scope: `_backlog/**` (milestone, plans, archived plans, messages) — historical records plus the documents that describe the rename itself; `art-domains/**`, `artisans/**`, `_temp/**` — other namespaces.
- Out of scope: `art-js/cli/poc-parse/**` — read-only migration source; fixtures must stay byte-identical for snapshot verification in later phases.
- Out of scope: all milestone execution phases 1-10 (bootstrap, fixtures, migration, constructs, serializer, pipeline, knowledge, gaps, publish).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

All `@art-js/artificials-*` package names are renamed to `@art-js/artificial-*` in this plan (10 packages; the watcher package is excluded):

- Package: Artificial Primitives – Canonical `@art-js/artificial-primitives` (renamed from `@art-js/artificials-primitives`; public @0.0.1); described by `ops/records/packages/artificial-primitives.art` (record renamed from `artificials-primitives.art` in this plan); located at `art-js/libs/primitives/`.
- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (renamed from `@art-js/artificials-parser`; public @0.0.1); described by `ops/records/packages/artificial-parser.art` (record renamed from `artificials-parser.art` in this plan); located at `art-js/libs/parser/`.
- Package: Artificial Spec – Canonical `@art-js/artificial-spec` (renamed from `@art-js/artificials-spec`); located at `art-js/spec/`. NOTE: no package record exists for spec in `ops/records/packages/` — only the `package.json` name and its references are renamed; the missing record is a follow-up.
- Package: Artificial Validator – Canonical `@art-js/artificial-validator` (renamed from `@art-js/artificials-validator`); described by `ops/records/packages/artificial-validator.art` (renamed in this plan); located at `art-js/libs/validator/`.
- Package: Artificial Bundler – Canonical `@art-js/artificial-bundler` (renamed from `@art-js/artificials-bundler`); described by `ops/records/packages/artificial-bundler.art` (renamed in this plan); located at `art-js/libs/bundler/`.
- Package: Artificial Program – Canonical `@art-js/artificial-program` (renamed from `@art-js/artificials-program`); described by `ops/records/packages/artificial-program.art` (renamed in this plan); located at `art-js/libs/program/`.
- Package: Artificial Bin – Canonical `@art-js/artificial-bin` (renamed from `@art-js/artificials-bin`); described by `ops/records/packages/artificial-bin.art` (renamed in this plan); located at `art-js/cli/bin/`.
- Package: Artificial Dev Server – Canonical `@art-js/artificial-dev-server` (renamed from `@art-js/artificials-dev-server`); described by `ops/records/packages/artificial-dev-server.art` (renamed in this plan); located at `art-js/cli/dev-server/`.
- Package: Artificial Language Server – Canonical `@art-js/artificial-language-server` (renamed from `@art-js/artificials-language-server`); described by `ops/records/packages/artificial-language-server.art` (renamed in this plan); located at `art-js/cli/language-server/`.
- Package: Artificial Tools – no `package.json` yet (only README + record); record `ops/records/packages/artificial-tools.art` renamed from `artificials-tools.art` in this plan, canonical `@art-js/artificial-tools` (renamed from `@art-js/artificials-tools`).
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse` (name unchanged); described by `ops/records/packages/artificial-poc-parse.art` (record renamed from `artificials-poc-parse.art` in this plan); located at `art-js/cli/poc-parse/` (migration source; read-only).
- Excluded: `@art-js/artificials-watcher` (package, record, and references stay as-is — workspace-tooling territory).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 0; every phase below depends on the singularized names.
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items; the workspace-tooling message is filed alongside.
- Message: `_backlog/_message-workspace-tooling-architect.md` – files the excluded workspace-tooling rename (`artificials-build` / `artificials-watch`).

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source).

### Knowledge

- Grep-driven rename: `@art-js/artificials-` → `@art-js/artificial-`, record filenames `artificials-*.art` → `artificial-*.art`, record headings `## Package: Artificials {X}` → `## Package: Artificial {X}`, namespace references `- Package: Artificials {X}` → `- Package: Artificial {X}`, and package display names (`# Artificials {X}` README h1s, `[Artificials {X}]` link texts) — all across the live tree, except the exclusions.
- Exclusions (do not touch): `_backlog/**`, `_temp/**`, `art-domains/**`, `artisans/**`, `art-js/cli/poc-parse/**`, `art-js/cli/watcher/**`, `ops/records/packages/artificials-watcher.art`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/dependencies/cli-dev.art`, plus the literal `.artificials.config.mts` filename references (intentional) and the bare word "Artificials" in prose (toolkit links, descriptions — not part of this rename).
- `package-lock.json` is regenerated via `npm install` (repo root), never hand-edited.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `ops/records/packages/` – the package records to rename.
- `ops/records/namespaces/art-js.art` – the namespace record listing package references to singularize.
- `ops/records/scripts/artificials-lib-build.art` – the script-set record to rename (references from lib package records).
- `art-js/**/package.json` + root `package.json` – package names to update.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directory is the repository root.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run from `repos/artificial` repository directory (scoped grep — expected residue is only the exclusions):

```bash
grep -rn "artificials-" --include="*.md" --include="*.art" --include="*.json" --include="*.ts" . \
  | grep -v node_modules | grep -v package-lock.json | grep -v "\.git/"
```

Expected residue (allowed, do not touch): hits under `_backlog/`, `art-domains/`, `artisans/`, `_temp/`, `art-js/cli/poc-parse/`, `art-js/cli/watcher/`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/packages/artificials-watcher.art`, and the `artificials-build` / `artificials-watch` mentions in `art-js/**/README.md`.

Run per renamed package (or repo-wide):

```bash
npm run lint # must pass
```

## Commits

### `rename-packages` - `COMMITTED`

**Commit Message:** `refactor: singularize artificial package names`

**Instructions File:** `_backlog/3-now/plan-rename-packages/instructions/rename-packages.md`

**Commit Id:** `2f2f326`

**Report:** `_backlog/3-now/plan-rename-packages/instructions/rename-packages__report.md`

**Evidence:** singularized `@art-js/artificial-*` across the live tree (8 `package.json` names, 10 package records, `artificial-lib-build.art` script-set record, namespace references, README display names, docs references); `package-lock.json` regenerated via `npm install`; watcher and exclusions untouched. Scoped grep returns only expected residue; `npm run lint` 11/11 pass, exit 0.

**Scope:**

- Rename `@art-js/artificials-*` → `@art-js/artificial-*` in `package.json` names (10 packages: spec, primitives, parser, validator, bundler, program, bin, dev-server, language-server; watcher excluded) and in all `*.art` / `*.md` references (READMEs, `art-js/README.md`, `art-js/libs/parser/architecture/index.md`, `architecture/records/adr/language.art`)
- Rename package records `ops/records/packages/artificials-*.art` → `artificial-*.art` (10 records: primitives, parser, validator, bundler, program, bin, dev-server, language-server, tools, poc-parse; NOT `artificials-watcher.art`; spec has no record), updating each record's `## Package: Artificials {X}` heading and `**Canonical Name:**`
- Rename `ops/records/scripts/artificials-lib-build.art` → `artificial-lib-build.art` (+ heading `## Package Script Set: Artificial Lib Build`) and update the reference in the lib package records; `artificials-cli-build.art` stays (excluded)
- Singularize package references in `ops/records/namespaces/art-js.art` (`- Package: Artificials {X}` → `- Package: Artificial {X}`, except Watcher)
- Singularize package display names in README h1s (`# Artificials {X}` / `# artificials-{x}`) and `art-js/README.md` links (except Watcher)
- Regenerate `package-lock.json` via `npm install` instead of hand-editing
- EXCLUDE: `_backlog/**`, `_temp/**`, `art-domains/**`, `artisans/**`, `art-js/cli/poc-parse/**`, `art-js/cli/watcher/**`, `ops/records/packages/artificials-watcher.art`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/dependencies/cli-dev.art`
- Verify: scoped grep shows only the expected residue; `npm run lint` passes

```
**CHANGELOG:**

- Rename `@art-js/artificials-*` → `@art-js/artificial-*` (package names, records, references)
- Rename package records `ops/records/packages/artificials-*.art` → `artificial-*.art`
- Singularize `## Package: Artificials {X}` headings and namespace references
- Rename `ops/records/scripts/artificials-lib-build.art` → `artificial-lib-build.art`
- Keep `@art-js/artificials-watcher` and `artificials-build` / `artificials-watch` untouched (workspace-tooling territory)
```

## Follow ups

- No package record exists for `@art-js/artificial-spec` in `ops/records/packages/` — decide whether to create `artificial-spec.art` (or `art-js/spec/_records/package.art`) later.

## Feedback

Nothing relevant.
