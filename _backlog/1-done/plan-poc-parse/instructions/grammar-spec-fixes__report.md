# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Instruction Id:** `grammar-spec-fixes`

**Outcome:** `COMPLETED`

## Evidence

### Changes

#### Files changed

| File                                                                           | Change                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repos/artificial/art-js/spec/grammar/constructs/structural/field-block.art`   | Fixed Description to reference termination rules; removed overly broad "MAY contain" rule; kept MUST NOT constraints                                                        |
| `repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art` | Clarified Schema with `kind?: string` (optional); Syntax now shows both `# Name` and `# Kind: Name` forms                                                                   |
| `repos/artificial/art-js/spec/grammar/constructs/structural/natural-block.art` | Updated Purpose to "catch-all classification"; Description now references "Any Markdown is Valid `.art`"; added Schema with `value: string` and `children?: BlockContent[]` |
| `repos/artificial/art-js/spec/grammar/constructs/expressions/tag.art`          | Added prose detection rule: tags detected via regex, not in code blocks; tags attach to nearest enclosing SectionBlock                                                      |
| `repos/artificial/architecture/records/adr/language.art`                       | Added new decision: "Parser Containment Model" (Adopted) summarising containment rules                                                                                      |

## Blockers (if any)

None.

## Feedback

### For the planner

- **Step 1 — FieldBlock spec already contained the correct rules.** The file at `field-block.art` already had the termination rules and MUST NOT constraints from the `language.art` ADR. The instruction asked to "fix" rules that were already correct. The only actionable fix was removing the overly broad "MAY contain procedure blocks, example blocks, directives, and raw Markdown content" rule. **Decision:** removed that rule; kept the rest unchanged. **Snippet for `repos/artificial/_backlog/_architect.md`:** _When the instruction says "fix X", verify the current state of X before assuming it needs fixing — partial prior updates may have already landed._

- **Step 2 — SectionBlock Schema/Syntax was already partially clear.** The Schema used `<NaturalName>` rather than `string`, and the Syntax block showed the combined form. The instruction's suggested improvements were minor clarifications. **Decision:** replaced Schema types with `string` and added inline comments; rewrote Syntax to show two explicit forms. **Snippet:** _Consider stating "replace `<NaturalName>` with `string` and add inline comments" rather than "clarify" when the diff is specific._

- **Step 4 — Tag file path was wrong in the instruction.** The instruction referenced `repos/artificial/art-js/spec/grammar/expressions/tag.art` but the actual path is `repos/artificial/art-js/spec/grammar/constructs/expressions/tag.art`. **Decision:** found the file via glob search. **Snippet for `repos/artificial/_backlog/_architect.md`:** _Verify all file paths in instructions before dispatching — a wrong path forces the agent to search, adding latency._

### For the technical writers

- The NaturalBlock spec previously had no Schema block. The addition of `value: string` and `children?: BlockContent[]` now matches the parser's `NaturalBlock` interface in `types.ts` (lines 44–50). The `children` field is optional per the parser — correctly reflected in the spec.

- The SectionBlock Schema previously used `<NaturalName>` as a type, which is a grammar-level construct name, not a concrete type. Replaced with `string` to match the parser's `kind?: string` (types.ts line 26). Consider whether all Schema blocks should use concrete types (`string`, `Tag[]`) rather than grammar-level references (`<NaturalName>`, `<Tag>`) for consistency.

### For the crew

- All modified `.art` files now have consistent Schema, Syntax, and Rules sections. The parser types in `types.ts` serve as ground truth; the spec files now describe the same containment model the parser implements.
