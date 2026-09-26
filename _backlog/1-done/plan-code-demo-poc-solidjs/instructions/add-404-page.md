# Instructions: `add-404-page`

**Plan:** `code-demo-poc-solidjs`

**Iteration Id:** `add-404-page`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "## How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-code-demo-poc-solidjs/instructions/add-404-page__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `add-404-page`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

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
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `add-404-page`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Add a 404 page to the Art MD Website so that unknown routes render a styled page instead of the raw S3 XML error body.

This iteration is mandatory because the CloudFront distribution for this site already declares a `custom_error_response` for `404` pointing at `/404.html`, but the Astro build emits no such file. Until it exists, every unknown path on the deployed site returns an `application/xml` response.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations, layout, and deploying instructions.
- `$ART_MD_WEB/_records/static-web-deployment.art` (Record) — the deployment this page must satisfy.
- `$ART_MD_WEB/src/styles/global.css` — the `main-section` and typography classes the page must reuse.
- `$ART_MD_WEB/src/pages/about.md` — the reference for markdown page frontmatter and section structure.

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

- Step 1 / 3 — Create `src/pages/404.astro`
- Step 2 / 3 — Verify the build emits `dist/404.html`
- Step 3 / 3 — Commit `add-404-page`

## Steps

### Step `1 / 3` — Create 404 Page

Create `$ART_MD_WEB/src/pages/404.astro`.

In Astro, a page at `src/pages/404.astro` is emitted as `dist/404.html` — that exact filename is what CloudFront requests, so do not nest it in a route directory.

The page must:

- Import and use `PageLayout` from `../layouts/PageLayout.astro`, so it gets the site header, `main` wrapper, and site footer like the other content pages.
- Wrap its content in a single `<section class="main-section">`, matching the layout classes used by the home and about pages. Do not introduce new global CSS for this page.
- Render an `<h1>` reading `Page not found`.
- Render a short paragraph explaining that the requested page does not exist.
- Render a link back to `/` so the visitor is not stranded. Use the existing link styling — do not add inline styles or a new class.

Copy the frontmatter style used by `$ART_MD_WEB/src/pages/about.md` if the layout requires a `layout` or `title` entry; read that file first and match it.

### Step `2 / 3` — Verify the Build Emits `dist/404.html`

Run from the `$ART_MD_WEB` root:

```bash
npm run build
ls -l dist/404.html
```

Expected outcome: the build reports three pages (`/about/index.html`, `/index.html`, `/404.html`) and `dist/404.html` exists on disk.

If `dist/404.html` is absent, the file was not placed at `src/pages/404.astro`. Fix the path and rebuild. Do not proceed to the commit step while the file is missing.

Note: this step verifies the build artefact only. The page reaches visitors on the next deploy; do not run `aws s3 sync` in this iteration.

### Step `3 / 3` — Commit `add-404-page`

---

#### Commit: `add-404-page`

**Policy:** NOPUSH — Agent MUST create the commit and proceed to the next step but MUST NOT push to the remote repository.

**Message:**

```
build(art-md-web): Add 404 page for unknown routes

- Create `src/pages/404.astro` on `PageLayout` so the build emits `dist/404.html`.
- Link back to the home page and match the design POC layout classes.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that the commit was created and **not** pushed, per the `NOPUSH` policy.
- Verify that `$ART_MD_WEB/src/pages/404.astro` exists, uses `PageLayout`, and contains a `main-section` wrapper.
- Verify that the page contains a link back to `/`.
- Verify that no new global CSS was added to `$ART_MD_WEB/src/styles/global.css` in this commit.
- Verify that `dist/404.html` is emitted by the build.
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.
