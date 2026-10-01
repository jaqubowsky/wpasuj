# ADR 0041: Changed lines must be covered by the units

- **Status:** Accepted
- **Date:** 2026-10-01
- **Owner:** owner (WPA-111); container (the threshold, the tool)

## Context

The owner asked for every free check that catches an AI agent's mistakes. `npm test` ran, but nothing showed which lines a pull request added without a test reaching them. On `a010429` the units cover 90.51% of the lines in `src/` (1575 of 1740). Measured on its own tree, 16 of the last 18 main commits that changed counted `src/` lines had at least 80% of them covered; the two below were the report pill's CSS hooks (51%) and the legal pages (19%), which only e2e reaches.

## Decision

- `npm test` collects V8 coverage of `src/**/*.{ts,tsx}`, without tests, `src/app/dev/` and `src/shared/testing/`, into `coverage/lcov.info`. That exclusion list in `vitest.config.mts` is the gate's scope
- CI's `coverage` job runs `diff-cover` over that file against the pull request's base and fails under 80% of the changed lines covered. Lines V8 does not count (JSX attributes, types, CSS) are not in the diff it measures, so a markup-only or dependency-only pull request passes
- `diff-cover` runs in CI, not as a service: no Codecov app or token on the repository, and the job keeps `contents: read`. It reports through annotations on the uncovered lines and the job summary, not a pull request comment, because Dependabot's and forks' tokens cannot write one
- e2e does not count: a line only Playwright reaches needs a unit or component test to pass the gate

## Consequences

- Lowering 80 or widening the exclusions reverses this ADR
- `coverage` is its own job, so the units run twice per pull request (in `quick` and here); it blocks a merge only once the ruleset on `main` requires it beside `quick`
- A pull request that adds route or markup code with statements only e2e reaches fails until a component test reaches it
- `diff-cover` is pinned in `ci.yml`, where Dependabot does not look; it is bumped by hand
