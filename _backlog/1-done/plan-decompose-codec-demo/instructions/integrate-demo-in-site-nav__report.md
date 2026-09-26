# Sub-Agent REPORT (#producer)

**Plan:** `decompose-codec-demo`

**Iteration Id:** `integrate-demo-in-site-nav`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Goal                                         | Change                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Make the demo page reachable from every page | Extracted `SiteNav.astro` from `SiteHeader.astro` and added the `Demo` link alongside `About`.                           |
| Render the nav component in two places       | `SiteHeader.astro` now renders `<SiteNav />`; `HomeLayout.astro` renders `<SiteNav />` between `HomeIntro` and `<main>`. |
| Cross-link the home, about, and demo pages   | Added `/codec-demo` to `index.md` (Learn more) and `about.md` (Contribute); added `/about` to `CodecDemo.astro`.         |

#### Files changed

- `apps/art-md-web/src/components/site/SiteNav.astro` — New component: `<nav aria-label="Site pages">` with `About` and `Demo` links, plus the `nav` display rule.
- `apps/art-md-web/src/components/site/SiteHeader.astro` — Replaced inline `<nav>` with `<SiteNav />`; removed local `nav` style.
- `apps/art-md-web/src/layouts/HomeLayout.astro` — Imported `SiteNav` and rendered it under `HomeIntro`, above `<main>`.
- `apps/art-md-web/src/pages/index.md` — Added `[Demo](/codec-demo) — Try the codec in the browser.` to the `## Learn more` list.
- `apps/art-md-web/src/pages/about.md` — Added `[Codec Demo](/codec-demo) — Try the codec in the browser.` to the `## Contribute` list.
- `apps/art-md-web/src/components/pages/codec-demo/CodecDemo.astro` — Added `<p><a href="/about">About Art MD</a></p>` below the `<CodecDemo>` island.

## Blockers (if any)

None.

## Feedback

Not requested.
