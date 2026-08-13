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

```json
{
  "construct": "SectionBlock",
  "kind": "Routine",
  "name": "List Tasks",
  "children": []
}
```

---

## TC2 — SectionBlock without kind

**Fixture:** `fixtures/section-block.md`

**Input:** `## Rules`

**Expected output:**

```json
{
  "construct": "SectionBlock",
  "name": "Rules",
  "children": []
}
```

Note: no `kind` field present.

---

## TC3 — SectionBlock with tags

**Fixture:** `fixtures/section-block.md`

**Input:** `### Decision: Two Main Use Cases (#generator)`

**Expected output:**

```json
{
  "construct": "SectionBlock",
  "kind": "Decision",
  "name": "Two Main Use Cases",
  "tags": [{ "construct": "Tag", "name": "generator" }],
  "children": []
}
```

---

## TC4 — FieldBlock single-line

**Fixture:** `fixtures/field-block.md`

**Input:** `**Purpose:** Generate and manage agent instructions.`

**Expected output:**

```json
{
  "construct": "FieldBlock",
  "name": "Purpose",
  "value": [
    {
      "construct": "NaturalBlock",
      "value": "Generate and manage agent instructions."
    }
  ]
}
```

---

## TC5 — FieldBlock with backtick value

**Fixture:** `fixtures/field-block.md`

**Input:** `` **Canonical Name:** `@noodlestan/artificial` ``

**Expected output:**

```json
{
  "construct": "FieldBlock",
  "name": "Canonical Name",
  "value": [
    {
      "construct": "NaturalBlock",
      "value": "`@noodlestan/artificial`"
    }
  ]
}
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

```json
{
  "construct": "FieldBlock",
  "name": "Dependencies",
  "value": [
    {
      "construct": "NaturalBlock",
      "type": "list",
      "children": [
        { "construct": "NaturalBlock", "value": "Package Dependency Set: Build Tools" },
        { "construct": "NaturalBlock", "value": "Package Dependency Set: Project Tools" }
      ]
    }
  ]
}
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

```json
{
  "construct": "FieldBlock",
  "name": "Scripts",
  "value": [
    {
      "construct": "NaturalBlock",
      "type": "code",
      "value": "npm run build\nnpm run test"
    }
  ]
}
```

---

## TC8 — NaturalBlock catch-all

**Fixture:** `fixtures/section-block.md`

**Input:** `Lorem ipsum dolor sit amet.` (paragraph under `## Rules`)

**Expected output:**

```json
{
  "construct": "NaturalBlock",
  "type": "paragraph",
  "value": "Lorem ipsum dolor sit amet.",
  "children": [
    {
      "type": "text",
      "value": "Lorem ipsum dolor sit amet.",
      "position": { "start": {...}, "end": {...} }
    }
  ],
  "position": { "start": {...}, "end": {...} }
}
```

Note: The transparent spread includes mdast `children` (inline text nodes). The `value` field is the canonical content.

---

## TC9 — Tags in prose detected

**Fixture:** `fixtures/section-block.md`

**Input:** `(#generator)` (paragraph under `### Decision: Two Main Use Cases`)

**Expected output:**

The tag is attached to the parent section's `tags` array:

```json
{
  "construct": "SectionBlock",
  "kind": "Decision",
  "name": "Two Main Use Cases",
  "tags": [
    { "construct": "Tag", "name": "generator", "position": {...} }
  ],
  "children": [
    ...
    {
      "construct": "NaturalBlock",
      "type": "paragraph",
      "value": "(#generator)",
      "children": [...]
    }
  ]
}
```

Note: The tag is detected and attached to the section. The paragraph NaturalBlock retains the raw text including the tag pattern — both are present in output.

---

## TC10 — Tags in code NOT detected

**Fixture:** `fixtures/markdown.md`

**Input:** Fenced code block containing `(#generator)`

**Expected output:**

No `Tag` records from inside the code block. Tags should only be detected in prose, not in code.

---

## TC11 — Code block preserves lang

**Fixture:** `fixtures/markdown.md`

**Input:** Fenced code block with ` ```javascript `

**Expected output:**

```json
{
  "construct": "NaturalBlock",
  "type": "code",
  "lang": "javascript",
  "value": "..."
}
```

The `lang` field should be preserved from the mdast node.

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

```json
{
  "construct": "NaturalBlock",
  "type": "list",
  "children": [
    { "construct": "NaturalBlock", "value": "Item one" },
    { "construct": "NaturalBlock", "value": "Item two" },
    { "construct": "NaturalBlock", "value": "Item three" }
  ]
}
```

---

## TC13 — Table preserved as NaturalBlock

**Fixture:** `fixtures/markdown.md`

**Input:** Markdown table

**Expected output:**

```json
{
  "construct": "NaturalBlock",
  "type": "table",
  "value": "| Name | ... |"
}
```

The raw table text should be preserved.

---

## TC14 — Section nesting by heading level

**Fixture:** `fixtures/section-block.md`

**Input:** `# Section Block Fixtures` (level 1) containing `## Rules` (level 2) containing `### Routine: List Tasks` (level 3)

**Expected output:**

```json
{
  "construct": "Document",
  "children": [
    {
      "construct": "SectionBlock",
      "name": "Section Block Fixtures",
      "children": [
        {
          "construct": "SectionBlock",
          "name": "Rules",
          "children": [
            {
              "construct": "SectionBlock",
              "kind": "Routine",
              "name": "List Tasks",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

## TC15 — Position objects clean

**Fixture:** `fixtures/markdown.md`

**Expected output:**

All `position` objects should have only `start` and `end` fields, each with `line`, `column`, `offset`. No internal mdast fields like `_bufferIndex` or `_index` should be present.
