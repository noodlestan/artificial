# Plan: Design POC

**ID:** `design-poc`

**Status:** `WORKING`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Prove out a design system for the Art MD Website with a color scheme, typography, and layout.

**Description:** Record the design POC work already applied to `$ART_MD_WEB` — design tokens, global styles, brand logo, header and footer, and the home and about page layout — as a single iteration and commit.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Describe the work-item changes through a series of iterations and commits with detailed instructions.

---

## Path Variables

| Variable      | Resolved Path                      | Purpose                      |
| ------------- | ---------------------------------- | ---------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory     |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`       | Domain resources directory   |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package |

## Summary

Establish the design POC of the Art MD Website: OKLCH-based color tokens with a dark scheme, a three-family type scale, gradient-driven header and footer, a brand logo component, and a global stylesheet carrying the shared layout primitives.

## Attachments

None.

## Context

### Upstream Work

| Kind        | Path                                                               | Role                                                                        |
| ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Milestone   | `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md` | Coordinates this plan as Phase 2 (POC) of the Art MD Hello World milestone. |
| Parking Lot | `$PROJECT/_backlog/_parking-lot.md`                                | Tracks short-term actionables, pending questions, and blockers.             |

### Required Skills

- `write-plan` — Generates plans from sources and context. Required for Contextualizing, Drafting, Refining.
- `render-template` — Renders plan and instruction artefacts. Required for Drafting, Refining.

### Knowledge

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan record fields and statuses. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/plans/structures/iteration.art` (Structure) — Defines iteration as a container for changes and instructions. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/commits/types/commit.art` (Type) — Defines planned commit blueprints. Relevant for stages Drafting, Refining.

::READ `$WORKSPACE/knowledge/conventions/writing-commit-message.art` (Conventions) — Defines the commit message format, types, and scopes. Relevant for stages Drafting, Refining.

::READ `$ART_MD_WEB/_guide.md` (Guide) — Defines the Art MD Website package operations. Relevant for stages Setting up, Verifying.

## Scope

### (Scope) Application: Art MD Website

**Record:** `$ART_MD_WEB/_records/package.art`

**Role:** — Implementation target.

**Partial:**

- `owner` — Project: Artificials
- `path` — `$ART_MD_WEB/`

**Changes:**

- Add `src/styles/global.css` with the design tokens and base element styles.
- Add `src/components/site/SiteLogo.astro` and `src/components/site/SiteFooter.astro`.
- Add `src/components/pages/home/Intro.astro` and `src/layouts/components/SiteHead.astro`.
- Update `SiteHeader.astro`, `HomeLayout.astro`, `PageLayout.astro`, `index.astro`, and `about.astro` to the new design.
- Replace the favicon set with `icon.svg`, `apple-touch-icon.png`, and `favicon.ico`.

**Dependencies:**

- None.

## Execution Context

Execution is coordinated from `$WORKSPACE`. The changes are applied in `$ART_MD_WEB` on branch `main`, and are currently uncommitted in `$PROJECT`.

---

## Items:

| Iteration / Instructions | Status    |
| ------------------------ | --------- |
| Iteration: POC Design    | `WORKING` |

### Iteration: POC Design

**Id:** `poc-design`

**Status:** `WORKING`

**Purpose:** Prove out the Art MD Website design system across the existing pages.

**Description:** Introduce design tokens, global styles, and the brand chrome, and apply them to the home and about pages.

**Changes:**

- Add `src/styles/global.css` — OKLCH color tokens (`--color-content`, `--color-page-bg`, `--color-interactive`, `--color-gradient-1..3`) with a `prefers-color-scheme: dark` override, typography tokens (`--type-headings-family` Open Sans, `--type-text-family` Literata, `--type-code-family` IBM Plex Mono), text metrics, and a responsive `--page-margin-h` clamp; plus base styles for `body`, headings, `code`, `main`, links, and the `.container` / `.main-section` layout primitives.
- Add `src/components/site/SiteLogo.astro` — the Art MD wordmark SVG, sized to its container and inheriting `currentcolor`.
- Add `src/components/site/SiteFooter.astro` — copyright, license, and privacy notices over a gradient background.
- Add `src/components/pages/home/Intro.astro` — home hero with the logo, tagline, and gradient background.
- Add `src/layouts/components/SiteHead.astro` — shared head metadata, Bunny Fonts preconnect and stylesheet, `theme-color`, and the favicon links.
- Update `src/components/site/SiteHeader.astro` — use `SiteLogo` in the site title, gradient background instead of the bottom border, re-indented to the project formatting.
- Update `src/layouts/HomeLayout.astro` and `src/layouts/PageLayout.astro` — import `global.css`, extract `SiteHead`, wrap the slot in `main`, and include `SiteFooter`; drop the duplicated `html`/`body` reset styles.
- Update `src/pages/index.astro` — render `Intro`, and restructure the demos, features, and learn-more sections with the `main-section` / `sub-section` classes.
- Update `src/pages/about.astro` — apply the `main-section` layout classes and retitle the intro to "About Art MD".
- Replace `public/favicon.svg` with `public/icon.svg`, add `public/apple-touch-icon.png`, and regenerate `public/favicon.ico`.

**Dependencies:**

- None.

#### Commits:

| ID           | Repository / Checkout / Branch    | Policy       | Hash  | Status     |
| ------------ | --------------------------------- | ------------ | ----- | ---------- |
| `poc-design` | Artificials / `$PROJECT` / `main` | `AUTONOMOUS` | (TBD) | `AUTHORED` |

##### Commit: `poc-design`

**Repository:** Repository: Artificials

**Hash:** (TBD)

**Status:** `AUTHORED`

**Message:**

```
design(art-md-web): POC color scheme, typography, and layout

- Add OKLCH color tokens with a dark scheme and a three-family type scale in `global.css`.
- Add brand chrome: `SiteLogo`, `SiteFooter`, home `Intro`, and shared `SiteHead`.
- Apply the design to both layouts, the site header, and the home and about pages.
- Restructure the home demos, features, and learn-more sections; retitle the about intro.
- Replace the favicon set with `icon.svg` and `apple-touch-icon.png`.
```

---

## Work

### Next

Stage the changed and new files in `$PROJECT`, then commit with the authored message.

### Blockers

- None.

---

## Operating Instructions

### Writing Commit Message

**Purpose:** Write standardized message according to context conventions. Operation of Workflow: Planning Work, defined in `$DOMAINS/work/workflows/planning-work/writing-commit-message/operation.art`.

**Instructions:** (From `$WORKSPACE/knowledge/conventions/writing-commit-message.art`)

1. Read commit message conventions from `$WORKSPACE/knowledge/conventions/writing-commit-message.art`.
2. Write the message following the rules defined there.

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

## Coordination

### Not In Scope

- **Deployment** — Deferred to a follow-up plan.
- **Style element decomposition** — Deferred to the `decompose-style-elements` plan.

### Evidence

- **Tokens defined** — `src/styles/global.css` declares the color, typography, and layout tokens, including a dark scheme override.
- **Brand chrome added** — `SiteLogo.astro`, `SiteFooter.astro`, `Intro.astro`, and `SiteHead.astro` created; the header and both layouts render them.
- **Pages restyled** — `index.astro` and `about.astro` use the `main-section` layout classes and the home hero.

### Findings

- The design POC is expressed entirely through global custom properties, so per-component styles only consume tokens.

### Decisions

- **OKLCH tokens** — Colors are defined in OKLCH with a `prefers-color-scheme: dark` override of the same token names.
- **Gradient chrome** — The header, home hero, and footer share the `--color-gradient-1..3` stops instead of solid backgrounds.

### Knowledge to Update

None.

### Follow Ups

- Decompose the style elements into reusable parts.
- Deploy the Art MD Website.

### Feedback

- The commit message type `design` is not in the allowed `$WORK` types of `$WORKSPACE/knowledge/conventions/writing-commit-message.art` (`build`, `test`, `refactor`, `fix`); `build(art-md-web)` is the convention-compliant equivalent.
