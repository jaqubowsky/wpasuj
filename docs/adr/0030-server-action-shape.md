# ADR 0030: One shape for server actions and one store per module

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** owner (WPA-70); container (the lint rule's form)
- **Replaces:** none

## Context

The owner's review of WPA-70 found every module's `server/` repeating the same checks in its own way: `organisersPoll` returned a poll or a reason string, so each organiser action repeated `if (typeof poll === "string")`; "load a live poll" was written three times; `saveAnswer` and `claimName` opened with the same gone / invalid / closed prelude; `drizzle-orm` was imported in seven module files, actions included. The owner's wiki pages "errors-as-values", "vertical-slice-architecture" and "dry-principle" set the direction.

## Decision

- A server action reads parse, guard, store, result. `parse(schema, input)` and every guard (`organisersPoll`, `livePoll`, `openPoll`) return a `Result` from `src/shared/result.ts`; the action returns early with `if (!found.ok) return found;` per step and ends in `ok(…)` or `fail("<reason>")`
- Results stay flat objects (`{ ok: true, id }`, `{ ok: false, reason, …detail }`), so what the client receives did not change. A reason is a string literal
- A UI `switch` over a reason ends in `default: return <value> satisfies never`, so a new reason fails `typecheck` where it is mapped. The organiser actions reach view-results through its own `Outcome` type, so a new organiser reason fails at `src/app/e/[id]/page.tsx`, where the actions are handed to it
- One `<name>-store.ts` per module holds every `getDb()` call and every `drizzle-orm` import, including the module's own copy of the live-poll lookup ("copy domain code", as `isExpired` in ADR 0026). No repository or service is shared across modules; `src/shared/db/` keeps the client, schema and migrations (ADR 0001)
- Core ESLint `no-restricted-imports` refuses `drizzle-orm` and `@/shared/db/client` in `src/` outside `*-store.ts`, `src/shared/db/`, `src/shared/testing/`, tests and `src/app/api/health/`. It is the core rule, not `@typescript-eslint/no-restricted-imports`: a second block setting the latter would replace the module-boundary options each module sets
- No `neverthrow`: a dependency and its ESLint plugin, for four actions

## Consequences

- A query written inside an action, a hook or a page fails lint. A new query goes into the module's store
- A guard that returns something other than a `Result` brings back the per-action checks this removed
- Dropping the `satisfies never` default lets a new reason fall through the UI silently
- Merging the per-module `livePoll` copies into `shared` would make modules share a domain rule that can change on its own in each
