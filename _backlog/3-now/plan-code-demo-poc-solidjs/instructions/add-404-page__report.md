# Sub-Agent REPORT (#producer)

**Plan:** `code-demo-poc-solidjs`

**Iteration Id:** `add-404-page`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Goal                                                                                              | Change                                                                                                                                | Evidence                                                                                                |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Emit `dist/404.html`, the file the CloudFront `custom_error_response` for `404` already points at | Added `$ART_MD_WEB/src/pages/404.astro` at the exact `src/pages/` path so Astro emits that filename rather than a nested route        | Build reports `3 page(s) built` and lists `/404.html`; `ls -l dist/404.html` → 8 841 bytes              |
| Render a styled page that reuses the existing design POC classes, not a bespoke one               | Page imports `PageLayout` and wraps its content in a single `<section class="main-section">`; no new global CSS                       | `git show --stat HEAD` lists exactly one file; `src/styles/global.css` absent from the commit           |
| Render `Page not found`, a short explanation, and a way back so the visitor is not stranded       | `<h1>Page not found</h1>`, one explanatory `<p>`, and `<a href="/">Return to the home page</a>` with the existing global link styling | `dist/404.html` body carries the header, `<section class="main-section">`, heading, paragraph, and link |

`PageLayout` receives a `content` object carrying `title` and `description`, mirroring the
frontmatter keys of `$ART_MD_WEB/src/pages/about.md`, so `SiteHead` renders a page title and
description instead of throwing on an undefined `content` prop.

#### Files changed

- `$ART_MD_WEB/src/pages/404.astro` — new page on `PageLayout`; one `main-section` wrapper,
  `Page not found` heading, explanation paragraph, and a link back to `/`.

### Commits

| Commit    | Message                                              | Policy | Pushed                                                                                                            |
| --------- | ---------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `6762790` | `build(art-md-web): Add 404 page for unknown routes` | NOPUSH | No — `git status -sb` reports `## main...origin/main [ahead 2]`; the pre-existing unpushed `38e2639` is unrelated |

One commit, exactly as prescribed. The pre-commit hook (`lefthook`: clean → extract → `npm run ci`)
passed without `--no-verify`.

### Validation Evidence

| Check                     | Command                       | Result                                                              |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Formatting, autofix       | `npm run lint:fix`            | `All matched files use Prettier code style!`                        |
| Formatting, report        | `npm run lint`                | `All matched files use Prettier code style!`                        |
| Full build                | `npm run build`               | `3 page(s) built` — `/404.html`, `/about/index.html`, `/index.html` |
| Artefact present          | `ls -l dist/404.html`         | 8 841 bytes                                                         |
| Commit scope              | `git show --stat HEAD`        | 1 file changed, 16 insertions, no `global.css`                      |
| Repo-wide pre-commit gate | `npm run ci` (via `lefthook`) | 1 successful task; build and `echo none yet` tests pass             |

The build was also baselined before the change: it emitted 2 pages (`/about/index.html`,
`/index.html`) and no `404.html`, so the third page is attributable to this commit.

Not run, per the instruction: `aws s3 sync`. The page reaches visitors on the next deploy.

## Blockers (if any)

None. One environment issue surfaced during **Setting Up** and was resolved within setup, not
implementation: the first `npm run build` failed with `Tsconfig not found
@noodlestan/tsconfig/workspace/tsconfig.json`. Cause — the monorepo root `tsconfig.json` extends
`@noodlestan/tsconfig/workspace/tsconfig.json`, and that package is a devDependency of the
monorepo root only. Running `npm ci` at the monorepo root (`$PROJECT`) installed it and the build
succeeded. No source change was needed.

## Feedback

### For the planner

- **Setting Up is missing the monorepo root install.** The instruction lists `npm ci` at
  `$WORKSPACE` and at `$ART_MD_WEB`. The app's own `package.json` declares only `astro`, and the
  build cannot start without `@noodlestan/tsconfig` from the monorepo root at `$PROJECT`. Add
  `npm ci` at the monorepo root, or state that `$WORKSPACE` for this checkout is `$PROJECT`.
- **The page requirements are self-conflicting on the wrapper.** Requiring `PageLayout` _and_ a
  `<section class="main-section">` produces a nested `main-section`, because `PageLayout` already
  renders `<main class="main-section markdown">`. `main-section` carries `margin: 0
var(--page-margin-h)`, so the page margin is applied twice. I followed the instruction
  literally; consider stating one or the other in a future iteration.
- **No mention of the `content` prop contract.** `SiteHead` destructures `Astro.props.content`, so
  an `.astro` page on `PageLayout` throws without a `content` object. The instruction only says to
  copy `about.md` frontmatter "if the layout requires a `layout` or `title` entry", which is close
  but does not name the prop.

### For the technical writers

- `$ART_MD_WEB/_guide.md` states "Run from the repository root (monorepo): `npm ci`" under Setting
  Up, but the package sits in a nested checkout and its `workspaces` glob (`apps/**`) resolves
  against the monorepo it lives in. Worth making explicit which directory that means.
- `PageLayout.astro` and `HomeLayout.astro` both hardcode `main class="main-section markdown"`;
  a `_records` note that `main-section` is already applied by the layout would prevent the nesting
  in future page instructions.

### For the crew

- The `dist/` directory is gitignored and was removed by the pre-commit `npm run clean` step,
  then rebuilt by the hook. `dist/404.html` is present after the commit, so the artefact check in
  the instruction stays valid post-commit.
- Two nested `npm ci` runs (workspace root, then app root) installed nothing into the app's local
  `node_modules` — everything hoisted to the monorepo root. Harmless, but worth knowing when a
  build error points at a package that "should" be local.
