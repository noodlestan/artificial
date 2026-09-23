# Plan: Scaffold Art MD Website

**Id:** `scaffold-art-md-website`

**Status:** `DONE`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Create the Art MD Website Astro package with guide, records, README, package config, Astro dependencies, config files, and WIP content.

**Description:** New `apps/art-md-web` package in the Artificials repo, copied from the Noodlestan Web website and renamed to Art MD. Includes `_guide.md`, `_records/`, `README.md`, `package.json`, Astro deps, config files, and WIP content.

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

Scaffold the Art MD Website Astro package in the Artificials repo with guide, records, README, package config, Astro dependencies, config files, and WIP content, so the site can be built and deployed.

## Attachments

None.

## Context

### Upstream Work

| Kind        | Path                                | Role                                                            |
| ----------- | ----------------------------------- | --------------------------------------------------------------- |
| Parking Lot | `$PROJECT/_backlog/_parking-lot.md` | Tracks short-term actionables, pending questions, and blockers. |

### Required Skills

- `write-plan` — Generates plans from sources and context. Required for Contextualizing, Drafting, Refining.
- `render-template` — Renders plan and instruction artefacts. Required for Drafting, Refining.

### Domains

| Domain / Path                                       | Description                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Domain: Plans `$DOMAINS/plans/index.md`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Domain: Deployments `$DOMAINS/deployments/index.md` | Deployment lifecycle for pre-deploy, deploy, and post-deploy stages.               |

### Resource Kinds in Scope

| Kind        | Domain       | Structure Record Path                             |
| ----------- | ------------ | ------------------------------------------------- |
| Project     | Projects     | `$DOMAINS/projects/structures/project.art`        |
| Repository  | Repositories | `$DOMAINS/repositories/structures/repository.art` |
| Application | Applications | — WIP                                             |

### Workflows

| Workflow / Path                                                        | Purpose                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Workflow: Planning `$DOMAINS/plans/workflows/planning.art`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Workflow: Engineering `$DOMAINS/engineering/workflows/engineering.art` | Engineering lifecycle for setting up, verifying, and committing work.              |
| Workflow: Deploying `$DOMAINS/deployments/workflows/deploying.art`     | Deployment lifecycle for pre-deploy, deploy, and post-deploy stages.               |

### Knowledge

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan record fields and statuses. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/plans/structures/iteration.art` (Structure) — Defines iteration as a container for changes and instructions. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/commits/types/commit.art` (Type) — Defines planned commit blueprints. Relevant for stages Drafting, Refining.

::READ `$WORKSPACE/_guide.md` (Guide) — Defines workspace operations and verification. Relevant for stages Setting up, Verifying, Committing.

::READ `$PROJECT/_guide.md` (Guide) — Defines the Artificials project operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD_WEB/_guide.md` (Guide) — Defines the Art MD Website package operations. Relevant for stages Setting up, Verifying.

::READ `$ART_MD_WEB/README.md` (Readme) — Package readme. Relevant for stages Setting up.

## Scope

This plan scaffolds the Art MD Website Astro package in the Artificials repo, renamed from the Noodlestan Web website copy.

### (Scope) Project: Artificials

**Record:** `$PROJECT/_records/project.art`

**Role:** — Existing — hosts the Art MD Website package.

**Partial:**

- `owner` — Project Management
- `path` — `$PROJECT/`

**Changes:**

- Add `apps/art-md-web` package.

### (Scope) Repository: Artificials

**Record:** `$PROJECT/_records/repository.art`

**Role:** — Existing — hosts the Art MD Website package.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$PROJECT/`

**Changes:**

- Add `apps/art-md-web` package.

### (Scope) Application: Art MD Website

**Record:** `$ART_MD_WEB/_records/package.art`

**Role:** — New — the Art MD website, built with Astro.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD_WEB/`

**Changes:**

- Create `_guide.md` — package guide.
- Create `_records/` — package, deployment, environment, and infrastructure records.
- Create `README.md` — package readme.
- Create `package.json` — package config matching the record (`apps-art-md-web`).
- Add Astro dependency.
- Create config files — `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.vscode/`.
- Add WIP content — `src/pages/index.astro` (h1 + WIP), `src/layouts/Layout.astro`.

**Dependencies:**

- None.

## Execution Context

Execution is coordinated from `$WORKSPACE`. The package scaffold happens in `$ART_MD_WEB` on branch `main`.

---

## Items:

| Iteration / Instructions                                                                                  | Status |
| --------------------------------------------------------------------------------------------------------- | ------ |
| Iteration: Scaffold Art MD Website `plan-scaffold-art-md-website/instructions/scaffold-art-md-website.md` | `DONE` |

### Iteration: Scaffold Art MD Website

**Id:** `scaffold-art-md-website`

**Status:** `DONE`

**Purpose:** Create the Art MD Website Astro package with guide, records, README, package config, Astro deps, config files, and WIP content.

**Description:** Copy the app from the Noodlestan Web website, rename to Art MD, add WIP content, and set up records.

**Instructions:** `./plan-scaffold-art-md-website/instructions/scaffold-art-md-website.md`

**Changes:**

- Create `_guide.md` — package guide.
- Create `_records/` — package, deployment, environment, and infrastructure records.
- Create `README.md` — package readme.
- Create `package.json` — package config matching the record (`apps-art-md-web`).
- Add Astro dependency.
- Create config files — `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.vscode/`.
- Add WIP content — `src/pages/index.astro` (h1 + WIP), `src/layouts/Layout.astro`.

**Dependencies:**

- None.

#### Commits:

| ID                        | Repository / Checkout / Branch    | Policy       | Hash      | Status      |
| ------------------------- | --------------------------------- | ------------ | --------- | ----------- |
| `scaffold-art-md-website` | Artificials / `$PROJECT` / `main` | `AUTONOMOUS` | `3704084` | `COMMITTED` |

##### Commit: `scaffold-art-md-website`

**Repository:** Repository: Artificials

**Message:**

```
scaffold(art-md-web): Create package with hello world Astro site.
```

---

## Work

### Next

Commit the scaffolded Art MD Website package.

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

- **Real content** — Deferred to follow-up plan.
- **Deployment** — Infrastructure and deploy deferred to follow-up plan.

### Evidence

- **WIP page renders** — `npm run build` succeeds and `src/pages/index.astro` shows the Art MD h1 and WIP content.

### Findings

- **Copied from Noodlestan Web** — The app was copied from the Noodlestan Web website and renamed to Art MD.

### Decisions

- **Rename to Art MD** — Package renamed to `apps-art-md-web`; guide, records, README, and content reference Art MD.
- **Keep domain** — Deployment domain remains `noodlestan.org`.

### Knowledge to Update

None.

### Follow Ups

- Add real content to the Art MD Website.
- Set up deployment.

### Feedback

None.
