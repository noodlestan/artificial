# Instructions: `build-code-demo-poc`

**Plan:** `code-demo-poc-solidjs`

**Iteration Id:** `build-code-demo-poc`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-code-demo-poc-solidjs/instructions/build-code-demo-poc__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `build-code-demo-poc`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

## Path Variables

| Variable      | Resolved Path                          | Purpose                                             |
| ------------- | -------------------------------------- | --------------------------------------------------- |
| `$WORKSPACE`  | Current working directory              | Workspace root directory                            |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials`     | Artificials project checkout                        |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`             | Art MD Website Astro package                        |
| `$ART_JS`     | `$WORKSPACE/checkouts/art-js-planning` | Art JS project, observed for TypeScript conventions |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instructions file is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is mandatory.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `build-code-demo-poc`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Prove out a live, in-browser Art MD round trip: a SolidJS island that parses markdown into an AST with `@art-md/codec` as the user types.

This iteration is the deliverable that justifies the whole plan — the code demo POC the Art MD Website home page currently advertises but does not have.

The demo is carried by the home page layout, not by a dedicated route: the reader sees the round trip on first visit rather than having to follow a link to believe it.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations and layout.
- `$ART_MD_WEB/README.md` (Readme) — package readme.
- `$ART_MD_WEB/src/layouts/PageLayout.astro` (Reference) — the layout the demo route must use, and the `content` prop it requires.
- `$ART_MD_WEB/src/pages/404.astro` (Reference) — a working `.astro` page on `PageLayout`; copy its `content` prop pattern and its page-level `<style>`.
- `$ART_MD_WEB/src/layouts/HomeLayout.astro` (Reference) — the layout that carries the island, and the `main.main-section` it already renders.
- `$ART_MD_WEB/tsconfig.json` (Reference) — the Solid JSX configuration the island depends on.
- `$ART_MD_WEB/src/pages/index.md` (Reference) — the home page body. It stays pure markdown; do not add a link to the demo, because the layout renders it.
- `$ART_JS/_guide.md` (Guide) — TypeScript conventions for the `.tsx` component.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

---

## Operating Instructions

### Setting Up

**Purpose:** Prepare the execution environment. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/setting-up/operation.art`.

**Instructions:**

Run `npm ci` at the monorepo root. This is required — the Astro build cannot start without `@noodlestan/tsconfig`, which is a devDependency of the monorepo root only. Running it in `$ART_MD_WEB` alone fails with `Tsconfig not found @noodlestan/tsconfig/workspace/tsconfig.json`.

```bash
cd $PROJECT
npm ci
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

## Changes

- Step 1 / 5 — Add SolidJS and codec dependencies, and the Solid JSX config
- Step 2 / 5 — Create the `CodeDemo` island and its CSS module
- Step 3 / 5 — Carry the island from the home page layout
- Step 4 / 5 — Verify the build
- Step 5 / 5 — Commit `build-code-demo-poc`

## Steps

### Step `1 / 5` — Add SolidJS and Codec Dependencies

In `$ART_MD_WEB/package.json`, add to `dependencies`:

- `solid-js`
- `@astrojs/solid-js`
- `@art-md/codec` at `^0.0.2`

Then register the integration in `$ART_MD_WEB/astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';

export default defineConfig({
  integrations: [solid()],
});
```

Then set the Solid JSX config in `$ART_MD_WEB/tsconfig.json`. `astro/tsconfigs/strict` defaults to React-style JSX, so without these two options the integration's Babel transform does not apply and the island renders nothing:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Then run `npm install` from the `$PROJECT` root so the lockfile picks up the new packages.

### Step `2 / 5` — Create the CodeDemo Island

Create `$ART_MD_WEB/src/components/demos/code/CodeDemo.tsx`.

Use SolidJS primitives — `createSignal` for the markdown source, and a `createMemo` for the derived parse output so the parse only re-runs when the source changes.

Construct the codec once, at module scope, not inside the component:

```tsx
import { createMemo, createSignal } from 'solid-js';
import { createArtCodec } from '@art-md/codec';

const codec = createArtCodec();
```

`createArtCodec()` needs no arguments — the parser and serializer defaults come from the `CONSTRUCT_PARSERS` and `CONSTRUCT_SERIALIZERS` registries.

**Serialise `result.document`, not the whole result.** `parse()` returns a `ParseResult`, which is `{ document, context }`. Only `document` is plain data; `context` may hold values that do not serialise cleanly. So:

```tsx
const output = createMemo(() => {
  try {
    const { document } = codec.parse(source());
    return JSON.stringify(document, null, 2);
  } catch (error) {
    return `Parse error: ${error instanceof Error ? error.message : String(error)}`;
  }
});
```

Catching and rendering the message inline is deliberate: malformed markdown must not blank the demo.

Render two panes inside the returned JSX:

- An editable `<textarea>` bound to `source()` via `onInput`, seeded with the demo fixture below.
- A `readonly` `<textarea>` showing `output()`.

Put the island's styles in `$ART_MD_WEB/src/components/demos/code/CodeDemo.module.css`, keyed `CodeDemo` and `CodeDemo--Pane`, and apply them with `styles['CodeDemo']` and `styles['CodeDemo--Pane']`. Do **not** use an inline `<style>` block in the JSX: Astro scopes `<style>` per `.astro` file and does not hoist it for a Solid island, so it renders unreliably. The module should express the two-pane grid and reuse the site's existing CSS custom properties:

```css
.CodeDemo {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
}

.CodeDemo--Pane {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

### Step `3 / 5` — Carry the Island from the Home Page Layout

Create `$ART_MD_WEB/src/components/pages/home/HomeDemo.astro`. It holds the copy and mounts the island:

```astro
---
import CodeDemo from '../../demos/code/CodeDemo';
---

<h1>Codec demo</h1>
<p>Type Art MD on the first textarea.</p>
<p>The <code>@art-md/codec</code> parses it into Art AST on the second.</p>
<CodeDemo client:only="solid-js" />
```

`client:only` is mandatory, not a style preference. The `@art-md/codec` entry point is TypeScript source, and Node refuses to strip types for files under `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`). Any Astro server render would fail to load the module. `client:only` skips the server render; the browser bundle is built by Vite, which transpiles the source.

Then render it from `$ART_MD_WEB/src/layouts/HomeLayout.astro`, above the slot so the demo leads the page:

```astro
import HomeIntro from '../components/pages/home/HomeIntro.astro';
import HomeDemo from '../components/pages/home/HomeDemo.astro';
```

```astro
  <body>
    <HomeIntro />
    <main class="main-section markdown">
      <HomeDemo />
      <slot />
    </main>
    <SiteFooter />
  </body>
```

Rename `$ART_MD_WEB/src/components/pages/home/Intro.astro` to `HomeIntro.astro` and update the import. Page-scoped components carry a `Home` prefix, so they are distinguishable from the site's reusable ones.

Do NOT add a `main-section` wrapper anywhere. `PageLayout` and `HomeLayout` already render `<main class="main-section markdown">`; a nested `main-section` applies the page margin twice. While you are here, drop the `<section class="main-section">` wrapper from `$ART_MD_WEB/src/pages/404.astro` for the same reason, and move that page's font sizing into a page-level `<style>` block.

Do NOT add a `## Demos` link to `$ART_MD_WEB/src/pages/index.md`, and do not try to embed the component there. The site has no MDX integration and no content collection, so a `.md` page body cannot host a component — the layout is what carries the island.

### Step `4 / 5` — Verify the Build

Run from the `$ART_MD_WEB` root:

```bash
npm run lint:fix
npm run lint
npm run build
```

Expected outcome: the build reports `3 page(s) built`, listing `/404.html`, `/about/index.html`, and `/index.html`.

If the build fails with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` or `document is not defined`, the island is not using `client:only="solid-js"`. Fix the directive and rebuild.

Confirm `dist/index.html` exists on disk and that it contains the `astro-island` element carrying the `client-only` directive and `solid-js` as its renderer value. Do not proceed to the commit step if the build fails.

Note: this step verifies the build artefact only. Do not run `aws s3 sync` in this iteration.

### Step `5 / 5` — Commit `build-code-demo-poc`

---

#### Commit: `build-code-demo-poc`

**Policy:** NOPUSH — Agent MUST create the commit and proceed to the next step but MUST NOT push to the remote repository.

**Message:**

```
build(art-md-web): Add SolidJS code demo parsing Art MD in the browser

- Integrate SolidJS and `@art-md/codec` into the Astro app.
- Add a `CodeDemo` island with its styles in a CSS module, parsing Art MD to a document AST as you type.
- Add demo on the home page through `HomeLayout`, and show parse failures inline.
- Configure Typescript with `jsxImportSource` for TSX compatibility with IDE.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that the commit was created and **not** pushed, per the `NOPUSH` policy.
- Verify that `solid-js`, `@astrojs/solid-js`, and `@art-md/codec` are in `apps/art-md-web/package.json`, that `astro.config.mjs` registers the SolidJS integration, and that `tsconfig.json` sets `jsx: preserve` with `jsxImportSource: solid-js`.
- Verify that `src/components/demos/code/CodeDemo.tsx` constructs the codec at module scope and serialises `result.document` only, and that its styles live in `CodeDemo.module.css` rather than an inline `<style>` block.
- Verify that `src/components/pages/home/HomeDemo.astro` mounts the island with `client:only="solid-js"` and that `HomeLayout` renders it above the slot.
- Verify that `src/components/pages/home/Intro.astro` is now `HomeIntro.astro` and its import in `HomeLayout` is updated.
- Verify that no page nests a `main-section` inside the layout's own `main.main-section`, including `404.astro`.
- Verify that `src/pages/index.md` is unchanged by this iteration and contains no `## Demos` link, and that `src/pages/demo.astro` does not exist.
- Verify that the build reports `3 page(s) built` and that `dist/index.html` carries the `astro-island` with `client="only"`.
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.

## Demo Fixture

Seed the `CodeDemo` textarea with this markdown verbatim:

```md
# Hello World

## Repository: Art MD

**Author:** Noodlestan Collective

**Remote:** `git@github.com:noodlestan/art-md.git `
```
