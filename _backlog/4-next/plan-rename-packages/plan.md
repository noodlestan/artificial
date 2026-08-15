# Plan: Rename Packages

**ID:** `rename-packages`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Singularize the accidental plural in the `@art-js/artificials-*` package names: rename to `@art-js/artificial-*` across `*.art`, `package.json`, and `*.md` files in the Artificial repository, including the package records in `ops/records/packages/` and every reference to them ("Package: Artificials ..." → "Package: Artificial ..."). Executed within the Artificial repository (`repos/artificial`) as phase 0 of the MD Art Roundtrip milestone — before anything else, even before bootstrapping packages. `artificials-build` and `artificials-watch` (workspace-tooling package) are NOT renamed here; a message for that architect is filed at `_backlog/_message-workspace-tooling-architect.md`.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: `artificials-build` and `artificials-watch` (owned by the workspace-tooling package), addressed by a message filed for that architect at `_backlog/_message-workspace-tooling-architect.md` — requires releasing a new CLI version and updating all consumers.
- Out of scope: all milestone execution phases 1-10 (bootstrap, fixtures, migration, constructs, serializer, pipeline, knowledge, gaps, publish).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Primitives – Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art` (record renamed from `artificials-primitives.art` in this plan); located at `art-js/libs/primitives/`.
- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art` (record renamed from `artificials-parser.art` in this plan); located at `art-js/libs/parser/`.
- Package: Artificial Spec – Canonical `@art-js/artificial-spec`; described by `ops/records/packages/artificial-spec.art` (record renamed from `artificials-spec.art` in this plan); located at `art-js/spec/`.
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse` (name unchanged); described by `ops/records/packages/artificial-poc-parse.art` (record renamed from `artificials-poc-parse.art` in this plan); located at `art-js/cli/poc-parse/` (migration source; read-only).
- Note: constructs and serializer records do not exist yet — they are created singular from the start (phases 4 and 5).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 0; every phase below depends on the singularized names.
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items; the workspace-tooling message is filed alongside.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source).

### Knowledge

- Grep-driven rename: `artificials-` → `artificial-` across the repository, except the exclusions below.
- Exclusions: `art-domains/**` (workspace-tooling territory), `artificials-build`, `artificials-watch`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/packages/artificials-watcher.art` — all covered by the workspace-tooling message.
- `package-lock.json` is regenerated, not hand-edited.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `ops/records/packages/` – the package records to rename.
- `art-js/**/package.json` + root `package.json` – package names to update.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directory is the repository root.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

```bash
grep -rn "artificials-" . # must return only the excluded hits (workspace-tooling-owned)
npm run lint # per package, must pass
```

## Commits

### `rename-packages` - `DRAFT`

**Commit Message:** `refactor: singularize artificial package names`

**Instructions File:** `_backlog/4-next/plan-rename-packages/instructions/rename-packages.md`

**Scope:**

- Rename `@art-js/artificials-*` → `@art-js/artificial-*` in `*.art`, `package.json`, and `*.md` across the Artificial repository
- Rename package records `ops/records/packages/artificials-*.art` → `artificial-*.art` (primitives, parser, spec, poc-parse; NOT `artificials-watcher.art`)
- Rename "Package: Artificials ..." → "Package: Artificial ..." in `*.md` and `*.art`
- Singularize record references (e.g. `ops/records/packages/artificials-poc-parse.art` → `artificial-poc-parse.art`)
- Regenerate `package-lock.json` instead of hand-editing
- EXCLUDE: `art-domains/**`, `artificials-build`, `artificials-watch`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/packages/artificials-watcher.art` — filed as a message for the workspace-tooling architect
- Verify: grep confirms only the excluded `artificials-` hits remain; `npm run lint` passes per package

## Follow ups

None.

## Feedback

No sub-agent reports yet.
