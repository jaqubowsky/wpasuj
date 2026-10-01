# ADR 0042: Required checks report on every change

- **Status:** Accepted
- **Date:** 2026-10-01
- **Owner:** owner (WPA-124); container (the `changes` job, the per-step gate on `e2e`)

## Context

A ruleset on `main` requires checks by job name. `ci.yml` skipped its whole workflow through `paths-ignore: ["**/*.md"]`, and GitHub leaves a required check from a workflow skipped by a path filter at "Expected — Waiting for status to be reported", so a Markdown-only pull request could never merge. A job skipped by its own `if:` reports success to a required check instead.

## Decision

- No workflow that owns a required check carries a workflow-level `paths`, `paths-ignore`, `branches-ignore` or similar filter on `pull_request`
- `ci.yml`'s first job, `changes`, sets `code` to `false` when the diff from the pull request's base (or the push's `before`) to `HEAD` touches only `*.md`; every other job depends on it
- `quick`, `coverage`, `build` and `docker` skip by a job-level `if:` on `code`; `perf` runs only after a successful `build`
- Every gate reads `code != 'false'` under `!cancelled()`, so a failed `changes` runs the full CI instead of skipping it: a skipped job passes a required check, and `changes` itself is not required
- `e2e` is a matrix, and its required checks are named by its matrix values, which a job skipped before it starts may not report; it always starts and gates each step on `code` instead

## Consequences

- A new job in `ci.yml` needs `changes` and the same gate, or it runs on Markdown-only changes; a new matrix job gates its steps, not the job
- Re-adding a workflow-level path filter to `ci.yml` reverses this ADR and blocks every Markdown-only pull request again
- A Markdown-only change still spends one runner on `changes` and three on the empty `e2e` jobs, each a few seconds
