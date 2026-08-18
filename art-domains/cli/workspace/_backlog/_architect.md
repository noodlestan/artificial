# Architect Briefing: Workspace CLI

This file tracks the forward-looking plan: why, principles, NFRs, definitions, conventions, and follow-ups.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `architecture/index.md` — How the workspace CLI is structured, how it works, and its use cases.
- `architecture/config.md` — The configuration system.
- `architecture/commands.md` — The command surface, procedures, and edge cases.
- `architecture/context-model.md` — Records and `WorkspaceContext`, `CheckoutStore`, `Checkout`.
- `architecture/operations-log.md` — How operations are logged.
- `architecture/reports.md` — How state and operation logs are presented.
- `architecture/_pseudo.md` — the CLI pseudo-code contract: data structures, use cases, and auxiliary functions.
- Decision records in `architecture/records/adr/`: `cli.art`, `execution-model.art`, and `publish.art`.

## Why

The Noodlestan ecosystem spans multiple independent repositories (`artificial`, `purrception`, `purrtrait`, `purrpose`, `no-comply`, `workspace-tooling`). Each repo builds standalone, but cross-repo development requires coordination: cloning relevant repositories to controlled checkouts, branching across them, symlinking for local dev, and publishing packages. The workspace meta-repo orchestrates this workflow.

## Principles

- No repo depends on the workspace to build.
- Dependencies point one way when possible; reverse edges via publish-then-symlink, not git URLs.
- Publish packages to npm before they can be consumed across repos.
- The workspace owns cross-repo workflow; repos own their hooks and CI.
- The workspace `context` checkout must never commit to an extracted project.
- Workspace tooling lives in the artificial ecosystem (`@art-domains/*`) for consistency with other domain tooling.
- Records are the source of truth; generated files (`.art-workspace.mts`) are derived from records.
- **Imperative first, reactive later.** Commands run as one-shot processes now; the store and log are in-memory per invocation. The design must stay clean enough that `npm run workspace watch` can subscribe to filesystem events and re-scan without rearchitecting. See `architecture/records/adr/execution-model.art`.

## NFRs

- **`git clone <repo>` + `npm install` + `npm run ci` succeeds in every repo independently, without the workspace.**
- Deterministic checkout of all repos from one manifest.
- Each repo's pre-commit runs only its scoped graph, with caching on.
- GitHub Actions runs for all projects and the workspace.
- `.agents/` sits at the root of every checkout (workspace and project).
- **Tested** — every unit carries at least a minimum viable test, BDD specs guide design, and the testing shape follows need ("it depends"), not a prescribed ratio (see `architecture/records/adr/cli.art` → Testing Strategy).
- **`npm run workspace watch`** — future mode that re-scans checkouts on filesystem events and re-reports without re-invocation. Store must be rehydratable from disk at any point.

## Milestones

### Milestone 1

Complete the workspace CLI with remaining commands and infrastructure.

**Fixing (top priority):** `plan-fix-reported-bugs` — bug fixes sourced from reported bugs (first bug: `clone` presents Checkout Report without scanning checkouts). See `_backlog/4-next/plan-fix-reported-bugs/plan.md`.

**Archived:** `plan-implement-pull-push-sync` (pull, push, sync), `plan-fix-repo-command-issues` (repo fixes), `plan-cleaner-code` (decouple private layer). See `_backlog/0-archive/2026-08-18-*`.

**In Parallel (DRAFT plans ready for architect refinement):**

- `plan-implement-link` — `link <location> <package> [<target>]`; see `_backlog/4-next/plan-implement-link/plan.md`.
- `plan-implement-links` — `links`; see `_backlog/4-next/plan-implement-links/plan.md`.
- `plan-implement-unlink` — `unlink <location> <package> [<target>]`; see `_backlog/4-next/plan-implement-unlink/plan.md`.
- `plan-implement-publish` — `publish [--auto]`; depends on `pull`/`push` from `plan-implement-pull-push-sync`; see `_backlog/4-next/plan-implement-publish/plan.md`.

Each DRAFT plan embeds a self-contained **Architect Prompt** — copy it to launch one architect per slice.

## Follow-ups

- **repo-ci** — GitHub Actions workflows for all repos (DRAFT, needs instruction file).
- **Publishing workflow** — formalize the publish-then-symlink pattern into a Workflow resource with agent modes, skills, and commands.
- **Prepare `@art-domains/workspace` domain** — after `@art-domains/workspace-cli` is established, prepare the domain package to host workspace structures and other resources, including a reference to the CLI companion package.
- **Reverse edge resolution** — `purrpose → @no-comply/solid-primitives` is still using `file:` resolution. After no-comply packages are published to npm, rewire to npm version.
- **`manifest-generator`** — auto-generate `.art-workspace.mts` from the records, replacing the manually-authored manifest.
