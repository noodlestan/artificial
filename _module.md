# Module: Workflow

Reusable module workflow: the structure of a module's plan and pseudo documents, and the next-move commands. Generic across modules — `%plan`/`%pseudo`/`%wip` below mean the module's `_plan.md`/`_pseudo.md`/`_wip.md`. Conventions and principles follow **Artificials Fundamentals** (`.agents/domains/_artificials/fundamentals.md`), not the module. (The backlog plan record — statuses, commits, delegations — is a separate document, structured in `.agents/domains/plans/structures/plan__structure.md`.)

## Structure: Plan

**Purpose:** The single reference for what the module is and how it is designed. The coder follows it to implement the module; it records the design decisions the conversation settled, in plain language, with no code.

**Description:** `%plan` answers the design questions the conversation resolved. Anything not yet decided stays open and is tracked in `%wip`. It pairs with `%pseudo` (the function declarations) and the module's `_guide.md` (the index of companion files).

**Structure & guidelines:**
- Fixed section order: **Why → Intro → What (Requirements) → How → Follow-ups**; Follow-ups always sits at the bottom.
- **Why** — motivation. **Intro** — the shape. **What** — requirements. **How** — the design, nested as `###`/`####`.
  - **Principles** — terse principle names only, no explanations.
  - **NFRs** — constraints.
  - **Architecture** — flow and the output contract.
  - **Use cases** — every interaction as terse BDD (Given/When/Then).
  - **Layers** — introduce the layers, then group the hows by layer, nesting details.
  - **Conventions** — last.
- Zero code in the plan; function declarations live in `%pseudo`; function names are referenced tersely.

## Structure: Pseudo

**Purpose:** The function declarations — name, params, **responsibility**, and pseudo code — the contract between the design (plan) and the implementation (the coder).

**Description:** `%pseudo` holds one section per layer, mapping 1:1 to the plan's Layers. It is pseudo code, not real code: DOM technique and render bodies are the coder's; the architect prescribes parts, ownership, events, and responsibility.

**Structure & guidelines:**
- Presented **entry point first** (the locked anchor), then grouped by layer.
- Each function block uses a kind-specific heading where a kind applies — `### Function: name(...)` by default, or e.g. `### Component Factory: createButton(...)` / `### Composer: mount()` — followed by **Responsibility** and a `pseudo` code body.
- Component factories own their element, data, and events; controls are componentised through a shared factory exposing a mutable binding api.
- Bodies are pseudo only — no real code or DOM.

## Commands

Run a command when the user says `command: <name>`.

### Command: break down responsibilities

**Purpose:** Break large responsibilities in the pseudo into smaller functions, and reflect the emerged entities back into the plan tersely.

**Description:** Operates on `%pseudo` and `%plan` to keep function sizes manageable and the plan's references to the resulting entities short.

**Input:** `%plan`, `%pseudo`

**Before you start:** 1. Re-read and check the cohesion of `%plan`, `%wip`, and `%pseudo` (where relevant), and separately — in case of blatant contradictions not potentially solvable by this command — stop and alert the user.

**Procedure:**
1. do a pass through `%pseudo` identifying large responsibilities and breaking them up into smaller functions.
2. go back to `%plan` and update with the emerged entities (the smaller the entity the terser the reference — a bullet point or even a paragraph with name, name, name).
3. REVIEW the `%plan` and `%pseudo` changes with the user before proceeding.
4. STOP and come back with updates and questions surfaced.

### Command: tighten plan

**Purpose:** Tighten the plan — remove redundancies, resolve ambiguities, fix omissions and verbosity — using the pseudo to answer questions.

**Description:** Operates on the `%plan` resource (consulting `%pseudo`) to keep the plan tight and consistent with what the pseudo has materialised.

**Input:** `%plan`, `%pseudo`

**Before you start:** 1. Re-read and check the cohesion of `%plan`, `%wip`, and `%pseudo` (where relevant), and separately — in case of blatant contradictions not potentially solvable by this command — stop and alert the user.

**Procedure:**
1. do a pass through `%plan` identifying redundancies, ambiguities, omissions, verbosity — use `%pseudo` to answer all questions and update `%plan` accordingly.
2. compact or remove things now materialised in `%pseudo`; add if `%pseudo` revealed a new important principle, "how", or convention (follow Artificials Fundamentals).
3. REVIEW the `%plan` changes with the user before proceeding.

### Command: abstract

**Purpose:** Surface and apply abstractions for repeated code, long responsibilities, and anonymous pseudo, each evaluated against the principles before applying.

**Description:** Operates on the `%pseudo` and `%plan` resources to introduce abstractions that read better, each option evaluated against the principles (follow Artificials Fundamentals), especially don't go too far.

**Input:** `%plan`, `%pseudo`

**Before you start:** 1. Re-read and check the cohesion of `%plan`, `%wip`, and `%pseudo` (where relevant), and separately — in case of blatant contradictions not potentially solvable by this command — stop and alert the user.

**Procedure:**
1. do a pass through `%pseudo`, verify it reflects `%plan`.
2. come up with potential abstractions for repeated code / long responsibilities / anonymous code (pseudo instructions that would read much better as a pseudo function call) — don't stop at the first solution for each item, explore several if necessary, alternatives, overlapping, etc.
3. evaluate each option to the principles (follow Artificials Fundamentals, especially don't go too far).
4. with each evaluated option where you have high confidence, update `%pseudo`.
5. update `%plan` to make sure it's not redundant OR omissive of the pseudo changes (depending on whether a detail was materialised in `%pseudo` or a new pseudo function emerged as important architecture).
6. REVIEW the `%pseudo` and `%plan` changes with the user before proceeding.

### Command: Pre Commit

**Purpose:** Land the module's current work as clean, reviewed commits that follow Artificials Fundamentals, without touching unrelated changes.

**Description:** Operates on the `%wip` resource and the git working tree to prepare the module's commits; follows Artificials Fundamentals for resource and heading conventions rather than restating module-specific ones.

**Input:** `%wip`

**Before you start:** 1. Re-read and check the cohesion of `%plan`, `%wip`, and `%pseudo` (where relevant), and separately — in case of blatant contradictions not potentially solvable by this command — stop and alert the user.

**Procedure:**
1. check git status — identify your own work; leave unrelated changes alone.
2. review `%wip` — break monolithic next actions into vertical slices (thin increments per layer); anything not done stays open.
3. drop blockers that are not real blockers — if a next action (review or code) is actionable, it is not a blocker.
4. follow Artificials Fundamentals for resource and heading conventions — do not restate module-specific ones.
5. propose logical commits.
6. REVIEW them with the user before staging.
7. stage and commit; use `--no-verify` to skip CI.

### Command: record delegation

**Purpose:** After a delegated commit lands, record the delegation in the plan and wip, and name the next step to relay — without touching unrelated changes.

**Description:** Operates on the module's plan file (→ Commits section), the `%wip` resource, and the delegation report; keeps the race cycle moving: report → feedback → plan → wip → stage → commit → next relay.

**Input:** plan file, `%wip`, delegation report

**Before you start:** 1. Check git status and log — identify the delegated commit (the sub-agent's) and its report; leave unrelated changes alone (e.g. concurrent sessions' work). 2. Re-read the delegation report — the full trail lives there.

**Procedure:**
1. read the delegation report (outcome, changes, verification, feedback). If no report/commit came back from the relay: record the choke evaluation in the plan's Feedback, keep the commit `PLANNED` and the wip step open, then STOP and report the re-relay prompt (fresh, non-resumed delegator session).
2. update the plan file's commit block: status → `COMMITTED`, add Commit id, Report, Evidence; append delegatee feedback + planner reflection bullets to Feedback.
3. apply delegatee feedback to `%pseudo`/`%plan`/instruction files (ready-to-apply snippets).
4. update `%wip`: mark the step done with the commit id; the next step stays delegated.
5. stage the recording files (never unrelated changes) and commit with `--no-verify`.
6. report the next relay prompt: `boot and delegate <plan file>` → next `PLANNED` commit.
