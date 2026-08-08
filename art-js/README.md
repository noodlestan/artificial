# Art JS

> Tools for working with Art files.

Art Language and modules implementation. The (reactive) pipeline flows from bundler to compiler to validator to parse to source.

## Packages

### Libraries

- [Artificials Bundler](./libs/bundler/README.md) – Consumes a program and generates bundle output files.
- [Artificials Parser](./libs/parser/README.md) – Parses context files and art modules into structured representations.
- [Artificials Primitives](./libs/primitives/README.md) – Core types and utility functions used across all artificials packages.
- [Artificials Program](./libs/program/README.md) – Represents a reactive program with dependency and program graphs.
- [Artificials Validator](./libs/validator/README.md) – Validates parsed modules against structural and semantic rules.

### CLI

- [Artificials Bin](./cli/bin/README.md) – CLI binary that exposes all core pipeline commands.
- [Artificials Dev Server](./cli/dev-server/README.md) – Development server for art and context files.
- [Artificials Language Server](./cli/language-server/README.md) – LSP server for art and context files.
- [Artificials Tools](./cli/tools/README.md) – Deterministic operations for agents to work with art and context files.
- [Artificials Watcher](./cli/watcher/README.md) – Used by cli tools to monitor source code and react to events.
