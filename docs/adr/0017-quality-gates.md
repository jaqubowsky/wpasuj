# ADR 0017: Which rules run as tool gates

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
- Not every rule is a gate (WPA-76). Tools check: import direction (the layers inside a module, written relatively or through `@/`), `domain/` purity (no `react`, `next/*`, `node:*` or `better-sqlite3`), no module importing another or `@/app/**`, and the store rule (ESLint `no-restricted-imports`; the alias, `domain/` purity and app edges are probed in `src/lint-boundaries.test.ts`, WPA-94), the styling scale and tokens (ESLint), one icon source (ESLint `no-restricted-syntax` on `<svg>` outside `src/shared/ui/icon/` and the two illustrations, `WaveEdge` and the landing arrow, WPA-93), padding lines (ESLint), dead code (knip), clones (jscpd, pre-push only), GitHub Actions workflows and the Dependabot config (actionlint and zizmor in CI `quick`, WPA-106), registry signatures and provenance (`npm audit signatures` in CI `quick`) and new or changed dependencies with a high or critical advisory (`dependency-review.yml` on every pull request, WPA-110), and exhaustive failure reasons (`typecheck` through `satisfies never`). Review alone holds the rest of `spec/brief.md`, "Code rules": no business rule in an action, a component or `src/shared`; UI logic in hooks, not in a component body; a module's need declared as a narrow function type in its own words; `index.ts` starting with `import 'server-only'`; no helper with one caller; no `Date.now()` in domain code; kebab-case file names; no comments; red, then green; a diff touching only what its ticket needs; deletable modules; copy domain code, share technical code; one source per concept beyond the tokens

## Consequences

- A container that skips `npx husky` skips Prettier and jscpd entirely: they run only in hooks, and CI's lint catches only the padding lines
- Changing `printWidth` rewrites most of the repository
- A green gate does not mean the reviewed rules hold; a reviewer checks them on every diff
