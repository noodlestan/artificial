# Artificials

Umbrella project for shared resources and websites. Hosts the Art JS Website, Workspace CLI Website, and other shared resources.

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

### Operating Instructions: Verifying Commit

**Instructions:**

Runs automatically on pre-commit hook (from the repository root):

```bash
npm run ci # lint, build and test
```

### Operating Instructions: Verifying Completion

**Instructions:**

Run from the repository root (monorepo):

```bash
npm run ci # lint, build and test
```
