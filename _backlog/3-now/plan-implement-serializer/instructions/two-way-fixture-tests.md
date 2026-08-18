# Instructions: `build(md-art-roundtrip): extend fixture tests to roundtrip both directions`

**Plan:** `implement-serializer`

**Commit.id:** `two-way-fixture-tests`

**Commit.message:**

```commit
build(md-art-roundtrip): extend fixture tests to roundtrip both directions

- Extend parser fixture suite to test both directions: `source.md → art.json` and `art.json → parsed.md`
- Diff `source.md` against `parsed.md`; report the diff as overhead
```

NOTE: Before committing, update the body of the commit message to reflect the changes made as bullet points.

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Path Variables

| Variable                  | Path                                            | Purpose                                    |
| ------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `$WORKSPACE`              | Current working directory.                      | explained in `$WORKSPACE/\_guide.md`.      |
| `$PROJECT`                | Provided with prompt                            | Repository root for all code changes       |
| `$PACKAGE_PARSER`         | `$PROJECT/art-js/libs/parser/`                  | Package being modified in this instruction |
| `$PACKAGE_SERIALIZER`     | `$PROJECT/art-js/libs/serializer/`              | Dependency (serialize function)            |
| `$FIXTURES`               | `$PACKAGE_PARSER/test/fixtures/`                | Fixture inputs and snapshots directory     |
| `$FIXTURE_SNAPSHOT_CHECK` | `$PACKAGE_PARSER/scripts/run-snapshot-check.ts` | Script to extend for two-way testing       |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `two-way-fixture-tests`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Prove lossless roundtrip by testing both directions in the fixture suite: forward (`source.md → art.json` via parser) and return (`art.json → parsed.md` via serializer). Diffs between original source and serialized output are logged as overhead — they measure how close the roundtrip is to lossless, not a pass/fail signal.

## Mandatory Reading

- `$PACKAGE_POC/_pseudo.md` — parser architecture; the artast shape the serializer inverts
- `$FIXTURE_SNAPSHOT_CHECK` — existing snapshot check script to extend
- `$FIXTURES` — fixture inputs and snapshots

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from `$PROJECT` repository directory:

```bash
npm ci # to install dependencies.
```

## Changes

This iteration extends the snapshot check script to test both directions:

1. Extend `$FIXTURE_SNAPSHOT_CHECK` with a return direction that serializes snapshot JSON back to markdown
2. Diff `source.md` against `parsed.md` and log differences as overhead (informational, not failure)
3. When `--write` is provided, also write `{fixture}.parsed.md` for debugging

## Workflow

You are going to perform a series of steps and check status after each one.

1. Extend the snapshot check script for two-way testing
2. Fix until all fixtures pass the roundtrip test

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

### Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Steps

### Step `1 / 2` — Extend the snapshot check script for two-way testing

Modify `$FIXTURE_SNAPSHOT_CHECK` to add a return direction test after the existing forward test.

**Contract — snapshot-check ↔ serializer:**

The snapshot-check script imports `serialize` from `@art-js/artificial-serializer`.
For each fixture pair it:

1. Reads the `.art.json` snapshot as an `ArtDocument`
2. Calls `serialize(artDocument)` → `parsed` (markdown string)
3. Reads the original `source.md` input
4. Diffs `source` against `parsed` — logs differences as overhead
5. When `--write` is provided, writes `{fixture}.parsed.md` next to the snapshot for debugging (compare with `{fixture}` — the original art/md file)
6. Fails only if `serialize` throws or returns empty output

The forward direction (`source.md → art.json`) remains unchanged — it compares `parse(inputText)` against the snapshot.

#### Pseudo: return direction in snapshot-check

```pseudo
for each { input, snapshot } in fixturePairs {
  // --- existing forward test ---
  const inputText = readFile(input)
  const art = parse(inputText)
  assert jsonEq(art, readSnapshot(snapshot))

  // --- new return direction ---
  const artDocument = readSnapshot(snapshot)   // ArtDocument (artast)
  let parsed: string
  try {
    parsed = serialize(artDocument)            // artast → mdast → markdown
  } catch (err) {
    console.error(`FAIL ${basename(input)} — serializer threw: ${err.message}`)
    failed += 1; continue
  }

  if (!parsed || parsed.length === 0) {
    console.error(`FAIL ${basename(input)} — serializer returned empty output`)
    failed += 1; continue
  }

  const source = readFile(input)
  const diffLines = diff(source, parsed)      // simple line-by-line diff
  if (diffLines.length === 0) {
    console.info(`LOSSLESS ROUNDTRIP ${basename(input)}`)
  } else {
    console.warn(`ROUNDTRIP DIFF ${basename(input)}: ${diffLines.length} lines differ`)
  }

  // --- write parsed.md for debugging when --write is provided ---
  if (process.argv.includes('--write')) {
    const parsedPath = snapshot.replace('.art.json', '.parsed.md')
    writeFile(parsedPath, parsed)
  }
}
```

**Implementation notes:**

- Import `serialize` from `@art-js/artificial-serializer` (add to `$PACKAGE_PARSER/package.json` as devDependency if not already)
- The `diff` function is a simple line-by-line comparison — log differing lines, count them
- The forward test remains unchanged
- The return direction is additive: it reads the snapshot, serializes, and compares with the original input
- When `--write` is provided, also write `{fixture}.parsed.md` — this lets you diff it against the original `{fixture}` manually

**Extra validation commands:**

```bash
cd $PACKAGE_PARSER && npm run test
```

If one or more fixtures fail to pass the roundtrip test, move to Step `2 / 2`.

### Step `2 / 2` — Fix until all fixtures pass the roundtrip test

If any fixture failed in Step 1, debug and fix the serializer until all fixtures pass.

**Debugging strategies:**

- Run with `--write` to generate `{fixture}.parsed.md` files — diff them against the original `{fixture}` to see exactly what changed
- Grep the snapshot JSON for the art surrounding known text nodes — verify the ToMdast functions handle the construct correctly
- Start with the simplest fixture (fewest construct types) and work up
- If a specific construct fails, check its `create*ToMdast` function in `$PACKAGE_CONSTRUCTS/src/constructs/`
- Check that `mdast-util-to-markdown` is handling the mdast nodes correctly — the output mdast may be valid but render to unexpected markdown

**Extra validation commands:**

```bash
cd $PACKAGE_PARSER && npm run test
```

## Final Verification

**Sanity check:**

- The parser snapshot check script runs both forward and return directions
- The return direction serializes the snapshot JSON back to markdown
- The diff between original source and serialized output is logged as overhead
- When `--write` is provided, `{fixture}.parsed.md` files are written for debugging
- All existing fixture tests still pass

**Verification:**

Run from `$PACKAGE_PARSER` package directory:

```bash
npm run lint:fix && npm run lint && npm run build && npm run test
```

Runs on pre-commit hook from the repository root:

```bash
cd $PROJECT && npm run ci # lint, build and test at repository level
```

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `$PROJECT/_backlog/3-now/plan-implement-serializer/instructions/two-way-fixture-tests__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `two-way-fixture-tests`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
