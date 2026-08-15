# Message for the Workspace-Tooling Architect

**From:** MD Art Roundtrip planning (Artificial repository)
**Date:** 2026-08-15
**Topic:** Accidental plural in `artificials-build` / `artificials-watch`

## Context

The `artificials-` plural across the `@art-js/*` package names is accidental. The Artificial repository is singularizing them to `artificial-` as milestone phase 0 (`plan-rename-packages`). The `artificials-build` and `artificials-watch` commands belong to your workspace-tooling package (`art-domains/cli/workspace`) and are deliberately excluded from the artificial-side rename.

## Request

Rename `artificials-build` → `artificial-build` and `artificials-watch` → `artificial-watch` in the workspace-tooling package.

## Implications

- Requires releasing a new version of the CLI and updating all consumers.
- Affected references found in the Artificial repository (do NOT rename these on the artificial side):
  - `art-domains/cli/workspace/_backlog/0-archive/2026-08-10-plan-workspace-split/instructions/extract-artificial.md` and its report
  - `art-js/cli/bin/README.md`, `art-js/cli/dev-server/README.md`, `art-js/cli/language-server/README.md`, `art-js/cli/tools/README.md`, `art-js/cli/watcher/README.md`
  - `art-js/cli/watcher/package.json`
  - `ops/records/scripts/artificials-cli-build.art`
  - `ops/records/packages/artificials-watcher.art`
  - `package-lock.json` (regenerate after the rename)

## Do Not Touch

`artificials-build` and `artificials-watch` (and their records) stay as-is in the Artificial repository until the workspace-tooling package handles them.
