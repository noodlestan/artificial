# Instructions: `add-about-page`

**Plan:** `home-content-and-about-page`

**Iteration Id:** `add-about-page`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute these instructions. Your mode must be `worker` before you start changing files.

These are your instructions.

RULE: If at any point you are instructed to **REPORT A BLOCKER** or you encounter a commit with `policy` set to `MANUAL` execute the instruction in the "## How to Report Back to the Delegator" section below and STOP processing any other instructions.

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing the instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the `render-template` skill with the `.agents/domains/plans/templates/instructions-report.tart` to render your report and write it next to this instruction file: `plan-home-content-and-about-page/instructions/add-about-page__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `add-about-page`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

## Path Variables

| Variable      | Resolved Path                      | Purpose                                  |
| ------------- | ---------------------------------- | ---------------------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root directory                 |
| `$PROJECT`    | `$WORKSPACE/checkouts/artificials` | Artificials project checkout             |
| `$ART_MD_WEB` | `$PROJECT/apps/art-md-web`         | Art MD Website Astro package             |
| `$ART_MD`     | `$WORKSPACE/checkouts/art-md`      | Art MD project checkout — content source |
| `$ART_JS`     | `$WORKSPACE/checkouts/art-js`      | Art JS project checkout — content source |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instructions file is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is mandatory.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instructions file to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `add-about-page`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Create an about page for the Art MD Website at `src/pages/about.astro` following the about page outline: `## intro`, `## wip`, `## architecture`, and `## contribute` sections.

## Mandatory Reading

- `$ART_MD_WEB/_guide.md` (Guide) — package operations and layout.
- `$ART_MD/_records/project.art` (Record) — Art MD project purpose and description.
- `$ART_MD/_guide.md` (Guide) — Art MD project overview.
- `$ART_MD/architecture/index.md` (Architecture) — Art MD architecture index.
- `$ART_MD/architecture/components.md` (Architecture) — Art MD components and relationships.
- `$ART_JS/architecture/index.md` (Architecture) — Art JS architecture index.
- `$ART_JS/architecture/components.md` (Architecture) — Art JS components and relationships.
- `$PROJECT/_records/project.art` (Record) — Artificials project record (Application: Art MD Website SCAFFOLD).
- `$PROJECT/_roadmap/3-now/milestone-art-md-hello-word/milestone.md` (Milestone) — current milestone and phases.
- `$PROJECT/_records/repository.art` (Record) — Artificials repository record.
- `$ART_MD/_records/repository.art` (Record) — Art MD repository record.
- `$ART_MD/_records/license.art` (Record) — Art MD license record.

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

- Step 1 / 2 — Create `src/pages/about.astro`
- Step 2 / 2 — Commit `add-about-page`

## Steps

### Step `1 / 2` — Create About Page

Create `$ART_MD_WEB/src/pages/about.astro` with the about page outline sections. Do NOT write copy from memory — author the content from the mandatory reading sources.

Follow the about page outline:

- **`## intro`** — intro section describing what Art MD is and what the site hosts. Source from `$ART_MD/_records/project.art` (purpose and description) and `$ART_MD_WEB/_records/package.art`.
- **`## wip`** — WIP section listing current status and what is being built. Source from `$PROJECT/_records/project.art` (Application: Art MD Website SCAFFOLD) and the milestone phases.
- **`## architecture`** — architecture section describing the Art MD / Art JS pipeline and components. Source from `$ART_MD/architecture/index.md`, `$ART_MD/architecture/components.md`, `$ART_JS/architecture/index.md`, and `$ART_JS/architecture/components.md`.
- **`## contribute`** — contribute section with links to repositories, guides, and license. Source from `$ART_MD_WEB/README.md`, `$PROJECT/_records/repository.art`, `$ART_MD/_records/repository.art`, and `$ART_MD/_records/license.art`.

Use the existing `Layout.astro` layout (the site header is added in a later iteration). Ensure the page builds.

### Step `2 / 2` — Commit `add-about-page`

---

#### Commit: `add-about-page`

**Policy:** AUTONOMOUS — Agent should commit autonomously, push, and proceed to the next step.

**Message:**

```
feat(art-md-web): Add about page to Art MD website.
```

---

## Final Verification

**Instructions:**

- Verify that commits have been executed and pushed (or not pushed) according to the commit's policy.
- Verify that `src/pages/about.astro` exists and renders the four outline sections (`## intro`, `## wip`, `## architecture`, `## contribute`).
- Verify that the `/about` route builds and renders.
- Execute the **Verifying Completion** step as defined in the "Operating Instructions" section.
- Report according to the "How to Report Back to the Delegator" instructions.
