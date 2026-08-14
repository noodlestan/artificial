# Guide: Art Mantras

A micro app that generates mantras through a 12-step race.

## Recommend Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: project overview, layout, setup, verification.
- `_wip.md` — the parking lot and progress tracker — open actions, questions and blockers (no dones!).
- `_architect.md` — the architecture — Why, What, How, Follow-ups (no code).
- `_pseudo.md` — the function declarations — name, params, responsibility, pseudo code — entry point first, grouped by layer.

## Repository Layout

```
_backlog/           — plans, instructions, reports
src/                — application source
```

## Setup

Run at root of repository, not per package:

```bash
npm ci # to install dependencies.
```

## Verification

Run per package modified:

```bash
npm run serve # to start the development server
```

## Deployment

Build and deploy to AWS:

```bash
npm run build                                    # build dist/ artifacts
aws s3 sync dist/ s3://art-mantras-noodlestan-org-prod --delete
aws cloudfront create-invalidation --distribution-id E3MR81TGFNVD2W --paths "/*"
```

**Environments:**

- **Production:** https://art-mantras.noodlestan.org (bucket: `art-mantras-noodlestan-org-prod`, distribution: `E3MR81TGFNVD2W`)
- **Staging:** https://stage-art-mantras.noodlestan.org (bucket: `art-mantras-noodlestan-org-stage`, distribution: `EVVYS72BO8V4I`)

**Infrastructure:** Managed in `$WORKSPACE/repos/terraform/domains/noodlestan/websites/art-mantras/`

## Records Management

The workspace maintains ops records at `ops/records` detailing project configurations, namespaces, packages, dependencies, scaffolding and more.

## References

The workspace maintains an architecture reference at `architecture/index.md` and decision records at `architecture/records/adr`.

## Planning Workflow

This project plans its work with the plan workflow defined in `$WORKSPACE/.agents/domains/plans/`.

Each project manages its own backlog in a local `_backlog/` directory with a `_guide.md` entry point containing layout, references, verification, and workflows.

The short-term focus is captured in `_wip.md` – actionable items, pending questions, blockers, and follow-ups (no done items).

The requirements, use cases, and principles are captured in `_architect.md`, along with approach to work sequence, iterations, and milestones.

Delegation runs via `_backlog/plan-art-mantras/plan.md` and its instruction files.

**Reading order:** `_guide.md` → `_wip.md` → `_architect.md` → `_pseudo.md`
