# Sub-Agent REPORT (worker)

**Plan:** `code-demo-poc-solidjs`

**Iteration Id:** `build-code-demo-poc`

**Outcome:** `COMPLETED`

## Review

**Reviewed:** the original delegation of `build-code-demo-poc`, against the working tree after
the maintainer's amendments.

**Outcome:** `AMENDED` — the commit below was folded into a single commit with these changes.

Everything under `## Evidence` is the worker's original report, kept as the record of what was
delegated and what came back. This section supersedes it where the two disagree. Read this first.

### Delta

| Area             | As delegated (original report)                             | As amended (current tree)                                                       | Files                                                                    |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Demo placement   | Dedicated `/demo` route, linked from `index.md` `## Demos` | Carried by `HomeLayout` above the slot on the home page                         | `HomeDemo.astro`, `HomeLayout.astro`, `index.md`, `demo.astro` (deleted) |
| Solid JSX config | Not instructed; absent                                     | `jsx: preserve`, `jsxImportSource: solid-js`                                    | `tsconfig.json`                                                          |
| Island styles    | Inline `<style>` block in the JSX, scoped to `.code-demo`  | `CodeDemo.module.css` beside the component, keyed `CodeDemo` / `CodeDemo--Pane` | `CodeDemo.tsx`, `CodeDemo.module.css` (new)                              |
| Home components  | `Intro.astro`                                              | `HomeIntro.astro`                                                               | `HomeIntro.astro` (renamed from `Intro.astro`)                           |
| Page margins     | 404 nested `main-section`, doubling the layout's margin    | Wrapper removed; page font sizing moved to a page-level `<style>`               | `404.astro`                                                              |
| Build pages      | `4 page(s) built`, including `/demo/index.html`            | `3 page(s) built`; the island ships on `/index.html`                            | —                                                                        |
| Fixture text     | Trailing space inside the `git@…` backticks                | Trailing space removed                                                          | `CodeDemo.tsx`                                                           |
| Output heading   | `Document AST`                                             | `ArtDocument (Art AST)`                                                         | `CodeDemo.tsx`                                                           |
| Source binding   | `value={DEMO_MARKDOWN}`                                    | `value={source()}`                                                              | `CodeDemo.tsx`                                                           |

### Why the demo moved to the home page

The delegated design put the demo behind a link. The maintainer put it on the landing page
instead. A code demo _is_ the proof that Art MD works; asking a first-time visitor to follow a
link to `/demo` asks them to take the claim on faith first. It also removes a route and a
navigational step, and it keeps `index.md` pure markdown, which the no-MDX constraint already
demanded.

### Why the styles moved to a CSS module

Astro scopes `<style>` per `.astro` file and does not hoist it for a Solid island. The inline
block in the JSX was therefore a latent rendering bug, not a style preference. A CSS module
beside the component is explicit, hash-scoped, and survives the island boundary.

### Why `tsconfig.json` was added

The instructions never mentioned TypeScript configuration, so the island was authored under
`astro/tsconfigs/strict`, which defaults to React-style JSX. Without `jsxImportSource: solid-js`
the integration's Babel transform does not apply and the island renders nothing. This is
captured in the plan's `## Feedback` so future SolidJS iterations are instructed for it.

### Correcting the record

- The original report's `4 page(s) built` and `/demo/index.html` checks no longer describe the
  current tree. The amended verification target is `3 page(s) built` with the island on
  `/index.html`.
- The "minimal in-component styles" note under **Noted deviations** is superseded — the styles
  are now in `CodeDemo.module.css`.
- The plan's **Decisions** entry for a dedicated `/demo` route was stale and has been replaced
  with the home-page decision, alongside the CSS-module and page-naming decisions.
- `add-404-page__report.md` is left as written; the `404.astro` margin fix is recorded here and
  in the amended commit rather than rewriting that report.

## Evidence

### Changes

Goal: prove out a live, in-browser Art MD round trip — a SolidJS island that parses markdown
into an AST with `@art-md/codec` as the user types.

| Change                                                                       | Instruction step | Status | Evidence                                                     |
| ---------------------------------------------------------------------------- | ---------------- | ------ | ------------------------------------------------------------ |
| Add `solid-js`, `@astrojs/solid-js`, `@art-md/codec` to package dependencies | 1 / 5            | `DONE` | `apps/art-md-web/package.json` `dependencies`                |
| Register the SolidJS integration in Astro config                             | 1 / 5            | `DONE` | `apps/art-md-web/astro.config.mjs` `integrations: [solid()]` |
| Refresh the lockfile with the new packages                                   | 1 / 5            | `DONE` | `package-lock.json` at monorepo root                         |
| Create the `CodeDemo` island                                                 | 2 / 5            | `DONE` | `apps/art-md-web/src/components/demos/code/CodeDemo.tsx`     |
| Create the `/demo` route                                                     | 3 / 5            | `DONE` | `apps/art-md-web/src/pages/demo.astro`                       |
| Link `/demo` from the home page `## Demos` section                           | 3 / 5            | `DONE` | `apps/art-md-web/src/pages/index.md`                         |
| Verify the build                                                             | 4 / 5            | `DONE` | `4 page(s) built`, including `/demo/index.html`              |
| Commit `build-code-demo-poc`                                                 | 5 / 5            | `DONE` | commit `b07a071`, `policy: NOPUSH`                           |

#### Files changed

- `apps/art-md-web/package.json` — added `solid-js@^1.9.15`, `@astrojs/solid-js@^7.0.2`
  (the Astro 7-compatible line, peer `solid-js@^1.9.13`) and `@art-md/codec@^0.0.2` to
  `dependencies`.
- `apps/art-md-web/astro.config.mjs` — imports `@astrojs/solid-js` and registers
  `integrations: [solid()]`.
- `apps/art-md-web/src/components/demos/code/CodeDemo.tsx` — **new**. SolidJS island
  rendering two panes. `createArtCodec()` is called once at module scope, `createSignal`
  holds the markdown source, and a `createMemo` derives the serialised output so the parse
  only re-runs when the source changes. Parse failures are caught and returned as
  `Parse error: {message}` so malformed markdown never blanks the demo. Left pane is an
  editable `<textarea>` bound via `onInput` and seeded with the demo fixture verbatim
  (including the trailing space after the `git@github.com:noodlestan/art-md.git` backtick);
  right pane is a `readonly` `<textarea>` showing the output.
- `apps/art-md-web/src/pages/demo.astro` — **new**. Passes a `content` object
  (`{ title, description }`) to `PageLayout`, then mounts `<CodeDemo client:only="solid-js" />`.
  Does not wrap the island in `main-section`, since the layout already renders
  `<main class="main-section markdown">`.
- `apps/art-md-web/src/pages/index.md` — replaced the `Interactive demo goes here.`
  placeholder in `## Demos` with a markdown link to `/demo`.
- `package-lock.json` — picked up the 89 new packages (not a barrel or formatting change;
  listed because it is a hand-off-relevant consequence of step 1 / 5).

### Commits

| Commit    | Message                                                                  | Policy   | Pushed |
| --------- | ------------------------------------------------------------------------ | -------- | ------ |
| `b07a071` | `build(art-md-web): Add SolidJS code demo parsing Art MD in the browser` | `NOPUSH` | `NO`   |

`origin/main` remains at `5a28814`, so the commit is local only, as the policy requires.

### Validation Evidence

**Setting Up** — `npm ci` at the `$PROJECT` (monorepo) root: `added 202 packages, and
audited 204 packages`. Required, because `@noodlestan/tsconfig` is a root-only devDependency.

**Verifying Step** (from `$ART_MD_WEB` root) — `npm run lint:fix`, `npm run lint`, `npm run build`:

- `lint:fix` → `All matched files use Prettier code style!`
- `lint` → `All matched files use Prettier code style!`
- `build` → `✓ 4 page(s) built`, listing `/404.html`, `/about/index.html`, `/demo/index.html`,
  `/index.html`. No `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` and no `document is not defined`.

**Build artefact checks:**

- `dist/demo/index.html` exists (13691 bytes).
- It contains the island element with the `client-only` directive:
  `<astro-island uid="ZWA9fT" component-url="/_astro/CodeDemo.BlcLAwOP.js" component-export="default" renderer-url="/_astro/client.CYPZqZE8.js" props="{}" ssr client="only" opts="{&quot;name&quot;:&quot;CodeDemo&quot;,&quot;value&quot;:&quot;solid-js&quot;}">`.
- The browser bundle `dist/_astro/CodeDemo.BlcLAwOP.js` is 88816 bytes and contains the
  transpiled codec, confirming Vite handled the TypeScript source rather than Node.
- Nested `main-section` check: `main class="main-section markdown"` occurs once (the layout's
  own) and `class="main-section"` occurs zero times.

**Pre-commit hook** (lefthook, `apps/art-md-web` repository) — ran without `--no-verify` and
passed all three commands: `0-clean ✔`, `1-extract ✔`, `2-ci ✔`. The `ci` stage re-ran
`prettier . -c`, `astro build` (again `4 page(s) built`), and the test placeholder.

**Verifying Completion** (instruction checklist):

- Commit created and not pushed, per `NOPUSH`. ✔
- `solid-js`, `@astrojs/solid-js`, `@art-md/codec` present in `apps/art-md-web/package.json`,
  and `astro.config.mjs` registers the SolidJS integration. ✔
- `CodeDemo.tsx` constructs the codec at module scope (`const codec = createArtCodec();`) and
  serialises `result.document` only — `const { document } = codec.parse(source());` then
  `JSON.stringify(document, null, 2)`. The `context` half of the `ParseResult` is never touched. ✔
- `src/pages/demo.astro` passes a `content` object to `PageLayout` and mounts the island with
  `client:only="solid-js"`. ✔
- The demo page does not nest a `main-section` inside the layout's own `main.main-section`. ✔
- `src/pages/index.md` links to `/demo` and no longer contains
  `Interactive demo goes here.`. ✔
- Build reports `4 page(s) built` including `/demo/index.html`. ✔
- `aws s3 sync` was not run, per step 4 / 5. ✔

## Blockers (if any)

None.

### Noted deviations (non-blocking)

- **Dependency versions.** The instruction named `@art-md/codec@^0.0.2` but left
  `solid-js` and `@astrojs/solid-js` unversioned. I resolved them to the current
  Astro 7-compatible pair (`@astrojs/solid-js@^7.0.2`, `solid-js@^1.9.15`); the 5.x line
  of the integration does not satisfy Astro 7.
- **Error formatting extracted to a helper.** The instruction's `output` memo inlines
  `error instanceof Error ? error.message : String(error)`. Since the mandatory reading
  for the `.tsx` component is the Art JS TypeScript conventions, whose "Flat Code" rules
  forbid complex expressions in ternaries, that expression is now a module-scope
  `describeError(error: unknown)` helper. Behaviour is identical, including the
  `Parse error: {message}` prefix.
- **Minimal in-component styles.** Step 2 / 5 specified two panes but no styling. A small
  `<style>` block inside the component's JSX makes the panes render side by side and
  inherits the site's existing CSS custom properties. No stylesheet was added outside the
  island.
