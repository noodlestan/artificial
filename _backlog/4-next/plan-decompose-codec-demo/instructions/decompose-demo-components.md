# Instructions: `decompose-demo-components`

**Plan:** `decompose-codec-demo`

**Iteration Id:** `decompose-demo-components`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-decompose-codec-demo/instructions/decompose-demo-components__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `decompose-demo-components`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

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
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `decompose-demo-components`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Break the codec demo's building blocks out of `CodeDemo` so the demo page added in the next iteration can reuse them instead of re-implementing inputs and panes.

This iteration is a pure refactor plus one new design token. The home page must render exactly as it does now — same copy, same two panes, same markdown fixture. The only visible difference is that the textarea background follows a colour token instead of the browser default.

The outcome to protect is reusability: after this iteration, `TextArea` and `DemoPane` are importable, and no rule describing a textarea lives in `CodeDemo.module.css`.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations and layout.
- `$ART_MD_WEB/src/components/demos/code/CodeDemo.tsx` (Reference) — the island you are decomposing; the source of the fixture and the parse memo you must preserve.
- `$ART_MD_WEB/src/components/demos/code/CodeDemo.module.css` (Reference) — the rules you are splitting between `TextArea.module.css` and `DemoPane.module.css`.
- `$ART_MD_WEB/src/components/pages/home/HomeDemo.astro` (Reference) — the only current mount of the island; the home page keeps a single markdown source.
- `$ART_MD_WEB/src/styles/global.css` (Reference) — the `:root` token block, including the nested dark colour scheme, that gains `--color-input-bg`.
- `$ART_MD_WEB/src/layouts/HomeLayout.astro` (Reference) — confirms the home page carries the demo through the layout, not through `index.md`.
- `$ART_MD_WEB/tsconfig.json` (Reference) — the Solid JSX configuration the new `.tsx` components depend on.

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

- Step 1 / 6 — Add the `--color-input-bg` root token
- Step 2 / 6 — Create the `TextArea` component and its CSS module
- Step 3 / 6 — Create the `DemoPane` component and its CSS module
- Step 4 / 6 — Add `sources.ts` with the `DemoSource` type and `HOME_DEMO_SOURCE`
- Step 5 / 6 — Make `CodeDemo` controlled and compose the new components
- Step 6 / 6 — Commit `decompose-demo-components`

## Steps

### Step `1 / 6` — Add the Input Background Token

In `$ART_MD_WEB/src/styles/global.css`, add `--color-input-bg` to the `:root` block, next to `--color-content` and `--color-page-bg`:

```css
:root {
  --color-content: #040404;
  --color-page-bg: #eaeaea;
  --color-input-bg: #eeeeee;
  /* ... */
}
```

Then add the dark value inside the existing `@media screen and (prefers-color-scheme: dark)` block, which is already nested in `:root`:

```css
@media screen and (prefers-color-scheme: dark) {
  --color-interactive: oklch(77.1% 0.1715 161);
  --color-gradient-2: oklch(33.9% 0.0715 234);
  --color-content: #eaeaea;
  --color-page-bg: #040404;
  --color-input-bg: #111111;
}
```

Declare the token in **both** colour schemes. The dark block is nested in `:root`, so a missing declaration there silently leaves the light `#eeeeee` in place on a dark system.

Expected outcome: the token resolves to `#eeeeee` under a light scheme and `#111111` under a dark one. No component consumes it yet.

### Step `2 / 6` — Create the TextArea Component

Create `$ART_MD_WEB/src/components/demos/code/TextArea.tsx` and `$ART_MD_WEB/src/components/demos/code/TextArea.module.css`.

`TextArea` renders the element and nothing else — no wrapper, no heading, no label markup. It owns only the input's own appearance, so callers keep control of layout and labelling.

Props:

- `value: string` — the text to display.
- `ariaLabel: string` — the accessible name.
- `rows?: number` — defaults to `20`.
- `readonly?: boolean` — defaults to `false`.
- `onInput?: (value: string) => void` — called with the new value on input; omit for a read-only pane.

Do not use `<label>` here: both current panes are labelled by their pane heading, and `CodecDemo` in the next iteration labels its `<select>` itself.

`TextArea.module.css` takes the rules that currently describe the element, keyed `.TextArea`, styled from root tokens:

```css
.TextArea {
  background: var(--color-input-bg);
  color: var(--color-content);
  font-family: var(--type-code-family);
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 20rem;
  padding: 0.75rem;
  resize: vertical;
}
```

`background: var(--color-input-bg)` is the point of the token added in Step 1. Do not hard-code `#eeeeee` or `#111111` anywhere in a component or module.

Do **not** use an inline `<style>` block in the JSX. Astro scopes `<style>` per `.astro` file and does not hoist it for a Solid island, so it renders unreliably. Keep the CSS module.

### Step `3 / 6` — Create the DemoPane Component

Create `$ART_MD_WEB/src/components/demos/code/DemoPane.tsx` and `$ART_MD_WEB/src/components/demos/code/DemoPane.module.css`.

`DemoPane` is a titled column: it takes `title: string` and children, and renders the heading plus its children inside a flex column. This replaces the `CodeDemo--Pane` div and its `> h2` rule.

`DemoPane.module.css` carries the pane rules, keyed `.DemoPane` and `.DemoPane > h2`:

```css
.DemoPane {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.DemoPane > h2 {
  font-size: 1.25rem;
}
```

Use Solid's `children` helper so the component does not eagerly evaluate its children, and render the heading as an `<h2>` — the two current pane titles ("Art MD" and "ArtDocument (Art AST)") must keep their heading level so the page outline is unchanged.

### Step `4 / 6` — Add the Demo Source Module

Create `$ART_MD_WEB/src/components/demos/code/sources.ts`.

It exports the type, the home page's single source, and a list that starts with one entry:

```ts
export type DemoSource = {
  id: string;
  title: string;
  description: string;
  markdown: string;
};

export const HOME_DEMO_SOURCE: DemoSource = {
  id: 'hello-world',
  title: 'Hello World',
  description: 'A minimal Art MD document with a resource and its fields.',
  markdown: `# Hello World

## Repository: Art MD

**Author:** Noodlestan Collective

**Remote:** \`git@github.com:noodlestan/art-md.git\`
`,
};

export const DEMO_SOURCES: DemoSource[] = [HOME_DEMO_SOURCE];
```

Preserve the `markdown` value **verbatim** — it is the fixture currently hard-coded in `CodeDemo.tsx`, and changing it changes what the home page parses. `DEMO_SOURCES` deliberately holds one entry; the next iteration appends to it.

### Step `5 / 6` — Make CodeDemo Controlled

Rewrite `$ART_MD_WEB/src/components/demos/code/CodeDemo.tsx` so it is a controlled component.

It takes a single prop `markdown: string` and owns a local draft seeded from it. The draft is the user's working copy; the prop is the pristine value.

```tsx
import { createEffect, createMemo, createSignal } from 'solid-js';
import { createArtCodec } from '@art-md/codec';
import DemoPane from './DemoPane';
import TextArea from './TextArea';
import styles from './CodeDemo.module.css';

const codec = createArtCodec();
```

Seed and re-seed the draft from the prop with a `createEffect` that reads only `props.markdown`:

```tsx
const [draft, setDraft] = createSignal(props.markdown);

createEffect(() => {
  setDraft(props.markdown);
});
```

This is the mechanism the next iteration relies on: a changed `markdown` prop resets the input to pristine, while local edits never write back to the prop. Because the effect tracks `props.markdown` and nothing else, typing in the input does not re-trigger it. Do not track `draft()` inside the effect — that would reset the input on every keystroke.

Keep the parse memo exactly as it behaves today, reading the draft and serialising `result.document` only:

```tsx
const output = createMemo(() => {
  try {
    const { document } = codec.parse(draft());
    return JSON.stringify(document, null, 2);
  } catch (error) {
    return `Parse error: ${error instanceof Error ? error.message : String(error)}`;
  }
});
```

Catching and rendering the message inline is deliberate: malformed markdown must not blank the demo. Do not let a parse failure throw out of the island.

Compose the two panes from `DemoPane` and `TextArea`, keeping both existing titles verbatim — "Art MD" for the editable source pane and "ArtDocument (Art AST)" for the read-only output pane. Wire the editable pane's `onInput` to `setDraft` and leave the output pane `readonly`.

Trim `$ART_MD_WEB/src/components/demos/code/CodeDemo.module.css` down to the grid the component still owns, keyed `.CodeDemo`:

```css
.CodeDemo {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
}
```

Every other rule in that file now belongs to `TextArea.module.css` or `DemoPane.module.css`. Do not leave a textarea rule behind in `CodeDemo.module.css`.

Then update `$ART_MD_WEB/src/components/pages/home/HomeDemo.astro` to read the fixture from the module and pass it as a prop:

```astro
---
import CodeDemo from '../../demos/code/CodeDemo';
import { HOME_DEMO_SOURCE } from '../../demos/code/sources';
---

<h1>Codec demo</h1>
<p>Type Art MD on the first textarea.</p>
<p>The <code>@art-md/codec</code> parses it into Art AST on the second.</p>
<CodeDemo client:only="solid-js" markdown={HOME_DEMO_SOURCE.markdown} />
```

The home page assembles a **single** markdown source. Do not give it a dropdown, and do not swap it to `DEMO_SOURCES` — the demo page does that in the next iteration.

Keep `client:only="solid-js"` on the mount. `@art-md/codec` ships TypeScript source as its entry point and Node refuses to strip types under `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so any Astro server render fails to load the module. `client:only` skips the server render; Vite transpiles the browser bundle.

### Step `6 / 6` — Verify the Build, Then Commit

Before committing, run from the `$ART_MD_WEB` root:

```bash
npm run lint:fix
npm run lint
npm run build
```

Expected outcome: the build reports `3 page(s) built` — `/404.html`, `/about/index.html`, `/index.html`. A fourth page means you added a route by accident; this iteration adds none.

Confirm `dist/index.html` still carries the `astro-island` with the `solid-js` renderer, and that the home page still shows both pane headings. Do not proceed to the commit if the build fails.

---

#### Commit: `decompose-demo-components`

**Policy:** NOPUSH — Agent MUST create the commit and proceed to the next step but MUST NOT push to the remote repository.

**Message:**

```
build(art-md-web): Decompose codec demo into `TextArea` and `DemoPane` components

- Add `TextArea` and `DemoPane` components with their own CSS modules.
- Add the `--color-input-bg` token for the default and dark colour schemes.
- Move the demo fixture to a typed `sources.ts` and make `CodeDemo` controlled.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that the commit was created and **not** pushed, per the `NOPUSH` policy.
- Verify that `src/components/demos/code/` contains `TextArea.tsx`, `TextArea.module.css`, `DemoPane.tsx`, `DemoPane.module.css`, `sources.ts`, `CodeDemo.tsx`, and `CodeDemo.module.css`, and that no `.astro` or markdown file was added to that directory.
- Verify that `--color-input-bg` is declared in `$ART_MD_WEB/src/styles/global.css` in **both** the `:root` block and the `prefers-color-scheme: dark` block, with values `#eeeeee` and `#111111` respectively.
- Verify that no component or CSS module hard-codes `#eeeeee` or `#111111`; the only consumer is `TextArea.module.css` through `var(--color-input-bg)`.
- Verify that `CodeDemo.module.css` contains no rule targeting a `textarea`, and that the pane and heading rules now live in `DemoPane.module.css`.
- Verify that `CodeDemo` accepts a `markdown` prop, seeds and re-seeds its draft from that prop in a `createEffect`, and does not write edits back to the prop.
- Verify that `sources.ts` exports `DemoSource`, `HOME_DEMO_SOURCE`, and a `DEMO_SOURCES` array of exactly one entry, and that `HOME_DEMO_SOURCE.markdown` is byte-identical to the fixture that was hard-coded in `CodeDemo.tsx`.
- Verify that `HomeDemo.astro` still renders the same copy, mounts `CodeDemo` with `client:only="solid-js"`, and passes `markdown={HOME_DEMO_SOURCE.markdown}` — and that it has **no** dropdown.
- Verify that the parse failure path is intact: malformed markdown renders a `Parse error: ...` string in the output pane instead of throwing.
- Verify that `src/pages/` is unchanged and that `npm run build` reports `3 page(s) built`.
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.
