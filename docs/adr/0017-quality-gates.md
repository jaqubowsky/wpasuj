# ADR 0017: Rules run as tool gates

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** owner; host (`husky-in-containers`); container (`format-and-duplicates`)
- **Replaces:** `architecture-gates`, `husky-in-containers`, `format-and-duplicates` (former decision entries)

## Context

The owner asked for architecture and style rules to be checked by tools, not by the host reading diffs.

## Decision

- Lint checks both axes: layers inside a module, and no module-to-module edge, `app` only through public entries, `shared` below modules. Plain `no-restricted-imports`, not `eslint-plugin-boundaries`, because it was already in use and needs no dependency. `knip` finds dead code; husky runs pre-commit (staged files) and pre-push (typecheck, knip, duplicates, test); knip runs in CI
- Containers run npm with `ignore-scripts`, so `prepare: husky` does not install the hooks there: a container runs `npx husky` once after install. CI stays the gate that cannot be skipped
- Prettier runs at `printWidth` 140, the width the code was already written to (99th percentile of lines 152; 140 rewrites 1625 lines, 120 rewrites 2500, 160 rewrites 1297 but keeps lines too wide to review side by side), and skips `spec/`, `drizzle/` and `package-lock.json`
- jscpd fails a push on any clone missing from the committed `.jscpd-baseline.json`, not on a percentage: a percentage lets a new clone through whenever other code grows. A copy made on purpose updates the baseline in its own pull request (WPA-69)

## Consequences

- A container that skips `npx husky` skips Prettier and jscpd entirely: they run only in hooks, and CI's lint catches only the padding lines
- Changing `printWidth` rewrites most of the repository
