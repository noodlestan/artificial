# Parking Lot

Track actionable items, doubts, and blockers surfaced during architecture sessions.

## Actionable Items

- ~~Use `write-plan` skill to write `plan-workflows-makes-work-flow/plan.md`~~ — DONE (plan.md created)
- Create planning workflow file `plans/workflows/planning.art` — referenced in domains/index.md but doesn't exist
- Update write-milestone skill — similar mapping issues as write-plan (Plan Scope/Context structures don't exist)
- Add spec content rules to specs domain — no implementation details, no code snippets, no tables unless prescribed (from old write-task-files.art)
- Create `domains/specs/index.md` — specs domain needs an index file with definitions, types, file conventions

## Open Questions

- Should `branch` be added to Repository Scope?
- Should `target` be added to Deployment Scope?
- "Conventions Adoption recording" — what does this mean? Just tracking whether a convention has been applied to the codebase, or something more?
- Does `plans/workflows/planning.art` need to exist? The domains/index.md references it but the file is missing. What stages should it define? Contextualizing, Drafting, Refining, Integrating?
- Should write-milestone be updated in parallel with write-plan, or after write-plan is stable?
- Should Type: Spec (Abstract) be integrated into plan structure now, or in a separate iteration after skill update?
- Should DONE iterations have instructions files projected (for exercise), or just exist as plan entries?
- Path mismatch: plan references `$DOMAINS/skills/write-plan/SKILL.md` but actual path is `$WORKSPACE/.agents/skills/write-plan/SKILL.md` — which convention should plan use?
- Should specs domain define file conventions (like `plan-{plan.id}/specs/{spec.id}.md`) or keep them generic via Work Attachment?

## Blockers

- Sweep files for legacy naming ("domain Record", "Record Structure", "Attachment File") — blocked on fundamentals cleanup being finalised
- Plan structure and work domain types must be stable before skill update iteration proceeds
