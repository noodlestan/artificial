# Pseudo: Context-Aware Visiting

## Principles

1. **NaturalBlock is a transparent wrapper** — copy ALL mdast node attributes, no selective checks
2. **Children only for lists** — NaturalBlock.value is raw markdown, children are parsed items
3. **Context-aware visiting** — visitor carries context about "non-natural" blocks in capturing phase
4. **FieldBlock capture stops at terminators** — section block or other field block stops sibling collection
5. **mdast as source of truth** — like `md => html` (remark/rehype) but classify sub-sections and fields
6. **Don't over-constrain syntax** — first approach was over-concerned with ill-defined rules
7. **Structured and detailed** — don't throw away mdast's work

## Context Factory

```pseudo
interface VisitContext {
  // What construct is currently collecting children
  capturing(): string | undefined

  // Get the current target for new records
  target(): BlockContent[]

  // Push a record to the current target
  push(record: Construct): void

  // Close current context, return parent
  close(): VisitContext | undefined

  // Source markdown for raw slicing
  source: string

  // Last position for gap detection
  lastEnd: Point | undefined
}

function createNestedContext(
  structure: string,           // e.g., 'FieldBlock', 'SectionBlock'
  parentContext?: VisitContext,
  source?: string
): VisitContext {
  const children: BlockContent[] = []

  return {
    capturing() {
      return structure
    },

    target() {
      return children
    },

    push(record: Construct) {
      // Tags go to section, not children
      if (record.construct === 'Tag') {
        const section = findParentSection(parentContext)
        if (section) (section.tags ??= []).push(record)
        return
      }

      // Add to current context's children
      children.push(record)
    },

    close() {
      return parentContext
    },

    source: source ?? parentContext?.source ?? '',
    lastEnd: undefined
  }
}

function createDocumentContext(source: string): VisitContext {
  return createNestedContext('Document', undefined, source)
}
```

## Context Chain Example

```pseudo
// Document level
docCtx = createDocumentContext(markdown)
// docCtx.capturing() === 'Document'

// Enter SectionBlock
sectionCtx = createNestedContext('SectionBlock', docCtx)
// sectionCtx.capturing() === 'SectionBlock'
// sectionCtx.target() === section.children

// Enter FieldBlock inside Section
fieldCtx = createNestedContext('FieldBlock', sectionCtx)
// fieldCtx.capturing() === 'FieldBlock'
// fieldCtx.target() === field.value

// Encounter another SectionBlock while in FieldBlock
// → close field context, create new section context
fieldCtx.close()  // back to sectionCtx
newSectionCtx = createNestedContext('SectionBlock', sectionCtx)
```

## Visitor Entry Point

```pseudo
function buildDocument(markdown: string): Document {
  tree = fromMarkdown(markdown)
  document = { construct: 'Document', children: [] }
  context = createDocumentContext(markdown)

  visit(tree, node => visitNode(node, context))

  return document
}
```

## Node Visitor

```pseudo
function visitNode(node: MdastNode, context: VisitContext): Skip | undefined {
  // Skip root, it's just a container
  if (node.type === 'root') return undefined

  // Handle paragraph children specially
  if (node.type === 'paragraph') {
    return visitParagraph(node, context)
  }

  // Try each factory in order
  factory = getFactory(node, context)

  if (factory) {
    record = factory.create(node, context)

    // Flush any gap before this record
    if (record.position) {
      flushGap(context, record.position.start)
    }

    // Handle capture phase transitions
    if (record.construct === 'SectionBlock') {
      handleSectionBlock(record, node, context)
    }
    else if (record.construct === 'FieldBlock') {
      handleFieldBlock(record, context)
    }
    else {
      context.push(record)
    }

    // Update lastEnd
    if (record.position) {
      context.lastEnd = {
        line: record.position.end.line,
        column: record.position.end.column,
        offset: record.position.end.offset
      }
    }

    return factory.visitChildren ? undefined : SKIP
  }

  // NaturalBlock fallback — transparent wrapper
  record = createNaturalBlock(node, context)

  // Flush any gap before this record
  if (record.position) {
    flushGap(context, record.position.start)
  }

  context.push(record)

  // Update lastEnd
  if (record.position) {
    context.lastEnd = {
      line: record.position.end.line,
      column: record.position.end.column,
      offset: record.position.end.offset
    }
  }

  return SKIP
}
```

## Paragraph Visitor (Handles Field Detection)

```pseudo
function visitParagraph(node: Paragraph, context: VisitContext): Skip {
  // Check if paragraph starts with a field
  if (node.children.length > 0 && isFieldStrong(node.children[0], context)) {
    // Create field block from paragraph
    record = createFieldBlockFromParagraph(node, context)

    // Flush any gap before this record
    if (record.position) {
      flushGap(context, record.position.start)
    }

    // Close previous field if any
    if (context.capturing() === 'FieldBlock') {
      context = context.close()
    }

    // Push to current context and start field capture
    context.push(record)
    context = createNestedContext('FieldBlock', context)

    // Update lastEnd
    if (record.position) {
      context.lastEnd = {
        line: record.position.end.line,
        column: record.position.end.column,
        offset: record.position.end.offset
      }
    }

    return SKIP
  }

  // Otherwise, treat as NaturalBlock
  record = createNaturalBlock(node, context)

  // Flush any gap before this record
  if (record.position) {
    flushGap(context, record.position.start)
  }

  context.push(record)

  // Update lastEnd
  if (record.position) {
    context.lastEnd = {
      line: record.position.end.line,
      column: record.position.end.column,
      offset: record.position.end.offset
    }
  }

  return SKIP
}
```

## Section Block Handler

```pseudo
function handleSectionBlock(record: SectionBlock, node: MdastNode, context: VisitContext): void {
  // Close any active field
  if (context.capturing() === 'FieldBlock') {
    context = context.close()
  }

  // Close sections at or above this depth
  heading = node as Heading
  while (context.capturing() === 'SectionBlock') {
    const parentSection = findParentSection(context)
    if (parentSection && sectionDepth(parentSection) >= heading.depth) {
      context = context.close()
    } else {
      break
    }
  }

  // Push to current context
  context.push(record)

  // Start section capture
  context = createNestedContext('SectionBlock', context)
}
```

## Field Block Handler

```pseudo
function handleFieldBlock(record: FieldBlock, context: VisitContext): void {
  // Close previous field if any
  if (context.capturing() === 'FieldBlock') {
    context = context.close()
  }

  // Push to current context
  context.push(record)

  // Start field capture
  context = createNestedContext('FieldBlock', context)
}
```

## NaturalBlock Factory (Transparent)

```pseudo
function createNaturalBlock(node: MdastNode, context: VisitContext): NaturalBlock {
  // Copy ALL mdast attributes
  block = {
    construct: 'NaturalBlock',
    type: node.type,                    // preserve mdast type
    value: rawSlice(node, context),     // raw markdown
    position: cleanPosition(node.position)
  }

  // Copy any other mdast attributes based on type
  if (node.type === 'code') {
    code = node as Code
    block.lang = code.lang              // code language
    block.meta = code.meta              // code metadata
  }
  else if (node.type === 'list') {
    list = node as List
    block.children = parseListChildren(list, context)
  }
  else if (node.type === 'blockquote') {
    // Preserve blockquote structure
    block.children = node.children.map(child =>
      createNaturalBlock(child, context)
    )
  }

  return block
}
```

## FieldBlock Factory (From Paragraph)

```pseudo
function createFieldBlockFromParagraph(paragraph: Paragraph, context: VisitContext): FieldBlock {
  // Get the strong node (first child)
  strong = paragraph.children[0] as Strong

  // Extract field name
  inner = stripStrong(strong, context)
  colonIndex = inner.indexOf(':')
  name = inner.slice(0, colonIndex).trim()

  // Create field record
  field = {
    construct: 'FieldBlock',
    name: name,
    value: [],
    position: cleanPosition(paragraph.position)
  }

  // Add inline value after colon
  remainder = inner.slice(colonIndex + 1)
  if (remainder) {
    field.value.push({
      construct: 'NaturalBlock',
      type: 'text',
      value: remainder.trim(),
      position: cleanPosition(strong.position)
    })
  }

  // Add remaining paragraph children as NaturalBlocks
  for (child of paragraph.children.slice(1)) {
    field.value.push(createNaturalBlock(child, context))
  }

  return field
}
```

## Helper Functions

```pseudo
function findParentSection(context: VisitContext): SectionBlock | undefined {
  // Walk up context chain to find parent section
  let current = context
  while (current) {
    if (current.capturing() === 'SectionBlock') {
      // Return the section from the context's target
      const children = current.target()
      if (children.length > 0) {
        const last = children[children.length - 1]
        if (last.construct === 'SectionBlock') {
          return last as SectionBlock
        }
      }
    }
    current = current.close()
  }
  return undefined
}

function sectionDepth(section: SectionBlock): number {
  // Extract depth from position or name
  // This is a placeholder — actual implementation would need to track depth
  return 1
}

function flushGap(context: VisitContext, start: Point): void {
  if (context.lastEnd && start.offset > context.lastEnd.offset) {
    gap = context.source.slice(context.lastEnd.offset, start.offset)
    if (gap) {
      gapBlock = {
        construct: 'NaturalBlock',
        type: 'text',
        value: gap,
        position: cleanPosition({ start: context.lastEnd, end: start })
      }
      context.push(gapBlock)
    }
  }
}

function getFactory(node: MdastNode, context: VisitContext): ConstructFactory | null {
  // Section blocks first — they change capture phase
  if (sectionBlockFactory.detect(node, context)) return sectionBlockFactory

  // Field blocks second — they start field capture
  if (fieldBlockFactory.detect(node, context)) return fieldBlockFactory

  // Tags third — they go to section
  if (tagFactory.detect(node, context)) return tagFactory

  // Everything else is NaturalBlock
  return null
}
```

## Key Insight

The `createNestedContext` pattern allows us to:

1. **Switch between factories** — when we encounter a SectionBlock while capturing a FieldBlock, we close the field context and create a new section context
2. **Stop collecting siblings** — FieldBlock value stops when another FieldBlock or SectionBlock is encountered
3. **Preserve structure** — we don't lose information by over-constraining syntax rules
4. **Track what's capturing** — `capturing()` returns the construct type, or `undefined` if at document level

This is similar to how `md => html` works with remark/rehype, but we classify sub-sections and fields while keeping everything else as-is.
