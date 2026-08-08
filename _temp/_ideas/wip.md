# Session Corrections Diagnostic

Idea: measure plan/SoT quality from agent-session traces, by treating each agent correction as evidence against the plan or the source of truth — not against the agent.

## Motivation

The target is **delegated execution sessions** — a planner produces a plan, a developer agent executes it, possibly correcting course along the way. Corrections in this setting are cheap to attribute and almost always mean the plan or the SoT was deficient, not the agent.

This is the opposite of a high-reasoning deliberation session (e.g. an architect working through trade-offs), where "hmm/wait/but" is healthy exploration of alternatives. In execution, the plan was supposed to remove that exploration; corrections are re-exploration that the plan failed to eliminate.

Context for why corrections happen at all: an agent "hmm/wait/but" is the visible footprint of a probability-distribution shift during autoregressive sampling — the model commits to a reading, new context arrives (tool output, a re-read), the distribution swings, and the only way to change course is to emit tokens that override earlier ones. In an execution session, the context that triggers the swing is usually a mismatch between the plan and reality.

In a delegated execution session, every correction is a signal:

- **Plan/SoT defect**, when the correction traces back to the plan or the codebase.
- **Not the agent's fault**, when the correction comes from external causes (flaky test, env, permissions).

The idea extends the art geometry: art measures source → projection alignment; this tool measures plan → execution alignment.

## Correction root-cause taxonomy

| Root cause | Signature | Plan/SoT defect |
| --- | --- | --- |
| Ambiguity | agent guesses or asks after the plan said X | plan has 2 readings |
| Inconsistency | agent contradicts a plan step or the codebase | plan vs SoT mismatch |
| Omission | agent improvises a step not in the plan | plan gap |
| Drift | plan fixed, reality moved mid-run | stale SoT |
| External | flaky test, env, permissions | not plan's fault — excluded |

## Tool design sketch

**Common event model** (normalized per session): `input` → `reasoning` segments (text + token counts + timestamps) → `tool` calls + results (args, success/error) → `output`/revisions.

**Adapters** (each maps traces into the event model):
- `opencode` — verified: `part` table, `type=reasoning` holds full thinking text; `message` table has `reasoning` token counts (`~/.local/share/opencode/opencode.db`).
- `codex` — `~/.codex/sessions/*.jsonl` transcripts (+ `--trace` logs).
- `claude` — `~/.claude/projects/<proj>/*.jsonl`.

**Feature extractors:**
1. Hedge lexicon → density per reasoning segment.
2. Correction detection — consecutive reasoning segments compared (claim diff / embedding similarity): "conclusion changed" vs "same conclusion re-asserted" (oscillation).
3. Tool retry loops — same tool + overlapping args within a window.
4. Root-cause bucketing — each correction projected back onto a plan statement (or absence of one).

**Metrics:** correction density, oscillation rate, retry loops, plan coverage (steps with zero corrections), root-cause histogram, convergence score.

**Sampling strategy:** window (last N days) × sample M sessions per agent/task type; compute distributions, flag outliers (p95 density, p95 retries). Spot-check diagnostic, not continuous monitoring.

**Baseline discipline:** density varies by model and reasoning effort — only meaningful relative to a matched baseline (same task shape, better context).

## Open questions

- How to distinguish productive corrections (changed conclusion) from oscillation (re-asserted same conclusion) reliably across models.
- Whether claim-diff is enough or embeddings are needed.
- Which adapters to build first.

Status: idea, not started.
