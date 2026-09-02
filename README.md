# Artificials

> Generate and manage (Art)ificial Driven Development environments.

A collection of tools and resources to generate and manage knowledge artefacts and agent instructions.

## Projects

| Project            | Guide                                  | Backlog                                      |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| Artificials (root) | `_guide.md`                            | `NONE`                                       |
| POC Parse          | `art-js/cli/poc-parse/_guide.md`       | `_backlog/1-done/plan-poc-parse/` (archived) |
| Art Mantras        | `artisans/apps/art-mantras/_guide.md`  | `artisans/apps/art-mantras/_backlog/`        |
| Workspace CLI      | `art-domains/cli/workspace/_guide.md`  | `art-domains/cli/workspace/_backlog/`        |
| Art JS             | `art-js/_backlog/_parking-lot.md`      | `art-js/_backlog/`                           |
| Art Domains        | `art-domains/_backlog/_parking-lot.md` | `art-domains/_backlog/_architect.md`         |

## Scripts

- **$** `npm run build` — Bundle all packages for production.
- **$** `npm run lint` — Lint all packages.
- **$** `npm run ci` — Full CI pass (lint + build + test).

## Setup

- **Serve a micro app** — each app under `artisans/apps/` is vanilla HTML/CSS/JS with a single `serve` script.
- **Scaffold by cloning practices in neighbours** — when adding a new package of **app** type, its `package.json` is very different from the lib/cli packages.

## License

MIT License

Copyright (c) 2026 Noodlestan https://noodlestan.org/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
