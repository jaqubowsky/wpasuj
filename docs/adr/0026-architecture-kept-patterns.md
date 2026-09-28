# ADR 0026: Patterns the architecture rules keep

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container
- **Replaces:** `domain-type-imports`, `architecture-kept-patterns` (former decision entries)

## Context

The architecture audit (WPA-6, `spec/audits/architecture.md`) found patterns the rules could be read to forbid.

## Decision

- Domain files keep type-only imports from their module's `server/` schemas (`allowTypeImports`): types derive from the zod schemas, and moving the schemas into `domain/` would put zod's runtime into the pure layer (WPA-21, note from PR #15)
- A module's `ui/` imports its own server actions and the client-parsed results schema from `../server/`: a client component needs the action's own reference
- Components call pure domain functions such as `bestTimes` in their body: a hook holds state and effects, not a pure call
- `isExpired` and its 60 days are copied in create-poll and answer-poll ("copy domain code")
- UI tests stub a server action at its import: on the client it is a network call, the only seam for a dropped or late answer; each action runs on real SQLite in its own tests
- A module's narrow input type written in its own words (`PreviewedPoll`) is the brief's "a module asks", not a type written twice

## Consequences

An audit or refactor that "fixes" any of these reopens a question already settled; the lint allows each one.
