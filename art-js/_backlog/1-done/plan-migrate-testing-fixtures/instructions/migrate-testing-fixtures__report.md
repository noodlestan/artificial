# Sub-Agent REPORT (#producer)

**Plan:** `migrate-testing-fixtures`

**Instruction Id:** `migrate-testing-fixtures`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File | Change |
|------|--------|
| `art-js/libs/parser/test/fixtures/` | 31 fixture files copied (8 `.art` + 8 `.md` inputs, 15 `.art.json` snapshots) — byte-identical to poc-parse source |
| `art-js/libs/parser/scripts/test-fixtures.ts` | Self-contained fixture runner — imports `parse` from parser entry point `../src/index` (not from poc-parse), `FIXTURES_DIR` → `../test/fixtures`, identical output format to POC |
| `art-js/libs/parser/package.json` | `"test"` script wired to `npx tsx scripts/test-fixtures.ts`; `tsx ^4.8.1` and `@types/node ^25.9.3` added to devDependencies |
| `package-lock.json` | Regenerated via `npm install` — tsx + @types/node resolved |

### Verification

- `npm run test` in parser: 16 fixtures PASS, `All fixtures passed!`, exit 0
- `npm run lint` in parser: prettier + eslint + tsc --noEmit all pass
- `npm run build` in parser: vite build succeeds
- Pre-commit hook: full CI (clean + extract + lint + build + test across all 12 packages) passed
- Diff confirms: 31 fixture files byte-identical to poc-parse source

### Commit

- **Hash:** `6ecfbc1`
- **Message:** `build(md-art-roundtrip): migrate testing fixtures to parser package`
- **Scope:** parser fixtures + runner + package.json + regenerated lockfile only

## Blockers

None.

## Feedback

### For the planner

**Ambiguity: `../src/index.ts` import vs tsconfig constraints**

- **Where:** `## Changes` section of `migrate-testing-fixtures.md`, line 48: the runner code block shows `import { parse } from '../src/index.ts';`
- **Problem:** The root tsconfig (`repos/artificial/tsconfig.json`) does not enable `allowImportingTsExtensions`, so `tsc --noEmit` rejects `.ts` extension imports. The runner was created with `import { parse } from '../src/index';` (no extension) to satisfy typechecking. The instruction also requires `npm run lint` (which runs `tsc --noEmit`) to exit 0, creating a direct contradiction with the `.ts` extension in the code block.
- **Decision:** Used `../src/index` (no extension) — the simplest reading that satisfies both the self-contained requirement (no poc-parse import) and the lint/typecheck pass requirement.
- **Snippet:** The instruction's code block should use `import { parse } from '../src/index';` (without `.ts` extension). Phase 3 (`plan-migrate-and-verify`) should note that the entry-point stub is at `../src/index` not `../src/index.ts`.

**Note for phase 3 (`plan-migrate-and-verify`):** The runner's `parse()` call is the entry-point stub returning `undefined`. Phase 3 will:
1. Replace the `parse()` stub with a real implementation that reads the file and parses content: `const content = fs.readFileSync(filePath, 'utf-8'); const document = parse(content);`
2. Remove the `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above `parseFixture` once the `filePath` parameter is used.
3. The import path is `../src/index` (no `.ts` extension) — phase 3 must preserve this for tsc compatibility.

### For the technical writers

**Plan vs instruction divergence on import source**

- **Where:** `plan.md` line 62 says the runner "imports `parse` from the POC source by relative path" (`../../../cli/poc-parse/src/parse/parse`); the instruction says "it MUST NOT import anything from `poc-parse/**`, not even `parse`" and imports from `../src/index`.
- **Problem:** The plan's knowledge section contradicts the instruction's changes section. The instruction takes precedence (it is the authoritative execution document), but the plan should be updated to reflect the self-contained runner design.
- **Decision:** Followed the instruction. The plan's line 62 and line 139 should be updated to match.

### For the crew

The fixture runner runs with zero parse overhead (the stub returns `undefined` instantly) — this is expected and proves the wiring, not parsing correctness. Phase 3 swaps in the real parser.
