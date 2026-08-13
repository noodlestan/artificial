# Sub-Agent REPORT

**Plan:** `poc-parse`

**Instruction Id:** `core-record-schema`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File | Description |
| --- | --- |
| `art-js/cli/poc-parse/src/parse/types.ts` | New file — core record schema types: `Point`, `Position`, `RecordBase`, `SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`, `Document`, open registries (`BlockConstructMap`, `InlineConstructMap`, `ConstructMap`), and derived unions (`BlockContent`, `InlineContent`, `Construct`). Types only, no runtime code. |

### Verification

- `npx tsc --noEmit` in `art-js/cli/poc-parse/` — exit 0, no errors.
- `git status` confirmed exactly one new file: `art-js/cli/poc-parse/src/parse/types.ts`.
- Schema matches prescribed shape: `construct` discriminator, `kind`/`name` on SectionBlock, recursive `children`/`value`, three open registries with derived unions, `position?` on every record, NO `depth`/`parent` fields.

### Commit

- Commit `fd67848` on `main`: `poc-parse: add core record schema types`
- Pushed to `origin/main` (`1c40d70..fd67848`).

## Blockers (if any)

None.

## Feedback

### For the planner

**F1 — Stale path for `_research.md`**

- **Where:** `## Mandatory Reading` in `core-record-schema.md`, line 32: `artificials/records/adr/_research.md`.
- **Problem:** The file does not exist at that path. The actual location is `artificials/ops/records/adr/_research.md`. The `records/` directory lives under `ops/`, not directly under the artificial root. The same stale path appears in `plan.md` (line 21, 37) and `_architect.md` (line 11).
- **Decision:** Located the file at `artificials/ops/records/adr/_research.md` and read it. No impact on implementation — the schema is fully prescribed in the instruction.
- **Ready-to-apply snippet for `plan.md`:**

```diff
- - [Substrate Research ADR](artificials/records/adr/_research.md)
+ - [Substrate Research ADR](artificials/ops/records/adr/_research.md)
```

```diff
- - `artificials/records/adr/_research.md` — substrate research behind the spike.
+ - `artificials/ops/records/adr/_research.md` — substrate research behind the spike.
```

- **Ready-to-apply snippet for `_architect.md`:**

```diff
- Whether the parse slice consumes micromark directly or declares indirections (e.g. `mdast-util-from-markdown`) is a spike decision; the research framing it is `records/adr/_research.md`.
+ Whether the parse slice consumes micromark directly or declares indirections (e.g. `mdast-util-from-markdown`) is a spike decision; the research framing it is `ops/records/adr/_research.md`.
```

### For the technical writers

No documentation issues found. The grammar construct `.art` files (`section-block.art`, `field-block.art`, `natural-block.art`, `tag.art`, `construct.art`) are consistent with the prescribed schema.

### For the crew

The dev loop is clean: `tsc --noEmit` resolves typescript from the repo root's `node_modules` via upward walk, no local dev deps needed. The type-only commit is 80 lines, zero runtime code.
