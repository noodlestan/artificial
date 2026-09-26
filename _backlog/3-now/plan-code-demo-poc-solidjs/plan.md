# Plan: Code Demo POC (with SolidJS)

**ID:** `code-demo-poc-solidjs`

**Status:** `WORKING`

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
| Iteration: Add 404 Page `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`               | `DONE`     |

### Iteration: Build Code Demo POC

**Id:** `build-code-demo-poc`

**Status:** `PLANNING`

**Purpose:** Prove out a live, in-browser Art MD round trip by parsing user-authored markdown into an MDAST-derived AST with `@art-md/codec` inside a SolidJS island.

**Description:** Integrate SolidJS into the Astro app, depend on `@art-md/codec`, and add a two-pane demo route that parses markdown in the browser as the user types.

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md`

**Changes:**

- Add `solid-js` and `@astrojs/solid-js` to `apps/art-md-web/package.json`, and register the integration in `astro.config.mjs`.
- Add `@art-md/codec` to `apps/art-md-web/package.json`.
- Add `src/pages/demo.astro` on `PageLayout`, passing a `content` object with `title` and `description` — the layouts destructure `Astro.props.content` and throw without it.
- Add a `CodeDemo` SolidJS component in `src/components/demos/code/` holding the markdown source in a signal.
- Mount the island with `client:only="solid-js"`. Do **not** use `client:load` or `client:visible`: the published codec bundle dereferences `document` at module-evaluation time, so Astro's build-time server render would throw `document is not defined`.
- Render two panes: an editable `textarea` for markdown, and a `readonly` `textarea` showing the serialised result of `createArtCodec().parse()`.
- Pre-populate the input with the demo fixture below.
- Surface codec parse failures inline instead of throwing, so malformed markdown does not blank the demo.
- Update the `## Demos` section in `src/pages/index.md` to link to `/demo`. The demo cannot be embedded in `index.md` itself — the site has no MDX integration and no content collections, so a `.md` page body cannot host a component.
- Do NOT add a `main-section` wrapper. `PageLayout` and `HomeLayout` already render `<main class="main-section markdown">`; a nested `main-section` applies the page margin twice.

**Dependencies:**

- **`@art-md/codec` must resolve before this iteration can run — currently it does not.** See the packaging blocker under `## Work` → `### Blockers`.

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

**Status:** `DONE`

**Purpose:** Add a 404 page so unknown routes render a styled page instead of the raw S3 XML error body.

**Description:** Create `src/pages/404.astro` using `PageLayout` so the Astro build emits `dist/404.html`, which the CloudFront `custom_error_response` in `$OPS/modules/static-website/cf-distribution` already points at.

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`

**Report:** `./plan-code-demo-poc-solidjs/instructions/add-404-page__report.md`

**Changes:**

- Create `src/pages/404.astro` using `PageLayout`, with a heading, a short explanation, and a link back to the home page.
- Apply the `main-section` layout classes so the page matches the design POC.
- Confirm `npm run build` emits `dist/404.html`; without it, CloudFront falls through to the S3 `application/xml` error body.

**Dependencies:**

- None.

#### Commits:

| ID             | Repository / Checkout / Branch    | Policy   | Hash      | Status      |
| -------------- | --------------------------------- | -------- | --------- | ----------- |
| `add-404-page` | Artificials / `$PROJECT` / `main` | `NOPUSH` | `6762790` | `COMMITTED` |

##### Commit: `add-404-page`

**Repository:** Repository: Artificials

**Hash:** `6762790`

**Status:** `COMMITTED` — created, not pushed (NOPUSH).

**Message:**

```
build(art-md-web): Add 404 page for unknown routes

- Create `src/pages/404.astro` on `PageLayout` so the build emits `dist/404.html`.
- Link back to the home page and match the design POC layout classes.
```

---

## Work

### Next

Iteration `add-404-page` is DONE. Iteration `build-code-demo-poc` is `PLANNING` and blocked on the `art-md` packaging fix; republish the five packages with a valid entry point, then write its instructions.

### Blockers

- **All five published `art-md` packages have a broken entry point — blocks iteration `build-code-demo-poc`.** Every `package.json` sets `"main": "./src/index.ts"`, but `files` publishes only `["dist", "LICENSE-MIT", "README.md"]`, so `src/` is absent from the tarball. The published `@art-md/codec@0.0.1` tarball contains only `dist/esm/index.js`, `LICENSE-MIT`, `package.json`, `README.md` — no `src/`, no `exports` map, and no type declarations. Installing and resolving fails with `MODULE_NOT_FOUND: Cannot find module '.../@art-md/codec/src/index.ts'`. The fix belongs to `$ART_MD`: point `main` (or add an `exports` map) at `dist/`, add a `types` entry, then republish all five packages. Affects `codec`, `parser`, `serializer`, `constructs`, and `primitives` identically.
- **The published codec bundle is browser-only at import time — constraint, not a blocker.** Importing `dist/esm/index.js` in Node throws `document is not defined` during module evaluation, with no call made. This is why the island must use `client:only="solid-js"`; recorded under `### Findings` and folded into the iteration `## Changes`.
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
- **404 page renders** — DONE. `npm run build` reports `3 page(s) built` and `ls -l dist/404.html` returns 8 841 bytes; commit `6762790`, not pushed.

### Findings

- **Publishing did not unblock the demo** — `@art-md/codec@0.0.1` is live on npm, and its siblings moved to `0.0.2`, but the entry point is unresolvable. Version numbers are irrelevant while `main` points outside the tarball.
- **Codec API surface** — `createArtCodec(config?)` returns `{ parse, serialize }`. `parse` accepts a markdown string and returns a `ParseResult`; defaults come from `DEFAULT_CONSTRUCT_PARSER` and the `CONSTRUCT_PARSERS` / `CONSTRUCT_SERIALIZERS` registries, so a bare `createArtCodec()` is enough for the demo.
- **Codec dependency ranges are `*`** — so the demo will pull `0.0.2` of the four siblings alongside `codec@0.0.1`. Functionally fine, but codec sits one release behind its siblings' version line.
- **The codec bundle dereferences `document` during module evaluation** — verified by importing the published `dist/esm/index.js` in Node and catching the throw with no call made. Astro islands rendered on the server would crash at build time; `client:only` avoids this.
- **The site cannot host an island inside a markdown page** — there is no MDX integration and no `src/content` collection. `src/pages/index.md` and `about.md` are plain `.md` files using the `layout` frontmatter key, so their bodies render as markdown only.
- **Layouts require a `content` prop** — `SiteHead` destructures `Astro.props.content`, so an `.astro` page on `PageLayout` or `HomeLayout` throws without a `content` object carrying `title` and `description`.
- **Layouts already apply `main-section`** — `PageLayout` and `HomeLayout` both render `<main class="main-section markdown">`. A nested `main-section` doubles the page margin; this shipped in `6762790` because the `add-404-page` instructions required both.
- **The site has no 404 page** — the CloudFront distribution declares `custom_error_response` for 404 pointing at `/404.html`, but Astro emits no such file, so unknown paths return S3's `application/xml` error body.

### Decisions

- **SolidJS** — Code demo POC uses SolidJS.
- **In-browser parsing** — the demo parses with `createArtCodec` in the browser rather than pre-rendering, so the POC proves the codec runs client-side.
- **Dedicated `/demo` route** — the island lives on `src/pages/demo.astro` and `index.md` links to it, rather than converting the site to MDX. Keeps markdown authoring for prose and adds one dependency-free route. The alternative — adopting MDX so islands embed directly in `index.md` — is a larger change affecting every page and is out of scope for this POC.

### Knowledge to Update

None.

### Follow Ups

- Decompose the codec demo.

### Feedback

- **Setting Up is missing the monorepo root install** — the build needs `@noodlestan/tsconfig` from `$PROJECT`, not just `$ART_MD_WEB`. Add `npm ci` at the monorepo root to future instructions.
- **Wrapper requirement is self-conflicting** — `PageLayout` already renders `<main class="main-section markdown">`, so requiring both the layout and a `main-section` section nests it and doubles the page margin.
- **`PageLayout` requires a `content` prop** — `SiteHead` destructures `Astro.props.content`; an `.astro` page without it throws. Name the prop in future page instructions.
