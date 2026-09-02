# Guide: Artificials

> Host and manage the Artificials roadmap, and the docs and demos applications.

Monorepo containing the Artificials coordination roadmap, docs and demo applicationsa and their backlogs, and shared tooling and content.

Umbrella project; Coordinates other projects with Workflow: Roadmapping from one project-wide roadmap. Manages application backlogs with Workflow: Planning Work.

## Recommended Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: system overview, layout, setup, verification.

## Repository Layout

```
_guide.md           — this file
_records/           — project, repository, license, dependencies, scaffolders, and scripts records
```

## Projects

Managed projects are hosted in dedicated repositories, each with its own guide and backlog:

| Project     | Guide                                  | Backlog                               |
| ----------- | -------------------------------------- | ------------------------------------- |
| Art JS      | `art-js/_backlog/_parking-lot.md`      | `art-js/_backlog/`                    |
| Art Domains | `art-domains/_backlog/_parking-lot.md` | `art-domains/_backlog/_architect.md`  |
| Artisans    | `artisans/apps/art-mantras/_guide.md`  | `artisans/apps/art-mantras/_backlog/` |

## Records Management

Records are co-located with the resources they describe in `_records/` directories:

- **Project:** `_records/project.art`
- **Repository:** `_records/repository.art`
- **License:** `_records/license.art`
- **Dependencies:** `_records/dependencies/`
- **Scaffolders:** `_records/scaffolders/`
- **Scripts:** `_records/scripts/`

## Operating Instructions

### Operating Instructions: Setting Up

**Instructions:**

Run from the repository root (monorepo):

```bash
npm ci # to install dependencies.
```

### Operating Instructions: Verifying Completion

**Instructions:**

Runs automatically on pre-commit hook (from the repository root):

```bash
npm run ci # lint, test and build
```
