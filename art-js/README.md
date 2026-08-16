# Art JS

> Tools for working with Art files.

Art Language and modules implementation. The (reactive) pipeline flows from bundler to compiler to validator to parse to source.

## Packages

### Libraries

- [Artificial Bundler](./libs/bundler/README.md) – Consumes a program and generates bundle output files.
- [Artificial Parser](./libs/parser/README.md) – Parses context files and art modules into structured representations.
- [Artificial Primitives](./libs/primitives/README.md) – Core types and utility functions used across all artificials packages.
- [Artificial Program](./libs/program/README.md) – Represents a reactive program with dependency and program graphs.
- [Artificial Validator](./libs/validator/README.md) – Validates parsed modules against structural and semantic rules.

### CLI

- [Artificial Bin](./cli/bin/README.md) – CLI binary that exposes all core pipeline commands.
- [Artificial Dev Server](./cli/dev-server/README.md) – Development server for art and context files.
- [Artificial Language Server](./cli/language-server/README.md) – LSP server for art and context files.
- [Artificial Tools](./cli/tools/README.md) – Deterministic operations for agents to work with art and context files.
- [Artificials Watcher](./cli/watcher/README.md) – Used by cli tools to monitor source code and react to events.
