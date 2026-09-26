# Plan: Decompose Codec Demo

**ID:** `decompose-codec-demo`

**Status:** `DONE`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Break the home page codec demo into reusable components so a dedicated demo page can host a list of Art MD sources and the site can link to it.

**Description:** Decompose the codec demo into `TextArea` and `DemoPane` components with a themed input token, add a `codec-demo` page assembling the demo from a list of typed markdown sources with a dropdown switcher, and integrate the demo page in the site navigation, home page, and about page.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Describe the work-item changes through a series of iterations and commits with detailed instructions.

---

## Path Variables

| Variable      | Resolved Path                      | Purpose                                              |
| ------------- | ---------------------------------- | ---------------------------------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory                             |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`       | Domain resources directory                           |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout — changes land here     |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package — implementation target |

## Summary

Decompose the codec demo in the Art MD Website into reusable `TextArea` and `DemoPane` components driven by a new `--color-input-bg` root token, add a `codec-demo` page that assembles the demo from a list of typed markdown sources switched through a dropdown, and link the demo page from the home page, the about page, and the site navigation.

## Attachments

None.

## Context

### Upstream Work

| Kind        | Path                                                               | Role                                                                          |
| ----------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Milestone   | `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md` | Coordinates this plan as Phase 2 (`POC`) of the Art MD Hello World milestone. |
| Parking Lot | `$PROJECT/_backlog/_parking-lot.md`                                | Tracks short-term actionables, pending questions, and blockers.               |

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

## Scope

This plan decomposes the codec demo and adds a demo page to the Art MD Website package, changing only `$ART_MD_WEB`.

### (Scope) Application: Art MD Website

**Record:** `$ART_MD_WEB/_records/package.art`

**Role:** — Implementation target.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD_WEB/`

**Changes:**

- Decompose `CodeDemo` into `TextArea` and `DemoPane` components, styled from root tokens.
- Add the `--color-input-bg` root token for the default and dark colour schemes.
- Add a `codec-demo` page on `PageLayout` assembling the demo from a list of markdown source files.
- Link the demo page from the home page, the about page, and the site navigation.

**Dependencies:**

- None. `@art-md/codec` is already a published dependency of `$ART_MD_WEB`; `@art-md/codec@0.0.2` resolves and its `client:only="solid-js"` island constraint is unchanged.

## Execution Context

Execution is coordinated from `$WORKSPACE`. All changes happen in `$ART_MD_WEB` on branch `main`, committed to the Artificials repository at `$PROJECT`.

---

## Items:

| Iteration / Instructions                                                                                       | Status |
| -------------------------------------------------------------------------------------------------------------- | ------ |
| Iteration: Decompose Demo Components `./plan-decompose-codec-demo/instructions/decompose-demo-components.md`   | `DONE` |
| Iteration: Add Codec Demo Page `./plan-decompose-codec-demo/instructions/add-codec-demo-page.md`               | `DONE` |
| Iteration: Integrate Demo In Site Nav `./plan-decompose-codec-demo/instructions/integrate-demo-in-site-nav.md` | `DONE` |

### Commit: `decompose-codec-demo`

**Repository:** Repository: Artificials

**Hash:** `0e6fcfc`

**Status:** `COMMITTED`

**Message:**

```
build(art-md-web): Add codec demo page with source switcher and site navigation

- Add TextArea, DemoPane, and CodeDemo components.
- Add typed demo sources with multiple fixtures.
- Add /codec-demo route with dropdown source switching.
- Extract SiteNav and SiteLinks for shared navigation.
- Link demo page from home, about, and site header.
```

### Iteration: Decompose Demo Components

**Id:** `decompose-demo-components`

**Status:** `DONE`

**Purpose:** Make the codec demo's building blocks reusable and token-driven, so the demo page and later demos do not re-implement inputs and panes.

**Description:** Extract `TextArea` and `DemoPane` from the inline markup of `CodeDemo`, add the `--color-input-bg` root token for both colour schemes, move the demo fixture into a typed `sources.ts` module, and make `CodeDemo` a controlled component seeded from a `markdown` prop.

**Instructions:** `./plan-decompose-codec-demo/instructions/decompose-demo-components.md`

**Changes:**

- Add `src/components/demos/code/TextArea.tsx` and `TextArea.module.css` — a SolidJS textarea taking `value`, `ariaLabel`, `rows`, `readonly`, and an optional `onInput` callback. It renders the element and nothing else, so callers own layout and labelling.
- Style `TextArea` from root tokens: `background: var(--color-input-bg)`, `color: var(--color-content)`, `font-family: var(--type-code-family)`. Move the `min-height`, `padding`, and `resize` rules out of `CodeDemo.module.css` and into `TextArea.module.css`; they belong to the input, not the pane.
- Add `--color-input-bg: #eeeeee` to the `:root` block and `--color-input-bg: #111111` inside the existing `@media screen and (prefers-color-scheme: dark)` block of `src/styles/global.css`, alongside `--color-content` and `--color-page-bg`. Both schemes must declare the token — the dark block is nested in `:root`, so the value cascades either way.
- Add `src/components/demos/code/DemoPane.tsx` and `DemoPane.module.css` — a titled pane taking `title` and children, replacing the `CodeDemo--Pane` markup and its `> h2` rule.
- Add `src/components/demos/code/sources.ts` exporting `type DemoSource = { id: string; title: string; description: string; markdown: string }`, the existing hello-world fixture as `HOME_DEMO_SOURCE`, and a `DEMO_SOURCES` array holding that source alone. The list starts with one entry and grows in `add-codec-demo-page`.
- Change `CodeDemo` to a controlled component: accept a `markdown: string` prop, seed an internal `draft` signal from it, and re-seed the draft in a `createEffect` keyed on `props.markdown` so a changed prop resets the input while local edits do not write back to the prop. Keep the `createMemo` parse of `createArtCodec().parse(draft())` and the inline parse-failure message.
- Keep the parse error handling: malformed markdown renders a `Parse error: ...` string in the output pane rather than throwing and blanking the demo.
- Update `HomeDemo.astro` to import `HOME_DEMO_SOURCE` from `sources.ts` and pass `markdown={HOME_DEMO_SOURCE.markdown}` to `<CodeDemo client:only="solid-js" />`. The home page assembles a single markdown source.
- Keep `client:only="solid-js"` on every mount. The codec's published entry point is TypeScript source, so plain Node cannot import it (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`); only the Vite-transpiled browser bundle works.

**Dependencies:**

- None. Requires `$DOMAINS/plans/structures/iteration.art` conventions only; no other iteration must land first, but `add-codec-demo-page` depends on this one.

#### Commits:

| ID                          | Repository / Checkout / Branch    | Policy   | Hash | Status     |
| --------------------------- | --------------------------------- | -------- | ---- | ---------- |
| `decompose-demo-components` | Artificials / `$PROJECT` / `main` | `NOPUSH` | `-`  | `SQUASHED` |

### Iteration: Add Codec Demo Page

**Id:** `add-codec-demo-page`

**Status:** `DONE`

**Purpose:** Give the codec demo its own route with more than one Art MD source, so visitors can compare a set of samples instead of a single hard-coded fixture.

**Description:** Add a `codec-demo` page on `PageLayout`, a page-scoped `CodecDemo.astro`, and a `CodecDemo` island that renders a dropdown over `DEMO_SOURCES` and switches the demo on selection.

**Instructions:** `./plan-decompose-codec-demo/instructions/add-codec-demo-page.md`

**Changes:**

- Add `src/pages/codec-demo.astro` using `PageLayout`, and pass a `content` object with `title` and `description` — `SiteHead` destructures `Astro.props.content`, so an `.astro` page without it throws. Contribute no nested `main-section`; the layout already renders `<main class="main-section markdown">`.
- Add `src/components/pages/codec-demo/CodecDemo.astro` — a page-scoped wrapper following the `pages/home/` naming convention. It imports `DEMO_SOURCES` from `src/components/demos/code/sources.ts`, passes the array to the island as a prop (plain serialisable objects cross the Astro island boundary), and mounts `<CodecDemo client:only="solid-js" sources={DEMO_SOURCES} />`.
- Add `src/components/demos/code/CodecDemo.tsx` taking `sources: DemoSource[]`. It owns a `selectedId` signal initialised to the first source, a `<select>` listing every source `title`, and the selected source's `title` and `description` rendered above the demo.
- On selection change, `CodecDemo` recomputes the selected source and hands `selected.markdown` to `CodeDemo` as its `markdown` prop; the re-seed effect in `CodeDemo` then resets the input to that source's pristine value. User edits never write back into `DEMO_SOURCES` or the selected source, so switching away and back restores the pristine markdown.
- Guard the empty and unknown cases: with no sources, render a short message instead of a select, and an unknown `selectedId` falls back to the first source.
- Give the select an accessible label (`aria-label` or a visible `<label>`) and keep the two-pane layout and `--color-input-bg` input styling from `decompose-demo-components` unchanged.
- Grow `DEMO_SOURCES` to at least two entries in `sources.ts`, each with a terse `title`, a one-sentence `description`, and its own `markdown`. Keep `HOME_DEMO_SOURCE` as the home page's single source, independent of the list.
- Link the demo page from the home page, below the home page demo, at the end of `HomeDemo.astro` — not only in the `index.md` `## Learn more` list.

**Dependencies:**

- Iteration: Decompose Demo Components — `CodecDemo` composes `CodeDemo` and reads the `DemoSource` type introduced there.

#### Commits:

| ID                    | Repository / Checkout / Branch    | Policy   | Hash | Status     |
| --------------------- | --------------------------------- | -------- | ---- | ---------- |
| `add-codec-demo-page` | Artificials / `$PROJECT` / `main` | `NOPUSH` | `-`  | `SQUASHED` |

### Iteration: Integrate Demo In Site Nav

**Id:** `integrate-demo-in-site-nav`

**Status:** `DONE`

**Purpose:** Make the demo page reachable from every page, so it is navigable rather than a link buried under the home page demo.

**Description:** Extract `SiteNav` from `SiteHeader`, render it on the home page, and cross-link the demo page, the about page, and the home page in all directions.

**Instructions:** `./plan-decompose-codec-demo/instructions/integrate-demo-in-site-nav.md`

**Changes:**

- Extract the `<nav aria-label="Site pages">` block of `SiteHeader.astro` into `src/components/site/SiteNav.astro` with its styles, add a `Demo` link to `/codec-demo` after `About`, and render `<SiteNav />` from `SiteHeader.astro` so header pages are unchanged. One nav component, no duplicated link list.
- Render `<SiteNav />` in `HomeLayout.astro` under `HomeIntro` — the navbar only, not the whole `SiteHeader`, so the home page keeps its hero header and gains site navigation. `HomeLayout` renders neither `SiteHead` styling nor the `SiteHeader` gradient today, so do not swap the layouts.
- Link the demo page from `about.md`, in the `## Contribute` list next to the other site links.
- Link the about page from the demo page, in `CodecDemo.astro` under the island — the reverse of the existing home page `## Learn more` link.
- Add the demo page to the `index.md` `## Learn more` list as well, so the markdown body and the home page demo agree on the same routes.
- Keep every link a plain `href` to the route Astro emits from `src/pages/codec-demo.astro`; no client-side router is in use, and the site has no trailing-slash config.

**Dependencies:**

- Iteration: Add Codec Demo Page — the `/codec-demo` route and its page component must exist before they are linked.

#### Commits:

| ID                           | Repository / Checkout / Branch    | Policy   | Hash | Status     |
| ---------------------------- | --------------------------------- | -------- | ---- | ---------- |
| `integrate-demo-in-site-nav` | Artificials / `$PROJECT` / `main` | `NOPUSH` | `-`  | `SQUASHED` |

---

## Work

### Next

All iterations DONE.

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

**Instructions:** (From `$PROJECT/_guide.md`)

Run from the `$WORKSPACE` root — the build needs `@noodlestan/tsconfig` from the monorepo, not only the package:

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

- **Decompose style elements** — a separate milestone item; this plan only adds the `--color-input-bg` token the textarea needs.
- **Demo interactions POC** — a separate milestone item; no pointer or keyboard interactions beyond the select.
- **Integrate records in demo** — a separate milestone item (Phase 3).
- **Deployment** — deferred to follow-up plan.

### Evidence

- **Decomposition is reusable** — `TextArea` and `DemoPane` are separate modules with their own CSS modules, `CodeDemo` renders both twice, and no rule for the input lives in `CodeDemo.module.css`.
- **Input follows the colour scheme** — the textarea background resolves to `#eeeeee` by default and `#111111` under `prefers-color-scheme: dark`, verifiably by switching the OS scheme with the home page open.
- **Demo page switches sources** — `npm run build` emits `dist/codec-demo/index.html`; the page renders one `<select>` option per `DEMO_SOURCES` entry, and editing the input then switching demos restores that demo's pristine markdown.
- **Demo page is navigable** — the home page, the about page, and `SiteNav` each contain an `/codec-demo` link; the demo page links back to `/about`; the home page renders the same navbar as the other pages.

### Findings

- **The home page has no navigation at all** — `HomeLayout.astro` renders `HomeIntro` and `SiteFooter` but neither `SiteHeader` nor any `nav`, so the home page is the only page without a route link. This is why the navbar, not the header, is the fix.
- **Island props are serialisable plain data** — a `DemoSource[]` crosses the Astro island boundary as JSON, so the demo source list can live in a `.ts` module and be read by an `.astro` wrapper. No `define:vars` or serialisation shim is needed.
- **`CodeDemo` seeding is the reset mechanism** — a `createEffect` keyed on `props.markdown` gives "switching resets to pristine" without the parent owning the draft, and without writing user edits back into `DEMO_SOURCES`.
- **Layouts own page margins** — `PageLayout` and `HomeLayout` already render `<main class="main-section markdown">`; a page adding its own `main-section` doubles the margin, which shipped in `6762790` and was corrected in `404.astro`.
- **SolidJS needs `jsx` and `jsxImportSource` in `tsconfig.json`** — `astro/tsconfigs/strict` defaults to React-style JSX, so any new `.tsx` island must rely on the existing Solid JSX config rather than assume it.

### Decisions

- **One nav component, two render sites** — `SiteNav.astro` is extracted from `SiteHeader.astro` and rendered by both, rather than duplicating a link list per layout or adopting the header wholesale on the home page, which would replace the hero.
- **Sources are typed data in a module** — `sources.ts` with a `DemoSource` type, rather than one file per markdown sample or a JSON fixture directory: the payload is three short strings, the type keeps title/description/markdown in step, and it stays importable from both Astro and TSX.
- **Selection state lives in `CodecDemo`, draft state in `CodeDemo`** — the parent owns which demo is selected, the child owns what the user typed. A single component owning both would need the pristine source threaded back in to compute the reset.
- **The demo page is a route, not a section** — `/codec-demo` matches the milestone's "add codec-demo page" and keeps the home page demo as a single source rather than a second demo surface.

### Knowledge to Update

None.

### Follow Ups

- Plan: Decompose Style Elements.
- Plan: Demo Interactions POC.
- Plan: Integrate Records in Demo.

### Feedback

- None.
