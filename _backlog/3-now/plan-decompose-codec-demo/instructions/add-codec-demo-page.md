# Instructions: `add-codec-demo-page`

**Plan:** `decompose-codec-demo`

**Iteration Id:** `add-codec-demo-page`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-decompose-codec-demo/instructions/add-codec-demo-page__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `add-codec-demo-page`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

## Path Variables

| Variable      | Resolved Path                      | Purpose                          |
| ------------- | ---------------------------------- | -------------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory         |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Repository the commit lands in   |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Astro package under modification |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instructions file is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is mandatory.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `add-codec-demo-page`, created `{artefacts}`, thumbs up). If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Give the codec demo its own route and more than one sample, so a visitor can compare Art MD documents instead of editing a single hard-coded fixture.

The page is a list of named sources switched through a dropdown. Two behaviours are the whole point and are what a reviewer will check by hand:

1. **Edits are local.** Typing in the input changes what is parsed and shown, and changes nothing else.
2. **Switching resets.** Choosing a different demo restores that demo's pristine markdown, so returning to a demo discards the previous edit.

The home page keeps its single source. Do not turn the home page demo into a second demo surface.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations and layout.
- `$ART_MD_WEB/src/layouts/PageLayout.astro` (Reference) — the layout this page must use, and the `content` prop it requires.
- `$ART_MD_WEB/src/pages/404.astro` (Reference) — a working `.astro` page on `PageLayout`; copy its `content` prop pattern.
- `$ART_MD_WEB/src/layouts/components/SiteHead.astro` (Reference) — destructures `Astro.props.content`; a page without it throws.
- `$ART_MD_WEB/src/components/demos/code/sources.ts` (Reference) — the `DemoSource` type, `HOME_DEMO_SOURCE`, and the `DEMO_SOURCES` list you extend.
- `$ART_MD_WEB/src/components/demos/code/CodeDemo.tsx` (Reference) — the controlled island you compose; note how it re-seeds its draft from the `markdown` prop.
- `$ART_MD_WEB/src/components/demos/code/DemoPane.tsx` (Reference) — the titled pane from the previous iteration.
- `$ART_MD_WEB/src/components/pages/home/HomeDemo.astro` (Reference) — the mount pattern for an island, and the place you add the link to the new page.
- `$ART_MD_WEB/src/components/pages/home/HomeIntro.astro` (Reference) — the `pages/<page>/` naming convention for page-scoped components.
- `$ART_MD_WEB/tsconfig.json` (Reference) — the Solid JSX configuration the new `.tsx` island depends on.

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

- Step 1 / 5 — Grow `DEMO_SOURCES` with a second demo source
- Step 2 / 5 — Create the `CodecDemo` island with the dropdown
- Step 3 / 5 — Create the `CodecDemo.astro` wrapper and the `codec-demo` page
- Step 4 / 5 — Link the demo page from the home page
- Step 5 / 5 — Commit `add-codec-demo-page`

## Steps

### Step `1 / 5` — Grow the Demo Source List

In `$ART_MD_WEB/src/components/demos/code/sources.ts`, append at least one further entry to `DEMO_SOURCES`, so the list has two or more entries and the dropdown is meaningful.

Each entry needs all four fields of `DemoSource`: a stable kebab-case `id`, a **terse** `title` (a few words — it becomes a dropdown option), a one-sentence `description`, and its own `markdown`. Vary the markdown so the selection is visibly meaningful: a second document exercising a different shape is more useful than a near-duplicate of the first.

Keep `HOME_DEMO_SOURCE` exactly as it is and keep it independent of the list — the home page reads that constant directly, so appending to `DEMO_SOURCES` must not change what the home page shows.

Do not turn `DEMO_SOURCES` into a file-per-sample directory or a JSON fixture. It stays a typed array in one module: the payload is three short strings, the type keeps the fields in step, and both `.astro` and `.tsx` can import it.

### Step `2 / 5` — Create the CodecDemo Island

Create `$ART_MD_WEB/src/components/demos/code/CodecDemo.tsx`.

It takes one prop, `sources: DemoSource[]`, and owns **selection** state. The draft state stays in `CodeDemo`.

```tsx
import { createMemo, createSignal, For, Show } from 'solid-js';
import CodeDemo from './CodeDemo';
import type { DemoSource } from './sources';

export default function CodecDemo(props: { sources: DemoSource[] }) {
  const [selectedId, setSelectedId] = createSignal(props.sources[0]?.id);

  const selected = createMemo<DemoSource | undefined>(() => {
    return props.sources.find(source => source.id === selectedId()) ?? props.sources[0];
  });
  // ...
}
```

Render, in order:

1. A `<select>` with one `<option>` per source, keyed by `id`, each showing `title`. Give it an accessible name — either `aria-label="Demo"` or a visible `<label>`.
2. The selected source's `title` and `description`, so the reader knows what they are looking at before reading the panes.
3. `<CodeDemo markdown={selected()?.markdown ?? ''} client-agnostic />` — in JSX, just `<CodeDemo markdown={...} />`.

The select's `onChange` calls `setSelectedId(newValue)`. Do **not** pass a controlled `value` bound to a separate signal and do not store edits anywhere shared — the select's value is `selectedId`, and nothing else.

**Switching resets to pristine** falls out of the composition: selecting a different source changes the `markdown` prop passed to `CodeDemo`, whose `createEffect` re-seeds its draft. You do not need to reset anything in `CodecDemo`. Because `CodeDemo` never writes the draft back to the prop, `sources` is never mutated — so switching away and back restores the original markdown.

Guard the two degenerate cases:

- **No sources** — render a short message such as "No demos are available." and do not render the select or the island.
- **Unknown `selectedId`** — the `?? props.sources[0]` fallback above already handles it; do not render an empty pane.

Do not add `client:only` inside this `.tsx` file. The directive belongs on the Astro mount in Step 3 — the same `client:only="solid-js"` reason applies: `@art-md/codec` ships TypeScript source and Node cannot strip types under `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so a server render of the island fails to load the codec.

Keep the island's own styles — the select's spacing, the title and description block — in a new `$ART_MD_WEB/src/components/demos/code/CodecDemo.module.css`. Do not use an inline `<style>` block in the JSX: Astro scopes `<style>` per `.astro` file and does not hoist it for a Solid island. Reuse the existing tokens (`--type-headings-family`, `--color-content`, `--color-interactive`); do not hard-code the input background — `TextArea` already resolves it from `--color-input-bg`.

### Step `3 / 5` — Create the Page and Its Wrapper

Create `$ART_MD_WEB/src/components/pages/codec-demo/CodecDemo.astro` as the page-scoped wrapper, following the `pages/home/` convention already in the package:

```astro
---
import CodecDemo from '../../demos/code/CodecDemo';
import { DEMO_SOURCES } from '../../demos/code/sources';
---

<CodecDemo client:only="solid-js" sources={DEMO_SOURCES} />
```

The `sources` array crosses the island boundary as JSON — it is plain serialisable data, so no serialisation shim or `define:vars` is needed.

Then create `$ART_MD_WEB/src/pages/codec-demo.astro` on `PageLayout`:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import CodecDemo from '../components/pages/codec-demo/CodecDemo.astro';

const content = {
  title: 'Codec demos',
  description: 'Parse Art MD in the browser and inspect the resulting document AST.',
};
---

<PageLayout content={content}>
  <h1>Codec demos</h1>
  <p>Pick a demo, edit the Art MD on the left, and read the parsed document on the right.</p>
  <CodecDemo />
</PageLayout>
```

Three things are mandatory here:

- **Pass `content`.** `SiteHead` destructures `Astro.props.content`; an `.astro` page on `PageLayout` without it throws.
- **Contribute no nested `main-section`.** `PageLayout` already renders `<main class="main-section markdown">`; a second one applies the page margin twice. This exact mistake shipped once already in `404.astro` and had to be corrected.
- **Do not add a `404`-style wrapper `<section class="main-section">`.** Same reason.

The route is `/codec-demo`, derived from the filename. The site has no client-side router and no trailing-slash config, so every link to it is a plain `href="/codec-demo"`.

### Step `4 / 5` — Link the Demo Page from the Home Page

Add a link to the new page at the end of `$ART_MD_WEB/src/components/pages/home/HomeDemo.astro`, after the `<CodeDemo>` mount — below the home page demo, as the reader's next step.

Style it as a normal page link using the site's existing `a` styling (`--color-interactive` is already applied globally in `$ART_MD_WEB/src/styles/global.css`); do not invent a link component. A short lead-in line plus the link is enough.

Do not modify `$ART_MD_WEB/src/pages/index.md` in this iteration — the markdown body and the layout-mounted demo disagreeing is resolved in the next iteration, where the navigation is integrated.

### Step `5 / 5` — Verify the Build, Then Commit

Before committing, run from the `$ART_MD_WEB` root:

```bash
npm run lint:fix
npm run lint
npm run build
```

Expected outcome: the build reports `4 page(s) built` — `/404.html`, `/about/index.html`, `/codec-demo/index.html`, `/index.html`. Exactly one new page; a fifth means you added a route by accident.

Then verify the two behaviours by hand, not just by build output. Serve the built site and open `/codec-demo`:

1. The dropdown lists one option per `DEMO_SOURCES` entry, and the first is selected on load.
2. Typing into the left textarea changes the right pane's output, and switching to another demo and back discards the edit — the pristine markdown is restored.
3. The home page demo still shows its single source and no dropdown.

Do not proceed to the commit if the build fails or if switching does not reset the input.

---

#### Commit: `add-codec-demo-page`

**Policy:** NOPUSH — Agent MUST create the commit and proceed to the next step but MUST NOT push to the remote repository.

**Message:**

```
build(art-md-web): Add `codec-demo` page assembling demos from a source list

- Add `src/pages/codec-demo.astro` on `PageLayout` and a page-scoped `CodecDemo.astro`.
- Add a dropdown over typed demo sources; edits stay local and switching resets the input.
- Link the demo page below the home page demo.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that the commit was created and **not** pushed, per the `NOPUSH` policy.
- Verify that `src/components/demos/code/sources.ts` exports `DemoSource`, `HOME_DEMO_SOURCE`, and a `DEMO_SOURCES` array with **two or more** entries, each with a non-empty `id`, `title`, `description`, and `markdown`.
- Verify that `HOME_DEMO_SOURCE` is unchanged and that the home page demo still reads that constant rather than `DEMO_SOURCES`.
- Verify that `CodecDemo.tsx` owns only the selection state, passes `selected().markdown` to `CodeDemo`, and never writes edits back into `sources`.
- Verify that changing the selection resets the input to the selected source's pristine markdown, and that switching away and back also restores it.
- Verify that the `<select>` has an accessible name and one `<option>` per source.
- Verify that `CodecDemo.tsx` contains no `client:only` directive and no inline `<style>` block, and that its styles live in `CodecDemo.module.css`.
- Verify that `src/pages/codec-demo.astro` passes a `content` object with `title` and `description` to `PageLayout`, and that it nests no `main-section`.
- Verify that the island is mounted with `client:only="solid-js"` in `src/components/pages/codec-demo/CodecDemo.astro`.
- Verify that `HomeDemo.astro` links to `/codec-demo` below the demo, and that `src/pages/index.md` is unchanged by this iteration.
- Verify that `src/components/site/SiteHeader.astro` and `src/layouts/HomeLayout.astro` are unchanged — navigation is the next iteration's work.
- Verify that the build reports `4 page(s) built` and that `dist/codec-demo/index.html` exists.
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.
