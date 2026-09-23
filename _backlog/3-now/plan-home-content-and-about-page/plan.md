# Plan: Home Content and About Page

**ID:** `home-content-and-about-page`

**Status:** `WORKING`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Add home content, an about page, and a site header with navigation to the Art MD Website.

**Description:** Replace the WIP home content with real content, add an about page, and add a site header with navigation to the Art MD Website Astro package.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Describe the work-item changes through a series of iterations and commits with detailed instructions.

---

## Path Variables

| Variable      | Resolved Path                      | Purpose                                  |
| ------------- | ---------------------------------- | ---------------------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory                 |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`       | Domain resources directory               |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout             |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package             |
| `$ART_MD`     | `$WORKSPACE/checkouts/art-md`      | Art MD project checkout — content source |
| `$ART_JS`     | `$WORKSPACE/checkouts/art-js`      | Art JS project checkout — content source |

## Summary

Add real home content, an about page, and a site header with navigation to the Art MD Website so the hello-world site shows meaningful content instead of the WIP placeholder.

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

| Kind        | Domain       | Structure Record Path                      |
| ----------- | ------------ | ------------------------------------------ |
| Application | Applications | — WIP                                      |
| Project     | Projects     | `$DOMAINS/projects/structures/project.art` |

### Knowledge

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan record fields and statuses. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/plans/structures/iteration.art` (Structure) — Defines iteration as a container for changes and instructions. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/commits/types/commit.art` (Type) — Defines planned commit blueprints. Relevant for stages Drafting, Refining.

::READ `$WORKSPACE/_guide.md` (Guide) — Defines workspace operations and verification. Relevant for stages Setting up, Verifying, Committing.

::READ `$PROJECT/_guide.md` (Guide) — Defines the Artificials project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD_WEB/_guide.md` (Guide) — Defines the Art MD Website package operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD_WEB/README.md` (Readme) — Package readme. Relevant for stages Setting up.

::READ `$ART_MD/_guide.md` (Guide) — Defines the Art MD project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD/_records/project.art` (Record) — Art MD project purpose and description. Relevant for stages Drafting, Refining.

::READ `$ART_MD/architecture/index.md` (Architecture) — Art MD architecture index. Relevant for stages Drafting, Refining.

::READ `$ART_JS/_guide.md` (Guide) — Defines the Art JS project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_JS/architecture/index.md` (Architecture) — Art JS architecture index. Relevant for stages Drafting, Refining.

::READ `$ART_JS/architecture/components.md` (Architecture) — Art JS components and relationships. Relevant for stages Drafting, Refining.

## Scope

This plan adds real content and navigation to the Art MD Website, sourcing content from the Art MD and Art JS project records and architecture references.

### (Scope) Application: Art MD Website

**Record:** `$ART_MD_WEB/_records/package.art`

**Role:** — Implementation target.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD_WEB/`

**Changes:**

- Add home content to `src/pages/index.astro`.
- Add about page `src/pages/about.astro`.
- Add `src/components/site/SiteHeader.astro`.
- Add `src/layouts/PageLayout.astro`.

**Dependencies:**

- None.

### (Scope) Project: Art MD

**Record:** `$ART_MD/_records/project.art`

**Role:** — Observe progress, source content for pages.

**Partial:**

- `owner` — Project: Art MD
- `path` — `$ART_MD/`

**Dependencies:**

- None.

### (Scope) Project: Art JS

**Record:** `$ART_JS/_records/project.art`

**Role:** — Observe progress, source content for pages.

**Partial:**

- `owner` — Project: Art JS
- `path` — `$ART_JS/`

**Dependencies:**

- None.

## Execution Context

Execution is coordinated from `$WORKSPACE`. The content changes happen in `$ART_MD_WEB` on branch `main`. The Art MD and Art JS projects are observed for progress and content sources.

---

## Items:

| Iteration / Instructions                                                                          | Status  |
| ------------------------------------------------------------------------------------------------- | ------- |
| Iteration: Add Home Content `./plan-home-content-and-about-page/instructions/add-home-content.md` | `DONE`  |
| Iteration: Add About Page `./plan-home-content-and-about-page/instructions/add-about-page.md`     | `DONE`  |
| Iteration: Add Site Header `./plan-home-content-and-about-page/instructions/add-site-header.md`   | `READY` |

### Iteration: Add Home Content

**Id:** `add-home-content`

**Status:** `DONE`

**Report:** `./plan-home-content-and-about-page/instructions/add-home-content__report.md`

**Purpose:** Add real home content to the Art MD Website home page.

**Description:** Replace the WIP home content in `src/pages/index.astro` with real content following the home page outline.

**Instructions:** `./plan-home-content-and-about-page/instructions/add-home-content.md`

**Changes:**

- Add home content to `src/pages/index.astro` per the home page outline.

**Dependencies:**

- None.

#### Page Outline: Home

| Section                | Purpose                                              | Description                                                                                                | Content Sources                                                                                                  |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Hero + intro           | Introduce the Art MD project and the site's purpose. | Hero heading and intro paragraph presenting Art MD as an extensible Markdown language for structured data. | `$ART_MD/_records/project.art`, `$ART_MD/_guide.md`, `$ART_MD_WEB/README.md`, `$ART_MD_WEB/_records/package.art` |
| Links to about page    | Guide visitors to the about page.                    | Link(s) from the home page to `/about`.                                                                    | — (internal navigation)                                                                                          |
| Link to GitHub project | Point visitors to the Art MD source repository.      | Link to `https://github.com/noodlestan/art-md`.                                                            | `$ART_MD_WEB/README.md`, `$ART_MD/_records/project.art`                                                          |
| Placeholder for demo   | Signal upcoming POC demos.                           | Placeholder section for the upcoming code, design, and interaction demos.                                  | `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md` (phases 2–3)                                  |

#### Commits:

| ID                 | Repository / Checkout / Branch    | Policy       | Hash      | Status      |
| ------------------ | --------------------------------- | ------------ | --------- | ----------- |
| `add-home-content` | Artificials / `$PROJECT` / `main` | `AUTONOMOUS` | `ae32ab1` | `COMMITTED` |

##### Commit: `add-home-content`

**Repository:** Repository: Artificials

**Hash:** `ae32ab1`

**Status:** `COMMITTED`

**Message:**

```
feat(art-md-web): Add home content to Art MD website.
```

### Iteration: Add About Page

**Id:** `add-about-page`

**Status:** `DONE`

**Report:** `./plan-home-content-and-about-page/instructions/add-about-page__report.md`

**Purpose:** Add an about page to the Art MD Website.

**Description:** Create `src/pages/about.astro` with the about page outline sections.

**Instructions:** `./plan-home-content-and-about-page/instructions/add-about-page.md`

**Changes:**

- Create `src/pages/about.astro` per the about page outline.

**Dependencies:**

- None.

#### Page Outline: About

| Section           | Purpose                                     | Description                                                                  | Content Sources                                                                                                                              |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `## intro`        | Introduce the Art MD project and its goals. | Intro section describing what Art MD is and what the site hosts.             | `$ART_MD/_records/project.art`, `$ART_MD/_guide.md`, `$ART_MD_WEB/_records/package.art`                                                      |
| `## wip`          | Communicate the work-in-progress status.    | WIP section listing current status and what is being built.                  | `$PROJECT/_records/project.art` (Application: Art MD Website SCAFFOLD), `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md`   |
| `## architecture` | Explain the project architecture.           | Architecture section describing the Art MD / Art JS pipeline and components. | `$ART_MD/architecture/index.md`, `$ART_MD/architecture/components.md`, `$ART_JS/architecture/index.md`, `$ART_JS/architecture/components.md` |
| `## contribute`   | Guide contributors.                         | Contribute section with links to repositories, guides, and license.          | `$ART_MD_WEB/README.md`, `$PROJECT/_records/repository.art`, `$ART_MD/_records/repository.art`, `$ART_MD/_records/license.art`               |

#### Commits:

| ID               | Repository / Checkout / Branch    | Policy       | Hash      | Status      |
| ---------------- | --------------------------------- | ------------ | --------- | ----------- |
| `add-about-page` | Artificials / `$PROJECT` / `main` | `AUTONOMOUS` | `1c71ae5` | `COMMITTED` |

##### Commit: `add-about-page`

**Repository:** Repository: Artificials

**Hash:** `1c71ae5`

**Status:** `COMMITTED`

**Message:**

```
feat(art-md-web): Add about page to Art MD website.
```

### Iteration: Add Site Header

**Id:** `add-site-header`

**Status:** `READY`

**Purpose:** Add a site header with navigation to the about page.

**Description:** Create separate home and page layouts; add a `SiteHeader` component in `src/components/site` with site title (links home), nav for pages (about), and icon-only links (GitHub, noodlestan.org). Include the header only on the about page via the page layout.

**Instructions:** `./plan-home-content-and-about-page/instructions/add-site-header.md`

**Changes:**

- Create `src/components/site/SiteHeader.astro` — site title linking to home, nav for pages (currently only "about"), icon-only links to GitHub and noodlestan.org.
- Create `src/layouts/PageLayout.astro` — page layout including `SiteHeader`.
- Keep `src/layouts/Layout.astro` as the home layout (no header).
- Update `src/pages/about.astro` to use `PageLayout`.

**Dependencies:**

- None.

#### Commits:

| ID                | Repository / Checkout / Branch    | Policy       | Hash  | Status     |
| ----------------- | --------------------------------- | ------------ | ----- | ---------- |
| `add-site-header` | Artificials / `$PROJECT` / `main` | `AUTONOMOUS` | (TBD) | `AUTHORED` |

##### Commit: `add-site-header`

**Repository:** Repository: Artificials

**Message:**

```
feat(art-md-web): Add site header with navigation.
```

---

## Work

### Next

Delegate the next `READY` instruction.

### Blockers

- None.

---

## Operating Instructions

### Setting Up

**Purpose:** Prepare the execution environment. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/setting-up/operation.art`.

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

**Purpose:** Confirms that the work item has been completed and satisfies its intended outcome. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/verifying-completion/operation.art`.

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
- **Home content added** — `src/pages/index.astro` shows hero + intro, about link, GitHub link, and demos placeholder (commit `ae32ab1`).
- **About page renders** — `/about` route shows the about page.
- **About page added** — `src/pages/about.astro` renders `intro`, `wip`, `architecture`, `contribute` sections (commit `1c71ae5`).
- **Site header renders** — `/about` shows the site header with nav; home page shows no header.

### Findings

- None.

### Decisions

- **Separate layouts** — Home uses the home layout (no header); about uses the page layout with the site header.
- **Icon-only links** — GitHub and noodlestan.org links in the header are icon-only.

### Knowledge to Update

None.

### Follow Ups

- Deploy the Art MD Website.

### Feedback

None.
