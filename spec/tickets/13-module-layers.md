# 13: Module layers refactor, no behaviour change

Status: done
Blocked by: 06-organiser.md, 07-link-preview.md, 09-design-system-fixes.md, 10-grid-robustness.md

## Parent

`spec/brief.md` ("Code rules", the module layout line), `AGENTS.md` ("Module layout").

## Outcome

`view-results` and `create-poll` (and `answer-poll` where the move pays off) are split into `domain/`, `server/` and `ui/`, and lint refuses an import that goes the wrong way. Nothing a user or a test sees changes. It runs alone: no other MVP ticket is in flight while it does.

## Scope

- Move files into `domain/` (pure functions and their tests), `server/` (schemas, queries, actions), `ui/` (components, CSS Modules, hooks); `index.ts` and `client.ts` stay the public entries and keep their exports
- `eslint.config.mjs`: `no-restricted-imports` so that `domain/**` cannot import `react`, `react-dom`, `next/*`, `../server/**`, `../ui/**`, and `server/**` cannot import `../ui/**`
- Import paths updated; nothing else edited

## Out of scope

- Any rename, logic change or new test beyond moved files
- `src/modules/landing` (built in the layout from ticket 14 on)

## Acceptance criteria

- [x] `npm run lint`, `typecheck`, `test`, `build`, `e2e` green; CI green — all five exit 0 here (e2e: phone-chromium and desktop-chromium, 86 passed, 8 skipped); CI on the pull request
- [x] `git diff --stat -M` on the pull request shows only renames and import-line edits (`git diff -M --word-diff` has no change outside `import` lines, `eslint.config.mjs` and this ticket) — the only word changes outside static `import`/`export` lines are module paths in `import()` and `vi.mock()`
- [x] A deliberate `import { useState } from "react"` in a `domain/` file fails lint (shown in the PR body, not committed) — `@typescript-eslint/no-restricted-imports` reports it; the PR body
- [x] Same test count before and after — Vitest 45 files, 312 tests on `dd5eae1` and after; e2e 86 passed, 8 skipped both

## Notes

Zod schemas sit in `server/` as Scope says, and three domain files take a type from them (`Results`, `Slot`, `createPollSchema`), so the `../server/**` pattern sets `allowTypeImports`: a runtime import from `server/` still fails lint. That option exists only on `@typescript-eslint/no-restricted-imports`, the rule used here.
