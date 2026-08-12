# POC Parser Test Cases

Test cases for the artificials mdast-based parser. Run from `art-js/cli/poc-parse/`.

## Command

```bash
npx tsx src/parse/parse.ts <fixture-path>
```

## Fixtures

All fixtures are in `fixtures/` relative to this file.

---

## TC1 — SectionBlock with kind

**Fixture:** `fixtures/section-block.md`

**Input:** `### Routine: List Tasks`

**Expected output:**
- `SectionBlock` with `kind: "Routine"`, `name: "List Tasks"`

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/section-block.md | grep -A5 '"kind": "Routine"'
```

---

## TC2 — SectionBlock without kind

**Fixture:** `fixtures/section-block.md`

**Input:** `## Rules`

**Expected output:**
- `SectionBlock` with `name: "Rules"`, no `kind` field

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/section-block.md | grep -A3 '"name": "Rules"'
```

---

## TC3 — SectionBlock with tags

**Fixture:** `fixtures/section-block.md`

**Input:** `### Decision: Two Main Use Cases (#generator)`

**Expected output:**
- `SectionBlock` with `name: "Two Main Use Cases"`, `tags: [{ name: "generator" }]`

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/section-block.md | grep -A5 '"generator"'
```

---

## TC4 — FieldBlock single-line

**Fixture:** `fixtures/field-block.md`

**Input:** `**Purpose:** Generate and manage agent instructions.`

**Expected output:**
- `FieldBlock` with `name: "Purpose"`, `value` containing `NaturalBlock` with `value: "Generate and manage agent instructions."`

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/field-block.md | grep -A8 '"name": "Purpose"'
```

---

## TC5 — FieldBlock with backtick value

**Fixture:** `fixtures/field-block.md`

**Input:** `` **Canonical Name:** `@noodlestan/artificial` ``

**Expected output:**
- `FieldBlock` with `name: "Canonical Name"`, value contains backtick text

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/field-block.md | grep -A8 '"name": "Canonical Name"'
```

---

## TC6 — FieldBlock with list value

**Fixture:** `fixtures/field-block.md`

**Input:**
```markdown
**Dependencies:**

- Package Dependency Set: Build Tools
- Package Dependency Set: Project Tools
```

**Expected output:**
- `FieldBlock` with `name: "Dependencies"`
- `value` is array of `NaturalBlock` children (list items parsed)

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/field-block.md | grep -A15 '"name": "Dependencies"'
```

---

## TC7 — FieldBlock with code block value

**Fixture:** `fixtures/field-block.md`

**Input:**
```markdown
**Scripts:**

\`\`\`
npm run build
npm run test
\`\`\`
```

**Expected output:**
- `FieldBlock` with `name: "Scripts"`
- Value contains code block (type `code` with `lang`)

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/field-block.md | grep -A10 '"name": "Scripts"'
```

---

## TC8 — NaturalBlock catch-all

**Fixture:** `fixtures/section-block.md`

**Input:** `Lorem ipsum dolor sit amet.` (paragraph under `## Rules`)

**Expected output:**
- `NaturalBlock` with `value: "Lorem ipsum dolor sit amet."`

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/section-block.md | grep -A3 '"Lorem ipsum"'
```

---

## TC9 — Tags in prose detected

**Fixture:** `fixtures/section-block.md`

**Input:** `Content with (#generator) tag`

**Expected output:**
- Tag detected with `name: "generator"`

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/section-block.md | grep -B2 -A2 '"generator"'
```

---

## TC10 — Tags in code NOT detected

**Fixture:** `fixtures/markdown.md`

**Input:** Fenced code block containing `(#generator)`

**Expected output:**
- No Tag records from inside the code block

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/markdown.md | grep -c '"Tag"'
# Expected: count of tags only from prose, not from code
```

---

## TC11 — Code block preserves lang

**Fixture:** `fixtures/markdown.md`

**Input:** Fenced code block with ` ```javascript `

**Expected output:**
- NaturalBlock with raw value preserving the fences, OR structured code node

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/markdown.md | grep -A5 '"```javascript"'
```

---

## TC12 — List items parsed as children

**Fixture:** `fixtures/markdown.md`

**Input:**
```markdown
- Item one
- Item two
- Item three
```

**Expected output:**
- NaturalBlock with `children` array containing 3 items

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/markdown.md | grep -A10 '"Item one"'
```

---

## TC13 — Table preserved as NaturalBlock

**Fixture:** `fixtures/markdown.md`

**Input:** Markdown table

**Expected output:**
- NaturalBlock with raw table text

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/markdown.md | grep -A5 '| Name |'
```

---

## TC14 — Section nesting by heading level

**Fixture:** `fixtures/section-block.md`

**Input:** `# Section Block Fixtures` (level 1) containing `## Rules` (level 2) containing `### Routine: List Tasks` (level 3)

**Expected output:**
- Level 1 SectionBlock → child Level 2 SectionBlock → child Level 3 SectionBlock

**Verify:**
```bash
npx tsx src/parse/parse.ts fixtures/section-block.md | python3 -c "
import json, sys
data = json.load(sys.stdin)
outer = data['children'][0]
print(f\"Level 1: {outer['name']}\")
inner = outer['children'][0]
print(f\"  Level 2: {inner['name']}\")
innermost = inner['children'][0]
print(f\"    Level 3: {innermost['name']} kind={innermost.get('kind')}\")
"
```

---

## TC15 — Position objects clean

**Fixture:** `fixtures/markdown.md`

**Verify no internal fields:**
```bash
npx tsx src/parse/parse.ts fixtures/markdown.md | grep -c '_bufferIndex'
# Expected: 0
```
