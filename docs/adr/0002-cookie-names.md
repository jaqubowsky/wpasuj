# ADR 0002: Cookie names and attributes

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** host
- **Replaces:** `cookie-names` (former decision entries)

## Context

Each device proves who it is with a cookie per poll, one for the participant and one for the organiser; the brief leaves their names open.

## Decision

The participant cookie is named by the poll id (`<id>`), the organiser cookie `<id>-org`. Both are httpOnly, SameSite=Lax, path `/`, and last one year. When they are `Secure` is ADR 0027.

## Consequences

Renaming either cookie signs every existing participant and organiser out of their polls.
