# Instructions: `add-site-header`

**Plan:** `home-content-and-about-page`

**Iteration Id:** `add-site-header`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "## How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-home-content-and-about-page/instructions/add-site-header__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `add-site-header`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

## Path Variables

| Variable      | Resolved Path                      | Purpose                      |
| ------------- | ---------------------------------- | ---------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory     |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instructions file is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is mandatory.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `add-site-header`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Add a site header with navigation to the Art MD Website: create a `SiteHeader` component in `src/components/site`, separate the home layout and a "page" layout, and include the header only on the about page via the page layout.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations and layout.
- `$ART_MD_WEB/README.md` (Readme) — package readme.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

---

## Operating Instructions

### Setting Up

**Purpose:** Prepare the execution environment. Operation of Workflow: Executing Work, defined in `$DOMAINS/work/workflows/executing-work/setting-up/operation.art`.

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

- Step 1 / 3 — Create `src/components/site/SiteHeader.astro`
- Step 2 / 3 — Create `src/layouts/PageLayout.astro` and update `src/pages/about.astro`
- Step 3 / 3 — Commit `add-site-header`

## Steps

### Step `1 / 3` — Create SiteHeader Component

Create `$ART_MD_WEB/src/components/site/SiteHeader.astro` containing:

- **Site title** — links to the home page (`/`).
- **Nav for pages** — currently only the "about" page (`/about`).
- **Icon-only links** — GitHub (`https://github.com/noodlestan/art-md`) and the Noodlestan website (`https://noodlestan.org`). These links are icon-only.

### Step `2 / 3` — Create Page Layout and Update About Page

Create `$ART_MD_WEB/src/layouts/PageLayout.astro` — a page layout that includes the `SiteHeader` component.

Keep `$ART_MD_WEB/src/layouts/Layout.astro` as the **home layout** (no header).

Update `$ART_MD_WEB/src/pages/about.astro` to use `PageLayout` instead of `Layout.astro`. The home page (`src/pages/index.astro`) keeps using the home layout and shows no header.

### Step `3 / 3` — Commit `add-site-header`

---

#### Commit: `add-site-header`

**Policy:** AUTONOMOUS — Agent should commit autonomously, push, and proceed to the next step.

**Message:**

```
feat(art-md-web): Add site header with navigation.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that `src/components/site/SiteHeader.astro` exists with site title, about nav, and icon-only GitHub / noodlestan.org links.
- Verify that `src/layouts/PageLayout.astro` exists and includes `SiteHeader`.
- Verify that the about page uses `PageLayout` (header visible) and the home page uses the home layout (no header).
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.
