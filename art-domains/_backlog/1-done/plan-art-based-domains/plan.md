# Plan: Art Based Domains

**ID:** `art-based-domains`

**Status:** `DONE`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

## Path Variables

| Variable      | Resolved Path                             | Purpose                                      |
| ------------- | ----------------------------------------- | -------------------------------------------- |
| `$WORKSPACE`  | Current working directory                 | Workspace root                               |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains/`             | Art domain instructions and resource indexes |
| `$MANAGEMENT` | `$WORKSPACE/checkouts/management/`        | Roadmap feeding this plan                    |
| `$ART_JS`     | `$WORKSPACE/checkouts/artificial/art-js/` | Source of structures being hoisted           |

## Summary

Build new `$DOMAINS` around single-responsibility Art modules and domain resource indexes to improve QoS and accuracy of planning and delegation workflows, with the work recorded in three commits and supported by one strict-template instruction file per commit.

## Changes (End State)

- Establish the domain baseline by separating roadmap, deployment, namespace, package, primitive, repository, scaffolder, project, work, and workspace responsibilities into dedicated domains.
- Normalize all domain entry points and indexes to the shared domain record and fixed resource-kind layout, including extraction of previously inline resources into `.art` files.
- Normalize structure inheritance so every structure identifies its base with `**Extends:**` and repeats inherited fields under `**Inherits:**` using local examples.

## Scope

### Workspace

Work is coordinated from `$WORKSPACE`; domain changes are made under `$DOMAINS` and roadmap tracking changes under `$MANAGEMENT/_roadmap/3-now/`.

### Source Repository

- Art JS specification source at `$ART_JS/spec/`, specifically `structures/structure-abstract.art` and `primitives/record-field.art`.

### Roadmap Repository

- Management roadmap at `$MANAGEMENT/_roadmap/3-now/milestone-hello-world/` and this plan directory.

## Context

### Sources

- Milestone: `$MANAGEMENT/_roadmap/3-now/milestone-hello-world/milestone.md` — establishes Phase 1 and tracks this plan as its single active downstream item.
- Domain WIP: `$DOMAINS/` — contains the in-progress domain split, indexes, structures, templates, and resource files to reconcile rather than replace blindly.
- Management guide: `$MANAGEMENT/_guide.md` — defines the roadmap repository workflow and lint verification.

### Guides

- `$WORKSPACE/_guide.md` — defines workspace layout and workspace-level sanity checks.
- `$MANAGEMENT/_guide.md` — defines management repository verification with Prettier and ESLint.
- `$DOMAINS/engineering/_guide.md` — defines architect, delegator, and worker responsibilities and planning agreements.
- `$WORKSPACE/checkouts/artificial/_guide.md` — provides the source repository context for the hoisted Art JS records.

### Knowledge

| Kind      | Path                                                      | Purpose                                             |
| --------- | --------------------------------------------------------- | --------------------------------------------------- |
| Structure | `$DOMAINS/_artificials/structures/structure-abstract.art` | Current hoisted `Structure (Abstract)` baseline.    |
| Type      | `$DOMAINS/_artificials/types/record-field.art`            | Current hoisted `Record Field` baseline.            |
| Structure | `$DOMAINS/roadmaps/structures/milestone.art`              | Milestone shape and phase/item model.               |
| Template  | `$DOMAINS/roadmaps/templates/milestone.tart`              | Milestone document layout.                          |
| Structure | `$DOMAINS/plans/structures/plan.art`                      | Plan, scope, and context shape.                     |
| Template  | `$DOMAINS/plans/templates/plan.tart`                      | Plan document layout.                               |
| Template  | `$DOMAINS/plans/templates/instructions.tart`              | Self-contained Commit 1 instruction layout.         |
| Index     | `$DOMAINS/domains/index.md`                               | Domain producer/consumer API and index conventions. |
| Index     | `$DOMAINS/roadmaps/index.md`                              | Roadmaps domain entry point.                        |
| Index     | `$DOMAINS/plans/index.md`                                 | Plans domain entry point.                           |

## Mandatory Reading

::READ `$DOMAINS/engineering/_guide.md` (Guide) — Defines architect planning responsibilities and working agreements.

::READ `$DOMAINS/work/index.md` (Domain Index) — Defines work items, scopes, contexts, phases, and stages.

::READ `$DOMAINS/roadmaps/structures/milestone.art` (Structure) — Defines milestone records and nested work items.

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan records, statuses, scope, and context.

::READ `$DOMAINS/domains/index.md` (Domain Index) — Defines domain entry points, resource indexes, and domain API conventions.

::READ `$ART_JS/spec/structures/structure-abstract.art` (Structure) — Source definition to hoist and reconcile.

::READ `$ART_JS/spec/primitives/record-field.art` (Type) — Source definition to hoist and reconcile.

## Execution Context

Commit work is performed manually across `$WORKSPACE/.agents/domains/`, with roadmap records maintained in `$MANAGEMENT`. The Commit 1 instruction file is recorded for reproducibility but is not delegated by this plan.

## Setup

No dependency setup is required for the documentation-only planning changes.

## Verification

From `$WORKSPACE`, run:

```bash
npm run lint
```

From `$MANAGEMENT`, run:

```bash
npm run lint
```

## Execution Notes

The three commits are intentionally retained as separate steps. Each commit has a strict-template implementation instruction file; execution remains manually coordinated.

## Commits

### `new-work-domains` - `COMMITTED`

**Commit Message:** `build(domains): establish Art Domains baseline`

**Commit id:** `4c2b3f1`

**Instructions File:** `$MANAGEMENT/_roadmap/3-now/plan-art-based-domains/instructions/build-work-domains.md`

Introduce new Work domains and establish the shared baseline:

- Shared foundations: hoist `Structure: Structure (Abstract)` and `Type: Record Field` from `$ART_JS`; create the Roadmaps milestone structure/template; and extract `path-ref` and `resource-ref` into Primitives.
- Work-resource extraction: create Deployments, Namespaces, Packages, Repositories, Scaffolders, Work, and Workspaces from the current project records, prototype records, and milestone draft.
- Ownership cleanup: trim Projects to `Structure: Project` and `Type: License`, then update every affected `domain.art`, `index.md`, resource link, and ownership reference.

### `normalize-domains` - `COMMITTED`

**Commit Message:** `build(domains): normalize domain indexes and resource files`

**Commit id:** `5a834c9`

**Instructions File:** `$MANAGEMENT/_roadmap/3-now/plan-art-based-domains/instructions/normalize-domains.md`

Normalize these domains: Conventions, Deployments, Domains, Engineering, Namespaces, Plans, Packages, Primitives, Projects, References, Repositories, Roadmaps, Tasks, Work, and Workspaces.

- Split inline Plans `files/index.md` content into one `.art` file per file resource containing Purpose, Naming Pattern, Template, and Location.
- Split inline Domains `routines/index.md` content into one `.art` file per routine.
- Create or normalize each `domain.art` as the author entry point with Purpose and Description.
- Create or normalize each `index.md` as the consumer entry point with a title, purpose, description, definitions, and fixed resource-kind sections in this order: Structures, Types, Workflows, Routines, Templates, Files.
- Render each resource kind as a table and omit empty sections.

## Follow Ups

- Repair stale legacy references in the existing milestone: undefined `$ARTIFICIAL` variables, singular `$DOMAINS/project`, `$DOMAINS/deployment` instead of `$DOMAINS/deployments`, and legacy item paths that do not resolve.

## Feedback

WIP — no downstream execution feedback has been collected.
