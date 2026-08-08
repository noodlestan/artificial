# Guide: Art Mantras

A quick map of the companion files that document this module, what each contains, and how they relate.

This module runs under the artificials plan workflow — read `artificials/_guide.md` → Planning Workflow and Working Together, plus `artificials/_module.md` (module workflow) for how architect, delegator, and user work together across sessions and projects. Delegation runs via the backlog plan (`artificials/_backlog/plan-art-mantras/plan.md`) and its instruction files; this file only maps the module's own files.

| file | what it contains |
|---|---|
| `_plan.md` | the design — Why, What, How, Follow-ups (no code). Structure: `artificials/_module.md` → Structure: Plan |
| `_pseudo.md` | the function declarations — name, params, responsibility, pseudo code — entry point first, grouped by layer. Structure: `artificials/_module.md` → Structure: Pseudo |
| `_module.md` | the module's workflow binding (`%plan`/`%pseudo`/`%wip`); the document structures and next-move commands are shared — `artificials/_module.md` |
| `_wip.md` | the parking lot and progress tracker — open actions and questions; step status is marked here (`[x]` done / `[~]` delegated / `[ ]` open) |

**Reading order:** `_guide.md` → `_plan.md` → `_pseudo.md`, plus `artificials/_guide.md` (plan workflow) and `artificials/_module.md` (module workflow). Consult `_wip.md` for what is still open and `_module.md` for the workflow binding.
