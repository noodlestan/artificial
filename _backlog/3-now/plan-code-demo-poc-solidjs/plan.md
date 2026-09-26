# Plan: Code Demo POC (with SolidJS)

**ID:** `code-demo-poc-solidjs`

**Status:** `COMPLETE`

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

| Workflow / Path                                                                | Purpose                                                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Workflow: Planning Work `$DOMAINS/work/workflows/planning-work/workflow.art`   | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Workflow: Executing Work `$DOMAINS/work/workflows/executing-work/workflow.art` | Engineering lifecycle for setting up, verifying, and committing work.              |

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
- Build the code demo POC as a SolidJS island carried by the home page layout.
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

| Iteration / Instructions                                                                          | Status |
| ------------------------------------------------------------------------------------------------- | ------ |
| Iteration: Build Code Demo POC `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md` | `DONE` |
| Iteration: Add 404 Page `./plan-code-demo-poc-solidjs/instructions/add-404-page.md`               | `DONE` |

### Iteration: Build Code Demo POC

**Id:** `build-code-demo-poc`

**Status:** `DONE`

**Report:** `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc__report.md`

**Purpose:** Prove out a live, in-browser Art MD round trip by parsing user-authored markdown into an MDAST-derived AST with `@art-md/codec` inside a SolidJS island.

**Description:** Integrate SolidJS into the Astro app, depend on `@art-md/codec`, and add a two-pane demo island that parses markdown in the browser as the user types, carried by the home page layout.

**Instructions:** `./plan-code-demo-poc-solidjs/instructions/build-code-demo-poc.md`

**Changes:**

- Add `solid-js`, `@astrojs/solid-js`, and `@art-md/codec@^0.0.2` to `apps/art-md-web/package.json`, register the SolidJS integration in `astro.config.mjs`, and set `jsx: preserve` with `jsxImportSource: solid-js` in `tsconfig.json` so the island's TSX is compiled by the Solid integration rather than the Astro default.
- Build `CodeDemo` in `src/components/demos/code/` as a SolidJS island holding the markdown source in a signal, with a `createMemo` deriving the serialised parse output so the parse re-runs only when the source changes.
- Keep the island's styles in `CodeDemo.module.css` beside the component, keyed `CodeDemo` and `CodeDemo--Pane`.
- Mount the island through `HomeDemo.astro`, rendered by `HomeLayout` above the page slot, with `client:only="solid-js"`. Not `client:load` or `client:visible` — the package entry point is `./src/index.ts`, and Node refuses to strip types for files under `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so only the Vite-transpiled browser bundle can import it. `client:only` skips the server render entirely.
- Render two panes: an editable `textarea` seeded with the demo fixture below, and a `readonly` `textarea` showing `document` from `createArtCodec().parse()`.
- Surface codec parse failures inline instead of throwing, so malformed markdown does not blank the demo.
- Carry the demo on the home page rather than a dedicated route. `HomeLayout` owns the island, so `index.md` stays pure markdown — the site has no MDX integration and no content collection, and a `.md` page body cannot host a component.
- Name home-page components `HomeIntro` and `HomeDemo` under `src/components/pages/home/`, so the page-scoped namespace is explicit.
- Let the layout own page margins. `PageLayout` and `HomeLayout` already render `<main class="main-section markdown">`, so pages contribute no nested `main-section`.

**Dependencies:**

- None. `@art-md/codec@0.0.2` is published and its entry point resolves.

Demo fixture:

```
# Hello World

## Repository: Art MD

**Author:** Noodlestan Collective

**Remote:** `git@github.com:noodlestan/art-md.git `
```

#### Commits:

| ID                    | Repository / Checkout / Branch    | Policy   | Hash  | Status     |
| --------------------- | --------------------------------- | -------- | ----- | ---------- |
| `build-code-demo-poc` | Artificials / `$PROJECT` / `main` | `NOPUSH` | (TBD) | `AUTHORED` |

##### Commit: `build-code-demo-poc`

**Repository:** Repository: Artificials

**Hash:** `b07a071`

**Status:** `COMMITTED` — created, not pushed (NOPUSH).

**Message:**

```
build(art-md-web): Add SolidJS code demo parsing Art MD in the browser

- Integrate SolidJS and `@art-md/codec` into the Astro app.
- Add a `CodeDemo` island with its styles in a CSS module, parsing Art MD to a document AST as you type.
- Add demo on the home page through `HomeLayout`, and show parse failures inline.
- Configure Typescript with `jsxImportSource` for TSX compatibility with IDE.
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

Both iterations are `DONE`. Plan execution is complete; see `add-404-page__report.md` and `build-code-demo-poc__report.md`.

### Blockers

- None. The `art-md` packaging blocker is resolved — see `### Findings`.

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

- **Code demo renders** — DONE. The island is carried by the home page: `dist/index.html` contains an `astro-island` with `client="only"` and the `solid-js` renderer, and its props resolve the codec. Lint and pre-commit hooks green.
- **Amend delta reviewed** — the `/demo` route and the `index.md` `## Demos` link are gone; `Intro.astro` is now `HomeIntro.astro`; `CodeDemo` styles moved to `CodeDemo.module.css`; `tsconfig.json` carries the Solid JSX config. See the `## Review` section of `build-code-demo-poc__report.md`.
- **404 page renders** — DONE. `npm run build` reports `3 page(s) built` and `ls -l dist/404.html` returns 8 841 bytes; commit `6762790`, not pushed.

### Findings

- **The `art-md` packaging blocker is RESOLVED.** Adding `src` to `files` in all five packages and republishing fixed the unresolvable entry point. Verified against the registry: `@art-md/codec@0.0.2` installs, ships `src/index.ts`, and `require.resolve('@art-md/codec')` succeeds. Siblings are at `0.0.3`; codec at `0.0.2`. Because codec's dependency ranges are `*`, the demo will pull `0.0.3` of the four siblings alongside `codec@0.0.2`.
- **The published entry point is TypeScript source, so plain Node cannot load it** — verified: importing `@art-md/codec` in Node fails with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`, because type stripping is unsupported for files under `node_modules`. Bundler-based consumers are fine — Vite transpiles the source — so the Astro demo works, but any Node-side consumer (a CLI, a plain script, an SSR pass) would fail. This is what makes `client:only` mandatory for the island rather than merely preferable.
- **Codec API surface** — `createArtCodec(config?)` returns `{ parse, serialize }`. `parse` accepts a markdown string and returns a `ParseResult`; defaults come from `DEFAULT_CONSTRUCT_PARSER` and the `CONSTRUCT_PARSERS` / `CONSTRUCT_SERIALIZERS` registries, so a bare `createArtCodec()` is enough for the demo.
- **The site cannot host an island inside a markdown page** — there is no MDX integration and no `src/content` collection. `src/pages/index.md` and `about.md` are plain `.md` files using the `layout` frontmatter key, so their bodies render as markdown only.
- **Layouts require a `content` prop** — `SiteHead` destructures `Astro.props.content`, so an `.astro` page on `PageLayout` or `HomeLayout` throws without a `content` object carrying `title` and `description`.
- **Layouts already apply `main-section`** — `PageLayout` and `HomeLayout` both render `<main class="main-section markdown">`. A nested `main-section` doubles the page margin; this shipped in `6762790` because the `add-404-page` instructions required both, and is corrected in the amended `build-code-demo-poc` commit by dropping the wrapper from `404.astro` and moving the page's font sizing into a page-level `<style>`.
- **SolidJS needs a `jsxImportSource` in `tsconfig.json`** — `astro/tsconfigs/strict` defaults to React-style JSX. Without `jsx: preserve` and `jsxImportSource: solid-js`, the integration's Babel transform does not apply and the island renders nothing.
- **The site has no 404 page** — the CloudFront distribution declares `custom_error_response` for 404 pointing at `/404.html`, but Astro emits no such file, so unknown paths return S3's `application/xml` error body. Resolved by `6762790`.

### Decisions

- **SolidJS** — Code demo POC uses SolidJS.
- **In-browser parsing** — the demo parses with `createArtCodec` in the browser rather than pre-rendering, so the POC proves the codec runs client-side.
- **Home page carries the demo** — the island lives in `HomeDemo.astro` and `HomeLayout` renders it above the slot, so it appears on the first visit rather than behind a link. `index.md` stays pure markdown. The alternative — adopting MDX so islands embed directly in a `.md` body — is a larger change affecting every page and is out of scope for this POC. An earlier draft used a dedicated `/demo` route; the home page won because the demo is the site's headline proof, and a separate route asked the reader to already believe it.
- **Island styles in a CSS module** — `CodeDemo.module.css` beside the component, not an inline `<style>` block in the JSX. Astro scopes `<style>` per `.astro` file and does not hoist it for a Solid island, so an inline block rendered nothing reliably.
- **Page-scoped component names** — `HomeIntro` and `HomeDemo` rather than `Intro` and `CodeDemo` in `src/components/pages/home/`, so the home page's components are distinguishable from the site's reusable ones.

### Knowledge to Update

None.

### Follow Ups

- Decompose the codec demo.

### Feedback

- **Setting Up is missing the monorepo root install** — the build needs `@noodlestan/tsconfig` from `$PROJECT`, not just `$ART_MD_WEB`. Add `npm ci` at the monorepo root to future instructions.
- **Wrapper requirement is self-conflicting** — `PageLayout` already renders `<main class="main-section markdown">`, so requiring both the layout and a `main-section` section nests it and doubles the page margin. Corrected in `404.astro` during the `build-code-demo-poc` amend; future page instructions should say "contribute no `main-section`" and nothing more.
- **A `.tsx` island needs a TypeScript instruction** — the `build-code-demo-poc` instructions never mentioned `tsconfig.json`, so the island was authored without a Solid JSX config. State the `jsx` and `jsxImportSource` requirement wherever a plan introduces a SolidJS island.
- **Scope decisions outlive the draft that made them** — the "dedicated `/demo` route" decision was still in the plan after the demo moved to the home page. Re-read the Decisions section against the working tree at amend time, not just at delegation time.
- **`PageLayout` requires a `content` prop** — `SiteHead` destructures `Astro.props.content`; an `.astro` page without it throws. Name the prop in future page instructions.
