---
layout: ../layouts/PageLayout.astro
title: About Art MD
description: Art MD expresses structured data in Markdown with an extensible language that enables human and machine authoring at scale.
---

# About Art MD

Art MD expresses structured data in Markdown with an extensible language that enables human
and machine authoring at scale and automated transformations.

Art MD consists of a language specification and a set of JavaScript libraries for parsing
Markdown into an MDAST-derived AST, with an open construct registry. The libraries provide
parsing, validation, transformation, and serialisation of Art MD content back to Markdown.

## Architecture

Art MD is implemented as a Markdown dialect: a parser and a serialiser operate on a set of
constructs to translate between Markdown and Art MD's structured representation.

- **Core libraries** — Primitives (base types and utilities), [Constructs](https://github.com/noodlestan/art-md/blob/main/libs/constructs/README.md) (the contract
  layer binding parser and serialiser, with an open registry), [Parser](https://github.com/noodlestan/art-md/blob/main/libs/parser/README.md) (Markdown into an
  ArtDocument), [Serialiser](https://github.com/noodlestan/art-md/blob/main/libs/serializer/README.md) (ArtDocument back into Markdown), and Codec (document-level
  parsing and serialisation).
- **CLI surface** — [Bin](https://github.com/noodlestan/art-md/blob/main/cli/bin/README.md) (parse, serialise, validate) and [Codec Tests](https://github.com/noodlestan/art-md/blob/main/cli/codec-tests/README.md) (fixture-based
  roundtrip suite).
- **Spec** — the Art language [specification](https://github.com/noodlestan/art-md/blob/main/spec/README.md), written in Art itself.

## WIP

This site is part of the [Artificials](https://noodlestan.github.com/) project.

Work is ongoing in several areas of the project:

- [@art-js](https://github.com/noodlestan/art-js) — The goal is to provide a modular pipeline for authoring, validating, and processing Art MD files as modules. This includes a dev server, tools, and language server. Most Art JS packages are currently still at scaffold status. Next up is:
  - `records` — provide an API to assert the presence of records in Art content, extract them from a source file, and write them back.
  - `modules` — provide an API to validate an Art document as a module.
- [@art-md (more) Constructs](https://github.com/noodlestan/art-md/tree/main/spec/grammar/constructs) — implement the next set of
  artificial constructs — example blocks, inline examples, vocabulary definitions,
  identifiers, and context symbols.
- [@art-work](https://github.com/noodlestan/art-work) — A workspace CLI for managing multi-repository development environments for parallel planning and execution.
- [@art-lib](https://github.com/noodlestan/art-lib) — provide composable units for CLI experiences, driven by use cases surfaced in the CLIs under development.

## Contribute

Art MD lives in its own repository and this site lives in the Artificials' umbrella repository,
which also coordinates the roadmap.

- [Art MD on GitHub](https://github.com/noodlestan/art-md) — the language specification
  and JavaScript libraries.
- [Artificials on GitHub](https://github.com/noodlestan/artificials) — the project hosting
  this website and its roadmap.
- [Noodlestan on Discord](https://discord.gg/4MBbPK7sU) — waiting for you there.
