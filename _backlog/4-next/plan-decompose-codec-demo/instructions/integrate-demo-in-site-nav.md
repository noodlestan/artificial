# Instructions: `integrate-demo-in-site-nav`

**Plan:** `decompose-codec-demo`

**Iteration Id:** `integrate-demo-in-site-nav`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-decompose-codec-demo/instructions/integrate-demo-in-site-nav__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `integrate-demo-in-site-nav`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

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
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `integrate-demo-in-site-nav`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Make the demo page reachable from every page, so a visitor who lands on the home page can navigate to it — the home page is currently the one page on the site with no navigation at all.

The deliverable is one nav component rendered in two places, plus the cross-links that make the site a loop rather than a tree: home → demo, about → demo, demo → about.

The constraint to protect is the home page's hero. The home page gains a **navbar**, not a header. Swapping in `SiteHeader` would replace the hero `HomeIntro` and its gradient with the site header's own gradient, which is a different page design, not a navigation fix.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations and layout.
- `$ART_MD_WEB/src/components/site/SiteHeader.astro` (Reference) — the `<nav>` block you extract, and the header gradient you must leave alone.
- `$ART_MD_WEB/src/layouts/HomeLayout.astro` (Reference) — the layout that renders neither `SiteHeader` nor any nav; where you add it.
- `$ART_MD_WEB/src/layouts/PageLayout.astro` (Reference) — the layout header pages already use.
- `$ART_MD_WEB/src/components/pages/home/HomeIntro.astro` (Reference) — the hero the home page must keep.
- `$ART_MD_WEB/src/pages/about.md` (Reference) — the `## Contribute` list you add the demo link to.
- `$ART_MD_WEB/src/pages/index.md` (Reference) — the `## Learn more` list you add the demo link to.
- `$ART_MD_WEB/src/components/pages/codec-demo/CodecDemo.astro` (Reference) — the demo page wrapper you add the about link under.
- `$ART_MD_WEB/src/styles/global.css` (Reference) — the global `a` styling the new links inherit; do not restate it per link.

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

- Step 1 / 4 — Extract `SiteNav.astro` from `SiteHeader.astro` and add the `Demo` link
- Step 2 / 4 — Render `SiteNav` in `HomeLayout.astro`
- Step 3 / 4 — Cross-link the home, about, and demo pages
- Step 4 / 4 — Commit `integrate-demo-in-site-nav`

## Steps

### Step `1 / 4` — Extract the Nav Component

Create `$ART_MD_WEB/src/components/site/SiteNav.astro` by moving the `<nav>` element out of `$ART_MD_WEB/src/components/site/SiteHeader.astro`, together with its styles:

```astro
<nav aria-label="Site pages">
  <a href="/about">About</a>
  <a href="/codec-demo">Demo</a>
</nav>

<style>
  nav {
    display: flex;
    gap: 1rem;
  }
</style>
```

The `nav` link order is `About`, then `Demo` — the demo is the site's headline proof, but the home page already links to it directly, so it sits second in the nav.

Keep the `aria-label="Site pages"`. The home page now renders this nav too, and an unlabelled `<nav>` is announced as generic navigation on both.

Then update `SiteHeader.astro` to import and render it in place of the removed markup:

```astro
---
import SiteLogo from './SiteLogo.astro';
import SiteNav from './SiteNav.astro';
---
```

```astro
<header role="banner">
  <a class="site-title" href="/">
    <SiteLogo />
  </a>
  <SiteNav />
  <div class="links">
    <!-- unchanged -->
  </div>
</header>
```

Leave the header's own `nav` rule removed from its `<style>` block — the rule moved with the element. Do not change the header's gradient, padding, or the `.links` block; header pages must render exactly as they do now.

There is now **one** nav component. Do not duplicate the link list per layout, and do not add a second `<nav>` element to `SiteHeader.astro`.

### Step `2 / 4` — Render the Nav on the Home Page

Add `SiteNav` to `$ART_MD_WEB/src/layouts/HomeLayout.astro`, rendered under `HomeIntro` and above the `<main>`:

```astro
import SiteNav from '../components/site/SiteNav.astro';
```

```astro
  <body>
    <HomeIntro />
    <SiteNav />
    <main class="main-section markdown">
      <HomeDemo />
      <slot />
    </main>
    <SiteFooter />
  </body>
```

Render the **navbar only**. Do not replace `HomeIntro` with `SiteHeader`, and do not render `SiteHeader` in addition to it: the home page's hero heading, tagline, and gradient come from `HomeIntro`, and the site header has its own gradient background. Adopting the header here would change the home page's design rather than add navigation.

`HomeLayout` also renders neither `SiteHead`'s styles nor the header today — leave that alone. The nav is a body-level element; it needs no head changes.

### Step `3 / 4` — Cross-Link the Pages

Four links, all plain `href` values, inheriting the site's existing `a` styling from `$ART_MD_WEB/src/styles/global.css` — do not restate colours or add per-link classes:

1. **Home page markdown** — add a demo link to the `## Learn more` list in `$ART_MD_WEB/src/pages/index.md`, alongside the existing `[About](/about)` entry, with a one-clause description.
2. **About page** — add a demo link to the `## Contribute` list in `$ART_MD_WEB/src/pages/about.md`, next to the other site links.
3. **Demo page → about** — add a link to `/about` in `$ART_MD_WEB/src/components/pages/codec-demo/CodecDemo.astro`, under the `<CodecDemo>` island. This is the reverse of the home page's `## Learn more` link and closes the loop.
4. **Home page demo** — the link below the home page demo was added in the previous iteration. Confirm it is still present in `$ART_MD_WEB/src/components/pages/home/HomeDemo.astro` and do not add a second one.

The route is `/codec-demo`, derived from the `src/pages/codec-demo.astro` filename. The site has no client-side router and no trailing-slash config, so use `/codec-demo` exactly — not `/codec-demo/` and not the `.astro` extension.

`about.md` and `index.md` are markdown pages: edit the link text and path only. Do not add HTML, classes, or a component to either body — the site has no MDX integration and no content collection, so a `.md` body cannot host a component.

### Step `4 / 4` — Verify the Build, Then Commit

Before committing, run from the `$ART_MD_WEB` root:

```bash
npm run lint:fix
npm run lint
npm run build
```

Expected outcome: the build reports `4 page(s) built` — `/404.html`, `/about/index.html`, `/codec-demo/index.html`, `/index.html`. This iteration adds no route, so the count is unchanged from the previous iteration.

Then verify the navigation by hand, not just by build output:

1. The home page shows the hero **and** a navbar with `About` and `Demo`.
2. `About`, `about`, and `404` still show the site header exactly as before, with the same gradient.
3. Following `Demo` from any page's navbar lands on `/codec-demo` with the dropdown rendered.
4. Following `About` from the demo page returns to `/about`.

Do not proceed to the commit if the build fails or the home page hero changed.

---

#### Commit: `integrate-demo-in-site-nav`

**Policy:** NOPUSH — Agent MUST create the commit and proceed to the next step but MUST NOT push to the remote repository.

**Message:**

```
build(art-md-web): Add the demo page to the home, about, and site navigation

- Extract `SiteNav` from `SiteHeader` and render the navbar on the home page.
- Add `Demo` to the site nav and link the demo page from the home and about pages.
- Link the about page from the demo page.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that the commit was created and **not** pushed, per the `NOPUSH` policy.
- Verify that `src/components/site/SiteNav.astro` exists, contains exactly one `<nav aria-label="Site pages">` with an `About` then `Demo` link pair, and owns the `nav` display rule.
- Verify that `SiteHeader.astro` renders `<SiteNav />`, contains no second `<nav>` element, and that its gradient, padding, `.site-title`, `.links`, and `.icon-link` rules are unchanged.
- Verify that `HomeLayout.astro` renders `<SiteNav />` between `HomeIntro` and `<main>`, and that it still renders `HomeIntro` — the home page hero must be intact.
- Verify that `HomeLayout.astro` does **not** render `SiteHeader`.
- Verify that `index.md` `## Learn more` and `about.md` `## Contribute` each contain a `/codec-demo` link, and that neither file gained HTML, classes, or a component.
- Verify that `src/components/pages/codec-demo/CodecDemo.astro` contains a `/about` link under the island, and that `src/components/pages/home/HomeDemo.astro` contains exactly one `/codec-demo` link.
- Verify that every `/codec-demo` link is written as `/codec-demo`, with no trailing slash and no file extension, and that no link is a client-side router call.
- Verify that `src/pages/` is unchanged and that the build reports `4 page(s) built`.
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.
