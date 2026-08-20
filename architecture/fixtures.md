# Fixture Architecture

## Fixture Files

Parser fixtures live under `$PROJECT/art-js/libs/parser/test/fixtures/`.

Each Markdown or Art source fixture has a parser snapshot with the same source filename plus `.json`:

```text
000-hello-world.md
000-hello-world.md.json
```

The source file is the behaviour under test. The JSON file is the expected Art document produced by the parser.

Numbered fixtures are the maintained, focused test sequence. Their names communicate the subject and intended progression:

- `000` to `007`: natural blocks and their nested content.
- `010` to `013`: sections and section boundaries.
- `020` to `023`: FieldBlock capture and boundaries.
- `030` to `032`: FieldInline capture and inline content.

Each numbered fixture should be small, focused on one parser or serializer behaviour, and suitable for round-trip testing.

Files beginning with `_` are exploratory or reference fixtures. They are useful for parser inspection and architectural insight, but are not round-trip ready. The serializer test skips them, and their snapshots should not be regenerated casually.

Some fixtures contain an explicit `WIP:` paragraph. That marker records an unresolved case in the fixture itself; it is not a command to rewrite the expected behaviour without inspection.

## Parser Test

The parser test command is defined in `$PROJECT/art-js/libs/parser/package.json`:

```bash
cd $PROJECT/art-js/libs/parser
npm run test-parser
```

The command runs `$PROJECT/art-js/libs/parser/scripts/test-parser.ts` against all fixture pairs.

Arguments:

- `--fixture {pattern}` limits execution to source filenames containing the pattern.
- `--write` writes each successful parse result to its `.json` snapshot.
- `--debug-write` writes each successful parse result to `.debug.json` without replacing the normal snapshot.

The parser test reports each fixture as `PASS` or `FAIL`, reports parse errors or snapshot mismatches, and prints totals and timing. A non-zero exit status means at least one parser fixture failed.

## Serializer Test

Run:

```bash
cd $PROJECT/art-js/libs/parser
npm run test-serializer
```

The serializer test reads the parser snapshots, serializes them to Markdown, and compares the result with the source fixture. Underscore fixtures are skipped.

Arguments:

- `--fixture {pattern}` limits execution to source filenames containing the pattern.
- `--debug-write` writes the serialized Markdown to a `.parsed.md` file when a round-trip diff exists.

The current implementation uses `--debug-write` for serializer debugging. The shorter `--debug` name is a documentation/API WIP and is not currently accepted.

The command reports `LOSSLESS ROUNDTRIP` for matching fixtures and `ROUNDTRIP DIFF` with line-level differences for mismatches. Its script currently reports failures but retains a zero process exit status while the suite is still WIP.

## How to Debug and Update Snapshots

1. Read the source fixture and its `.json` snapshot together.
2. Compare the expected construct hierarchy with the source mdast structure.
3. Scope the test before changing anything:

```bash
npm run test-parser -- --fixture 004-natural-block-with-list
npm run test-serializer -- --fixture 004-natural-block-with-list
```

4. Generate a parser debug snapshot when the in-memory parser result needs inspection:

```bash
npm run test-parser -- --fixture 004-natural-block-with-list --debug-write
```

This writes `004-natural-block-with-list.md.debug.json`. Compare it with the normal `.json` snapshot and do not overwrite the normal snapshot while diagnosing.

5. Generate a serializer debug Markdown file when the round-trip output needs inspection:

```bash
npm run test-serializer -- --fixture 004-natural-block-with-list --debug-write
```

This writes `004-natural-block-with-list.md.parsed.md` when a diff exists. Compare it with the original `.md` fixture.

## How to Update Snapshots

Only update a snapshot after inspecting the source, the current snapshot, and any debug output.

Use a narrow fixture pattern:

```bash
npm run test-parser -- --fixture 004-natural-block-with-list --write
```

Then run the scoped parser and serializer tests again. For a group, choose a pattern that cannot accidentally match underscore fixtures. Review the diff before staging. Never use an unscoped `--write` when exploratory `_` snapshots or user-authored debug files are in the worktree.
