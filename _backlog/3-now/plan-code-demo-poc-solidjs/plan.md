# Plan: Code Demo POC (with SolidJS)

**ID:** `code-demo-poc-solidjs`

**Status:** `PLANNING`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Prove out a code demo using SolidJS.

**Description:** Build a code demo POC with SolidJS in the Art MD Website Astro package and add a 404 page.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Describe the work-item changes through a series of iterations and commits with detailed instructions.

---

## Path Variables

| Variable      | Resolved Path                          | Purpose                                            |
| ------------- | -------------------------------------- | -------------------------------------------------- |
| `$WORKSPACE`  | Current working directory              | Workspace root directory                           |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`           | Domain resources directory                         |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials`     | Artificials project checkout                       |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`             | Art MD Website Astro package                       |
| `$ART_MD`     | `$WORKSPACE/checkouts/art-md-planning` | Art MD project checkout — provides `@art-md/codec` |
| `$ART_JS`     | `$WORKSPACE/checkouts/art-js-planning` | Art JS project checkout — observe progress         |

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
- Add `@art-md/codec` dependency.
- Build a code demo POC page.
- Add a 404 page.

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

| Iteration / Instructions                                                                          | Status     |
| ------------------------------------------------------------------------------------------------- | ---------- |
| Iteration: Build Code Demo POC `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md` | `PLANNING` |
| Iteration: Add 404 Page `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`               | `READY`    |

### Iteration: Build Code Demo POC

**Id:** `build-code-demo-poc`

**Status:** `PLANNING`

**Purpose:** Prove out a live, in-browser Art MD round trip by parsing user-authored markdown into an MDAST-derived AST with `@art-md/codec` inside a SolidJS island.

**Description:** Integrate SolidJS into the Astro app, depend on `@art-md/codec`, and replace the Demos placeholder on the home page with a two-pane demo that parses markdown as the user types.

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md`

**Changes:**

- Add `solid-js` and the Astro SolidJS integration (`@astrojs/solid-js`) to `apps/art-md-web/package.json`, and register the integration in `astro.config.mjs`.
- Add `@art-md/codec` to `apps/art-md-web/package.json`.
- Add a `CodeDemo` SolidJS component in `src/components/demos/code/` holding the markdown source in a signal.
- Render two panes: an editable `textarea` for markdown, and a `readonly` `textarea` showing the serialised AST from `createArtCodec().parse()`.
- Pre-populate the input with the demo fixture below.
- Replace the `Demos` placeholder section in `src/pages/index.md` with the `CodeDemo` component, keeping the `main-section` layout classes.
- Surface codec parse failures inline instead of throwing, so malformed markdown does not blank the demo.

**Dependencies:**

- None.

Demo fixture:

```
# Hello World

## Repository: Art MD

**Author:** Noodlestan Collective

**Remote:** `git@github.com:noodlestan/art-md.git `
```

#### Commits:

| ID                    | Repository / Checkout / Branch    | Policy       | Hash  | Status     |
| --------------------- | --------------------------------- | ------------ | ----- | ---------- |
| `build-code-demo-poc` | Artificials / `$PROJECT` / `main` | `AUTONOMOUS` | (TBD) | `AUTHORED` |

##### Commit: `build-code-demo-poc`

**Repository:** Repository: Artificials

**Hash:** (TBD)

**Status:** `AUTHORED`

**Message:**

```
build(art-md-web): Add SolidJS code demo parsing Art MD in the browser

- Integrate SolidJS into the Astro app and depend on `@art-md/codec`.
- Replace the Demos placeholder with a two-pane markdown-to-AST demo.
- Show codec parse failures inline rather than throwing.
```

### Iteration: Add 404 Page

**Id:** `add-404-page`

**Status:** `READY`

**Purpose:** Add a 404 page so unknown routes render a styled page instead of the raw S3 XML error body.

**Description:** Create `src/pages/404.astro` using `PageLayout` so the Astro build emits `dist/404.html`, which the CloudFront `custom_error_response` in `$OPS/modules/static-website/cf-distribution` already points at.

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`

**Changes:**

- Create `src/pages/404.astro` using `PageLayout`, with a heading, a short explanation, and a link back to the home page.
- Apply the `main-section` layout classes so the page matches the design POC.
- Confirm `npm run build` emits `dist/404.html`; without it, CloudFront falls through to the S3 `application/xml` error body.

**Dependencies:**

- None.

#### Commits:

| ID             | Repository / Checkout / Branch    | Policy   | Hash  | Status     |
| -------------- | --------------------------------- | -------- | ----- | ---------- |
| `add-404-page` | Artificials / `$PROJECT` / `main` | `NOPUSH` | (TBD) | `AUTHORED` |

##### Commit: `add-404-page`

**Repository:** Repository: Artificials

**Hash:** (TBD)

**Status:** `AUTHORED`

**Message:**

```
build(art-md-web): Add 404 page for unknown routes

- Create `src/pages/404.astro` on `PageLayout` so the build emits `dist/404.html`.
- Link back to the home page and match the design POC layout classes.
```

---

## Work

### Next

Delegate `add-404-page`, which is `READY`. Resolve the `@art-md/codec` publish blocker, then write instructions for `build-code-demo-poc`.

### Blockers

- **`@art-md/codec` is unpublished** — `npm view @art-md/codec` returns 404, so iteration `build-code-demo-poc` cannot install it. Its siblings `@art-md/parser`, `@art-md/serializer`, `@art-md/constructs`, and `@art-md/primitives` are all published at `0.0.1`. Either publish `$ART_MD/libs/codec` first, or link it locally with `npm run art-work link` from the `$WORKSPACE` root. Blocks iteration `build-code-demo-poc`.
- **`$ART_JS` path variable was wrong** — resolved to `checkouts/art-js`, which does not exist. Corrected to `checkouts/art-js-planning`. Now resolved.

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
- **404 page renders** — `npm run build` emits `dist/404.html`.

### Findings

- **`@art-md/codec` is not on the registry** — every other `art-md` library is published at `0.0.1`, but codec returns 404. Its `package.json` sets `private: false` and `publishConfig.access: public`, so it is publishable and simply has not been released.
- **Codec API surface** — `@art-md/codec` exports only `createArtCodec` plus the `ArtCodecConfig` and `PartialArtCodecConfig` types; the demo must construct a codec rather than import a bare `parse` function.
- **Codec dependency ranges are `*`** — `@art-md/codec` depends on `@art-md/primitives`, `constructs`, `parser`, and `serializer` at `*`, all of which resolve from the registry today.
- **The site has no 404 page** — the CloudFront distribution declares `custom_error_response` for 404 pointing at `/404.html`, but Astro emits no such file, so unknown paths return S3's `application/xml` error body.

### Decisions

- **SolidJS** — Code demo POC uses SolidJS.
- **In-browser parsing** — the demo parses with `createArtCodec` in the browser rather than pre-rendering, so the POC proves the codec runs client-side.

### Knowledge to Update

None.

### Follow Ups

- Decompose the codec demo.

### Feedback

None.
