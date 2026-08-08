# Artificial Language

## Diagram

```
Language
├── Grammar
│   └── ...
├── Modules
│   └── ...
├── Primitives
│   ├── Enum
│   ├── List
│   ├── Record
│   └── Scalar
└── Structures
    ├── Primitive
    └── Structure
```

### Routine

**Syntax:**

```
Routine: {Infinitive Verb} {Target|Outcome}
```

**Examples:**

- Routine: Generating Task Titles
- Routine: Writing Task Files
- Routine: Reading References Files
- Routine: Extracting Domain API

Rules:

- Start with "Process for" (always).
- Use infinitive verb after "for" (Generating, Writing, Reading, Extracting).
- Use title case for the rest.
- Target or Outcome should be specific and descriptive.

### Command

**Syntax:**

```
Command: {Command Name} ({params})
```

**Examples:**

- Command: Show Parking Lot Column (column)
- Command: Add to Parking Lot Column (item, column)
- Command: Update Agents

Rules:

- Start with "Command:" (always).
- Use title case for the command name.
- Parameters in parentheses, kebab-case, comma-separated.
- Parameters are optional if the command has no inputs.

#### Command Parameters

**Syntax:**

```
{param}, {param}
```

**Examples:**

- `column`
- `item, column`
- `resource, target`
- `files, resource-names`

Rules:

- Always kebab-case.
- Comma-separated when multiple.
- Use descriptive names that match the input type.

### Template

<!-- WIP -->

### File

<!-- WIP -->
