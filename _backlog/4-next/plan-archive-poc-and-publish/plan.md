# Plan: Archive and Publish

**ID:** `archive-poc-and-publish`

**Status:** `PLANNED`

**Milestone:** `md-art-roundtrip`

**Phase:** 3

## Summary

Archive poc-parse. Publish `@art-js/artificials-primitives` and `@art-js/artificials-parser` v0.1.0.

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

**Commit Message:** `art-js: archive poc-parse package`

**Instructions File:** `_backlog/4-next/plan-archive-and-publish/instructions/archive-poc-parse.md`

**Scope:**

- Mark poc-parse as `private: true` in package.json
- Add README noting it's archived

#### `publish-v0.1.0` - `PLANNED`

**Commit Message:** `art-js: publish v0.1.0`

**Instructions File:** `_backlog/4-next/plan-archive-and-publish/instructions/publish-v0.1.0.md`

**Scope:**

- Ensure all packages have correct `publishConfig`
- Version bump to `0.1.0`
- Run `npm publish` for primitives and parser
- Verify: packages installable from npm
