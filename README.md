# Artificial

> Generate and manage (Art)ificial Driven Development environments.

A collection of tools and resources to generate and manage agent instructions. Includes the Art Language, and a (reactive) pipeline for bundling, compiling, validating, parsing, and locating resources.

## Packages

| namespace | dir | package | description |
| --- | --- | --- | --- |
| `@art-js` | `art-js/spec/` | `@art-js/artificials-spec` | Art Language specification |
| `@art-js` | `art-js/libs/primitives/` | `@art-js/artificials-primitives` | Foundational types and utilities |
| `@art-js` | `art-js/libs/parser/` | `@art-js/artificials-parser` | Parses context files and art modules |
| `@art-js` | `art-js/libs/validator/` | `@art-js/artificials-validator` | Validates parsed modules |
| `@art-js` | `art-js/libs/bundler/` | `@art-js/artificials-bundler` | Bundles Art modules |
| `@art-js` | `art-js/libs/program/` | `@art-js/artificials-program` | Executes parsed Art modules |
| `@art-js` | `art-js/cli/bin/` | `@art-js/artificials-bin` | CLI for pipeline commands |
| `@art-js` | `art-js/cli/dev-server/` | `@art-js/artificials-dev-server` | Local dev server for Art modules |
| `@art-js` | `art-js/cli/watcher/` | `@art-js/artificials-watcher` | Watches for changes, triggers rebuilds |
| `@art-js` | `art-js/cli/poc-parse/` | `@art-js/poc-parse` | POC parser spike |
| `@artisans` | `artisans/apps/art-mantras/` | `@artisans/art-mantras` | Interactive A.R.T.I.F.I.C.I.A.L.S curator |

## Scripts

- **$** `npm run build` — Bundle all packages for production.
- **$** `npm run lint` — Lint all packages.
- **$** `npm run ci` — Full CI pass (lint + build + test).

## Setup

- **Serve a micro app** — each app under `artisans/apps/` is vanilla HTML/CSS/JS with a single `serve` script.
- **Scaffold by cloning practices in neighbours** — when adding a new package of **app** type, its `package.json` is very different from the lib/cli packages.

## MIT License https://noodlestan.mit-license.org/

Copyright (c) 2026 Noodlestan https://noodlestan.org/
