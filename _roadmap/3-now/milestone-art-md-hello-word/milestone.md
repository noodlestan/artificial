# Milestone: Art MD Hello World

**ID:** `art-md-hello-world`

**Status:** `PLANNING`

**Template:** `$DOMAINS/roadmaps/templates/milestone.tart`

**Skill:** `write-milestone`

**Purpose:** Coordinate the Art MD Website from hello world through POC demos to record integration.

**Description:** Milestone with 3 phases (hello world, poc, integrate records) and 8 plans, coordinated across `$PROJECT`, `$ART_MD`, and `$ART_JS`.

## Mandatory Reading

::READ `$DOMAINS/roadmaps/structures/milestone.art` (Structure) — Defines the milestone structure and nested types.

---

## Path Variables

| Variable     | Resolved Path                      | Purpose                                              |
| ------------ | ---------------------------------- | ---------------------------------------------------- |
| `$WORKSPACE` | Current working directory          | Workspace root directory                             |
| `$DOMAINS`   | `$WORKSPACE/.agents/domains`       | Domain resources directory                           |
| `$PROJECT`   | `$WORKSPACE/checkouts/artificials` | Artificials project checkout — implementation target |
| `$ART_MD`    | `$WORKSPACE/checkouts/art-md`      | Art MD project checkout — observe progress           |
| `$ART_JS`    | `$WORKSPACE/checkouts/art-js`      | Art JS project checkout — observe progress           |

## Summary

Coordinate the Art MD Website build from a hello-world scaffold through POC demos (code, design, interactions) to integrating records in the demo.

## Attachments

None.

## Context

### Upstream Work

| Kind        | Path                                | Role                                                            |
| ----------- | ----------------------------------- | --------------------------------------------------------------- |
| Parking Lot | `$PROJECT/_backlog/_parking-lot.md` | Tracks short-term actionables, pending questions, and blockers. |

### Required Skills

- `write-milestone` — Generates milestones from sources and context. Required for Contextualizing, Drafting, Refining.
- `write-plan` — Generates plans from sources and context. Required for Contextualizing, Drafting, Refining.
- `render-template` — Renders milestone and plan artefacts. Required for Drafting, Refining.

### Domains

| Domain / Path                                       | Description                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Domain: Roadmaps `$DOMAINS/roadmaps/index.md`       | Coordinates long-horizon work across projects by capturing milestones.             |
| Domain: Plans `$DOMAINS/plans/index.md`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Domain: Deployments `$DOMAINS/deployments/index.md` | Deployment lifecycle for pre-deploy, deploy, and post-deploy stages.               |

### Resource Kinds in Scope

| Kind        | Domain       | Structure Record Path                      |
| ----------- | ------------ | ------------------------------------------ |
| Project     | Projects     | `$DOMAINS/projects/structures/project.art` |
| Application | Applications | — WIP                                      |

### Workflows

| Workflow / Path                                                              | Purpose                                                                              |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Workflow: Roadmapping `$DOMAINS/roadmaps/workflows/roadmapping/workflow.art` | Organize roadmap creation and maintenance and coordination of downstream work items. |
| Workflow: Planning `$DOMAINS/plans/workflows/planning.art`                   | Planning lifecycle for contextualising, drafting, refining, and integrating plans.   |
| Workflow: Engineering `$DOMAINS/engineering/workflows/engineering.art`       | Engineering lifecycle for setting up, verifying, and committing work.                |

### Knowledge

::READ `$DOMAINS/roadmaps/structures/milestone.art` (Structure) — Defines milestone record fields and statuses. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan record fields and statuses. Relevant for stages Drafting, Refining.

::READ `$WORKSPACE/_guide.md` (Guide) — Defines workspace operations and verification. Relevant for stages Setting up, Verifying, Committing.

::READ `$PROJECT/_guide.md` (Guide) — Defines the Artificials project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD/_guide.md` (Guide) — Defines the Art MD project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_JS/_guide.md` (Guide) — Defines the Art JS project operations. Relevant for stages Setting up, Verifying.

## Scope

This milestone coordinates the Art MD Website build across three resources: the Art MD Website (implementation target) and the Art MD and Art JS projects (observed for progress).

### (Scope) Project: Art MD

**Record:** `$ART_MD/_records/project.art`

**Role:** — Observe progress, consume libraries in demos.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD/`

**Dependencies:**

- None.

### (Scope) Project: Art JS

**Record:** `$ART_JS/_records/project.art`

**Role:** — Observe progress, consume libraries in demos.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_JS/`

**Dependencies:**

- None.

### (Scope) Application: Art MD Website

**Record:** `$PROJECT/apps/art-md-web/_records/package.art`

**Role:** — Implementation target.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$PROJECT/apps/art-md-web/`

**Changes:**

- Scaffold the Art MD Website Astro package.
- Add home content and about page.
- Build code, design, and interaction POC demos.
- Integrate records in the demo.

**Dependencies:**

- None.

## Execution Context

Execution is coordinated from `$WORKSPACE`. The implementation target is `$PROJECT/apps/art-md-web`. The Art MD and Art JS projects are observed for progress.

---

## Phases

| Index | Name         | Status    |
| ----- | ------------ | --------- |
| #1    | Hello World  | `WORKING` |
| #2    | POC          | `DRAFT`   |
| #3    | Records Demo | `DRAFT`   |

### Phase: 1 — Hello World

**Goal:** Ship a hello-world Art MD Website.

**Description:** Scaffold the Art MD Website package and add home content and an about page.

**Status:** `WORKING`

**Dependencies:**

- None.

### Phase: 2 — POC

**Goal:** Prove out code, design, and interaction demos.

**Description:** Build POC demos for code, design, and interactions, decomposing codec and style elements.

**Status:** `PLANNING`

**Dependencies:**

- None.

### Phase: 3 — Records Demo

**Goal:** Integrate records in the demo.

**Description:** Integrate records into the demo.

**Status:** `PLANNING`

**Dependencies:**

- None.

---

## Items:

| Phase | Resource / Record                                                                             | Status |
| ----- | --------------------------------------------------------------------------------------------- | ------ |
| 1     | Plan: Scaffold Art MD Website `$PROJECT/_backlog/1-done/plan-scaffold-art-md-website/plan.md` | `DONE` |
| 1     | Plan: Home content and about page                                                             | -      |
| 2     | Plan: Code Demo POC (with SolidJS)                                                            | -      |
| 2     | Plan: Decompose Codec Demo                                                                    | -      |
| 2     | Plan: Design POC                                                                              | -      |
| 2     | Plan: Decompose Style Elements                                                                | -      |
| 1     | Plan: Demo Interactions POC                                                                   | -      |
| 1     | Plan: Integrate Records in Demo                                                               | -      |

The following items are not yet captured in a work item document.

### Plan: Home content and about page

**Status:** `DRAFT`

**Purpose:** Add home content and an about page to the Art MD Website.

**Description:** Create the home content and about page for the Art MD Website.

**Changes:**

- Add home content.
- Add about page.

**Dependencies:**

- None.

### Plan: Code Demo POC (with SolidJS)

**Status:** `DRAFT`

**Purpose:** Prove out a code demo using SolidJS.

**Description:** Build a code demo POC with SolidJS.

**Changes:**

- Build code demo POC with SolidJS.

**Dependencies:**

- None.

### Plan: Decompose Codec Demo

**Status:** `DRAFT`

**Purpose:** Decompose the codec demo.

**Description:** Decompose the codec demo into reusable parts.

**Changes:**

- Decompose codec demo.

**Dependencies:**

- None.

### Plan: Design POC

**Status:** `DRAFT`

**Purpose:** Prove out the design system.

**Description:** Build a design POC.

**Changes:**

- Build design POC.

**Dependencies:**

- None.

### Plan: Decompose Style Elements

**Status:** `DRAFT`

**Purpose:** Decompose style elements.

**Description:** Decompose style elements into reusable parts.

**Changes:**

- Decompose style elements.

**Dependencies:**

- None.

### Plan: Demo Interactions POC

**Status:** `DRAFT`

**Purpose:** Prove out demo interactions.

**Description:** Build a demo interactions POC.

**Changes:**

- Build demo interactions POC.

**Dependencies:**

- None.

### Plan: Integrate Records in Demo

**Status:** `DRAFT`

**Purpose:** Integrate records in the demo.

**Description:** Integrate records into the demo.

**Changes:**

- Integrate records in demo.

**Dependencies:**

- None.

---

## Work

### Next

Plan Phase 1: Home content and about page.

### Blockers

- None.

## Operating Instructions

### Writing Commit Message

**Purpose:** Write standardized message according to context conventions. Operation of Workflow: Planning Work, defined in `$DOMAINS/work/workflows/planning-work/ops/writing-commit-message.art`.

**Instructions:** (From `$WORKSPACE/_guide.md`)

1. Read commit message conventions from `$WORKSPACE/knowledge/conventions/writing-commit-message.art`.
2. Write the commit message following the rules defined there.

### Setting Up

**Purpose:** Prepare the execution environment. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/ops/setting-up.art`.

**Instructions:** (From `$WORKSPACE/_guide.md`)

Run from the `$WORKSPACE` root:

```bash
npm ci # to install dependencies.
```

### Verifying Completion

**Purpose:** Confirms that the work item has been completed and satisfies its intended outcome. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/ops/verifying-completion.art`.

**Instructions:** (From `$PROJECT/_guide.md`)

Run from the `$PROJECT` root:

```bash
npm run lint:fix # autofix formatting issues
npm run lint # report remaining issues
npm run art-work sanity # to check git status across all repos
```

---

## Coordination

### Not In Scope

- **Deployment** — Deferred to follow-up plan.

### Evidence

- **Hello World** — Art MD Website renders a hello-world page.

### Findings

- None.

### Decisions

- **SolidJS** — Code demo POC uses SolidJS.

### Knowledge to Update

None.

### Follow Ups

- Deploy the Art MD Website.

### Feedback

None.
