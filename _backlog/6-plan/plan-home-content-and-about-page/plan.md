# Plan: Home Content and About Page

**ID:** `home-content-and-about-page`

**Status:** `PLANNING`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Add home content and an about page to the Art MD Website.

**Description:** Replace the WIP home content with real content and add an about page to the Art MD Website Astro package.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Describe the work-item changes through a series of iterations and commits with detailed instructions.

---

## Path Variables

| Variable      | Resolved Path                      | Purpose                      |
| ------------- | ---------------------------------- | ---------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory     |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`       | Domain resources directory   |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package |

## Summary

Add real home content and an about page to the Art MD Website so the hello-world site shows meaningful content instead of the WIP placeholder.

## Attachments

None.

## Context

### Upstream Work

| Kind        | Path                                                               | Role                                                                  |
| ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Milestone   | `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md` | Coordinates this plan as Phase 1 of the Art MD Hello World milestone. |
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

| Kind        | Domain       | Structure Record Path |
| ----------- | ------------ | --------------------- |
| Application | Applications | — WIP                 |

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

::READ `$ART_MD_WEB/README.md` (Readme) — Package readme. Relevant for stages Setting up.

## Scope

This plan adds real content to the Art MD Website: home content on the index page and a new about page.

### (Scope) Application: Art MD Website

**Record:** `$ART_MD_WEB/_records/package.art`

**Role:** — Implementation target.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD_WEB/`

**Changes:**

- Add home content to `src/pages/index.astro`.
- Add about page `src/pages/about.astro`.

**Dependencies:**

- None.

## Execution Context

Execution is coordinated from `$WORKSPACE`. The content changes happen in `$ART_MD_WEB` on branch `main`.

---

## Items:

| Iteration / Instructions                                                                                                        | Status  |
| ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Iteration: Add Home Content and About Page `./plan-home-content-and-about-page/instructions/add-home-content-and-about-page.md` | `DRAFT` |

### Iteration: Add Home Content and About Page

**Id:** `add-home-content-and-about-page`

**Status:** `DRAFT`

**Purpose:** Add home content and an about page to the Art MD Website.

**Description:** Replace the WIP home content with real content and add an about page.

**Instructions:** `./plan-home-content-and-about-page/instructions/add-home-content-and-about-page.md`

**Changes:**

- Add home content to `src/pages/index.astro`.
- Add about page `src/pages/about.astro`.

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

- **Deployment** — Deferred to follow-up plan.
- **Design system** — Deferred to the POC phase.

### Evidence

- **Home page renders** — `npm run build` succeeds and `src/pages/index.astro` shows real home content.
- **About page renders** — `/about` route shows the about page.

### Findings

- None.

### Decisions

- None.

### Knowledge to Update

None.

### Follow Ups

- Deploy the Art MD Website.

### Feedback

None.
