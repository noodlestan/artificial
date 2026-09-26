# Plan: Code Demo POC (with SolidJS)

**ID:** `code-demo-poc-solidjs`

**Status:** `DRAFT`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Prove out a code demo using SolidJS.

**Description:** Build a code demo POC with SolidJS in the Art MD Website Astro package and add a 404 page.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Describe the work-item changes through a series of iterations and commits with detailed instructions.

---

## Path Variables

| Variable      | Resolved Path                      | Purpose                                    |
| ------------- | ---------------------------------- | ------------------------------------------ |
| `$WORKSPACE`  | Current working directory          | Workspace root directory                   |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`       | Domain resources directory                 |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout               |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package               |
| `$ART_JS`     | `$WORKSPACE/checkouts/art-js`      | Art JS project checkout — observe progress |

## Summary

Build a code demo POC with SolidJS in the Art MD Website to prove out code demos, observing the Art JS project for progress.

## Attachments

None.

## Context

### Upstream Work

| Kind        | Path                                                               | Role                                                                  |
| ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Milestone   | `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md` | Coordinates this plan as Phase 2 of the Art MD Hello World milestone. |
| Parking Lot | `$PROJECT/_backlog/_parking-lot.md`                                | Tracks short-term actionables, pending questions, and blockers.       |

### Required Skills

- `write-plan` — Generates plans from sources and context. Required for Contextualizing, Drafting, Refining.
- `render-template` — Renders plan and instruction artefacts. Required for Drafting, Refining.

### Domains

| Domain / Path                                       | Description                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Domain: Plans `$DOMAINS/plans/index.md`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Domain: Deployments `$DOMAINS/deployments/index.md` | Deployment lifecycle for pre-deploy, deploy, and post-deploy stages.               |

### Resource Kinds in Scope

| Kind        | Domain       | Structure Record Path                      |
| ----------- | ------------ | ------------------------------------------ |
| Application | Applications | — WIP                                      |
| Project     | Projects     | `$DOMAINS/projects/structures/project.art` |

### Workflows

| Workflow / Path                                                        | Purpose                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Workflow: Planning `$DOMAINS/plans/workflows/planning.art`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Workflow: Engineering `$DOMAINS/engineering/workflows/engineering.art` | Engineering lifecycle for setting up, verifying, and committing work.              |

### Knowledge

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan record fields and statuses. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/plans/structures/iteration.art` (Structure) — Defines iteration as a container for changes and instructions. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/commits/types/commit.art` (Type) — Defines planned commit blueprints. Relevant for stages Drafting, Refining.

::READ `$WORKSPACE/_guide.md` (Guide) — Defines workspace operations and verification. Relevant for stages Setting up, Verifying, Committing.

::READ `$PROJECT/_guide.md` (Guide) — Defines the Artificials project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD_WEB/_guide.md` (Guide) — Defines the Art MD Website package operations. Relevant for stages Setting up, Verifying.

::READ `$ART_JS/_guide.md` (Guide) — Defines the Art JS project operations. Relevant for stages Setting up, Verifying.

## Scope

This plan builds a code demo POC with SolidJS in the Art MD Website, observing the Art JS project for progress.

### (Scope) Application: Art MD Website

**Record:** `$ART_MD_WEB/_records/package.art`

**Role:** — Implementation target.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD_WEB/`

**Changes:**

- Add SolidJS integration to the Astro app.
- Build a code demo POC page.

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

## Execution Context

Execution is coordinated from `$WORKSPACE`. The demo changes happen in `$ART_MD_WEB` on branch `main`. The Art JS project is observed for progress.

---

## Items:

| Iteration / Instructions                                                                          | Status  |
| ------------------------------------------------------------------------------------------------- | ------- |
| Iteration: Build Code Demo POC `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md` | `DRAFT` |
| Iteration: Add 404 Page `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`               | `DRAFT` |

### Iteration: Build Code Demo POC

**Id:** `build-code-demo-poc`

**Status:** `DRAFT`

**Purpose:** Build a code demo POC with SolidJS

**Description:** Add SolidJS integration to the Astro app and build a code demo POC page using `@art-md/codec`

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md`

**Changes:**

- Add SolidJS integration to the Astro app.
- Add `@art-md/codec` dependency.
- Build a code demo POC on the homepage using SolidJS Components:
  - User inputs markdown in one textarea, art-ast shows up in a readonly textarea.
  - Markdown textarea is pre-populated a demo fixture.

Demo fixture:

```
# Hello World

## Repository: Art MD

**Author:** Noodlestan Collective

**Remote:** `git@github.com:noodlestan/art-md.git `
```

### Iteration: Add 404 Page

**Id:** `add-404-page`

**Status:** `DRAFT`

**Purpose:** Add a 404 page so unknown routes render a styled page instead of an S3 XML error.

**Description:** Create `src/pages/404.astro` using `PageLayout` so the Astro build emits `dist/404.html`, which the CloudFront `custom_error_response` in `$OPS/modules/static-website/cf-distribution` already points at.

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`

**Changes:**

- Create `src/pages/404.astro` using `PageLayout`, with a heading, a short explanation, and a link back to the home page.
- Apply the `main-section` layout classes so the page matches the design POC.
- Confirm `npm run build` emits `dist/404.html`, and that a request to an unknown path on the deployed site returns the page rather than `application/xml`.

**Dependencies:**

- None.

---

## Work

### Next

Draft iterations and write instructions for the plan.

### Blockers

- None.

---

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

**Instructions:** (From `$ART_MD_WEB/_guide.md`)

Run from the `$ART_MD_WEB` root:

```bash
npm ci # to install dependencies.
```

### Verifying Completion

**Purpose:** Confirms that the work item has been completed and satisfies its intended outcome. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/ops/verifying-completion.art`.

**Instructions:** (From `$ART_MD_WEB/_guide.md`)

Run from the `$ART_MD_WEB` root:

```bash
npm run lint:fix # autofix formatting issues
npm run lint # report remaining issues
npm run build # produce a full build
```

---

## Coordination

### Not In Scope

- **Decompose codec demo** — Deferred to follow-up plan.
- **Deployment** — Deferred to follow-up plan.

### Evidence

- **Code demo renders** — `npm run build` succeeds and the code demo page renders with SolidJS.

### Findings

- None.

### Decisions

- **SolidJS** — Code demo POC uses SolidJS.

### Knowledge to Update

None.

### Follow Ups

- Decompose the codec demo.

### Feedback

None.
