# Standard Markdown Syntax

This file contains standard markdown syntax elements for testing the parser.

## Paragraphs

First paragraph with some text.

Second paragraph after a blank line.

## Lists

### Unordered List

- Item one
- Item two
- Item three with **bold** and `code`

### Ordered List

1. First step
2. Second step
3. Third step

### Nested List

- Level 1
  - Level 2a
  - Level 2b
    - Level 3

## Links

[External link](https://example.com)

[Reference link][ref]

[ref]: https://example.com 'Reference'

## Emphasis

This is _italic_.

This is **bold**.

This is **_bold and italic_**.

This is ~~strikethrough~~.

## Code

Inline `code` in a paragraph.

```javascript
function hello() {
  console.log('world');
}
```

```python
def greet(name):
    return f"Hello, {name}!"
```

```art
# Module: Test

**Purpose:** Test code block.
```

## Blockquotes

> This is a blockquote.
> It spans multiple lines.

> First quote.

> Second quote.

## Tables

| Name  | Type   | Required |
| ----- | ------ | -------- |
| id    | string | yes      |
| name  | string | yes      |
| value | number | no       |

## Horizontal Rule

---

## Images

![Alt text](image.png)

## Task Lists

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

## Definition Lists (GFM)

Term 1
: Definition 1a
: Definition 1b

Term 2
: Definition 2a

## Autolinks

Visit https://example.com or email user@example.com.

## Tags in Prose

Content with (#generator) tag and (#wip) tag.

## Tags in Code (should NOT be detected)

```md
### Routine: List Tasks (#generator) (#wip)
```

## Directives

::READ `path/to/file.md`

::READ (Routine: List Tasks) FROM `path/to/file.md`
