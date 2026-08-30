# Noodlestan Artificial

A collection of tools and resources to generate and manage agent instructions. Includes the Art Language, and a (reactive) pipeline for bundling instructions.

## Recommended Reading

Agents SHOULD scan these files for definitions and resource locations when faced with uncertainty or ambiguity that may result from missing resources.

- `_guide.md` — this file: system overview, layout, records, and operating instructions.

## Repository Layout

```
_guide.md           — this file
_records/           — project, repository, license, dependencies, scaffolders, and scripts records
```

## Records Management

Records are co-located with the resources they describe in `_records/` directories:

- **Project:** `_records/project.art`
- **Repository:** `_records/repository.art`
- **License:** `_records/license.art`
- **Dependencies:** `_records/dependencies/`
- **Scaffolders:** `_records/scaffolders/`
- **Scripts:** `_records/scripts/`

## Operating Instructions

#### Operating Instructions: Setting Up

**Instructions:**

Run from the repository root (monorepo):

```bash
npm ci # to install dependencies.
```

#### Operating Instructions: Verifying Commit

**Instructions:**

Runs automatically on pre-commit hook (from the repository root):

```bash
npm run ci # lint, build and test
```

#### Operating Instructions: Verifying Completion

**Instructions:**

Run from the repository root (monorepo):

```bash
npm run ci # lint, build and test
```