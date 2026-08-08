# _temp Notes

> Everything under `_temp/` is **pseudo-code for art-js** — behavioral specifications written in the art language itself, describing what the future JS packages (`cli/tools`, `libs/validator`, `libs/primitives`, etc.) must do. Not shipped, not executed; consumed as spec by the JS implementation.

## Folders

### `_architect/`

Routines that a design/architect agent follows to produce routine and type specifications from natural language process descriptions.

| File | Purpose |
| ---- | ------- |
| `design-routines.art` | Decompose a process description into routine specs (entry point + sub-routines) and shared type specs. The meta-level "how to write spec" routine. |

### `_art/`

Spec for the art language tooling itself: how art resources are discovered, listed, resolved, generated, and validated. This is the self-describing layer — the tooling that validates art's own files.

| Path | Purpose |
| ---- | ------- |
| `_guide.md` | Overview of the art file format (`.art`/`.tart`/`.md`), modules, and resource conventions. |
| `discover/` | Routines for scanning and listing resources across all domains (`find-resources`, `list-resources`). |
| `generate/` | Routine spec for writing routine files (`write-routine`). |
| `resources/` | Types (`Resource`, `ResourceRef`, `MaybeResource`) and resolution routine for locating resources. |
| `routines/` | Structure definition for the standard routine record format. |
| `validation/` | Reference-validation subsystem: extract references, locate artefact files, check paths resolve, report results. Types: `BrokenReference`, `ExtractedReference`, `FileLocation`, `ValidationReport`. |

### `_developer/`

Spec for the scaffolding/refactoring/validation tooling — what will become `cli/tools` (scaffold, refactor, validate) and `libs/primitives`.

| Path | Purpose |
| ---- | ------- |
| `_wip.md` | Pending work: `dependencies` field on Project/Package structures + dependency types. NOTE: references stale paths (`artificials/_meta/...`) — the project structures now live in `.agents/domains/project/`. |
| `generate/` | Scaffolder application: project, namespace, package scaffolders; internal dispatcher (`apply-scaffolder-of-kind`, `apply-scaffolders`) and kind-specific routines (files, procedural, skeleton). |
| `refactor/` | Resource relocation: extract/insert/remove resources between files, locate resources, update `::READ` references. Types for locations and results. |
| `validate/` | State checks: package path exists, file matches template. |

### `_words/`

Speculation on how AI agents process requests — a working model of agent operations (hypothesised internal steps like "Classify Request", "Identify Intent"). Not agent-facing vocabulary; it exists to help structure the author's own thinking about how agents work.

| File | Purpose |
| ---- | ------- |
| `agent-words.md` | Working model of agent operations: Artificial Operation, Artificial Workflow, and hypothesised operation lists (Classify Request, Identify Intent, ...). |
| `agent-words__review.md` | Review rules/checklist the author applies to keep `agent-words.md` well-structured. |

## Usage Notes

- Files are `.art` where they declare types/routines, `.md` where they are guides or WIP notes.
- Paths inside these files may be stale (e.g. `_developer/_wip.md` references the old `_meta/` path) — update when consumed.
- `_words/` is the author's own model of agent processing — not a spec input and not meant to be rendered into agent-facing projections.
