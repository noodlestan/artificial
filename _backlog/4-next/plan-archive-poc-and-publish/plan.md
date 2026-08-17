# Plan: Archive and Publish

**ID:** `archive-poc-and-publish`

**Status:** `PREPARING`

**Milestone:** `md-art-roundtrip`

**Phase:** 10

## Summary

Archive poc-parse. Publish `@art-js/artificial-primitives` and `@art-js/artificial-parser` v0.0.1.

## Source Tasks

Milestone planning.

## Mandatory Reading

For the delegator (execution mechanics):

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `.agents/skills/execute-plan/SKILL.md` — how this plan is executed by delegation.

## Commits

#### `archive-poc-parse` - `PLANNED`

**Commit Message:** `build(md-art-roundtrip): archive poc-parse package`

**Instructions File:** `_backlog/4-next/plan-archive-poc-and-publish/instructions/archive-poc-parse.md`

**Scope:**

- Mark poc-parse as `private: true` in package.json
- Add README noting it's archived

#### `publish-v0.0.1` - `PLANNED`

**Commit Message:** `build(md-art-roundtrip): publish v0.0.1`

**Instructions File:** `_backlog/4-next/plan-archive-poc-and-publish/instructions/publish-v0.0.1.md`

**Scope:**

- Ensure all packages have correct `publishConfig`
- Version bump to `0.0.1`
- Run `npm publish` for primitives and parser
- Verify: packages installable from npm
