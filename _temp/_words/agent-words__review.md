# Rules to review Artificial Words

DIRECTIVE: when evaluating the file, apply the "## Structure" and "## Formatting" checks first.

DIRECTIVE: if the "## Structure" and "## Formatting" checks don't pass, STOP and ALERT the user.

## Structure

CHECK(file-structure): The file must structured according to the following outline:

```
# Artificial
## Definitions
## Artificial Operations
## Artificial Context Sources
## Artificial Workflows
### Workflow: {workflow}
```

CHECK(no-extraneous-elements): The file should contain no other sections.

## Naming

### Strict Naming of Operations, Context sources, and Workflows

CHECK(title-case): All Operations, Context Sources, and Workflows are named in Title Case.

<!-- CHECK(operation-name): All context source names match the pattern `{oepration}`. -->

<!-- CHECK(context-source-name): All context source names match the pattern `{context source}`. -->

CHECK(workflow-name): All workflow names match the pattern `{workflow name}` or `{workflow name} Until (condition)`.

### Strict Unique Names

CHECK(unique-names): All Operations and Workflows have unique names.

CHECK(name-overlap): No Operation or Workflow may share the same name as another entity type.

## References

### Strict Use of references in Workflows

NOTE: `Evaluate Condition:` at the start of a workflow item is a control mechanisms.

CHECK(invalid-reference): Workflows can only reference Operations, Workflows, and control mechanisms.

CHECK(unknown-operation): When an Operation is referenced in a Workflow its name must match verbatim an item in the "## Artificial Operations" section.

CHECK(context-source-reference): When a Context Source is referenced in a Workflow, the reference must match the pattern `{context operation} ({context source})`.

CHECK(context-source-match): When a Context Source is referenced, the identified `{context source}` matches verbatim an item in the "## Artificial Context sources" section.

CHECK(unknown-source): When a Context Source is referenced, the identified `{source}` matches verbatim one of the sources listed under the identified `{context source}`.

CHECK(invalid-workflow-reference): When a Workflow is referenced the reference must match the pattern `{workflow} ({param})` or `{workflow}`.

CHECK(unknown-workflow): When a Workflow is referenced, the identified `{workflow}` matches verbatim an item in the "## Artificial Workflows" section.

## Relationships

### No orphans

CHECK(orphan-operation): Every Operation must be referenced by at least in one Workflow.

CHECK(context-sources): Every Context Source must be referenced by at least in one Workflow.

## Formatting

CHECK(ends-with-dot): All numbered lists and bullet points end with `.`.

### Strict Use of Bullet Points

CHECK(bullet-points): All sources listed under Operations and Context sources use bullet points.

### Strict Use of Bullet Points

CHECK(numbered-lists): All steps of Workflows are listed as numbered lists.

CHECK(mis-numbered): All numbering of steps of Workflows must be sequential and start at 1.
