# ADR 0007: Demo routes behind DEMO_ROUTES

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** container
- **Replaces:** `demo-routes-flag` (former decision entries)

## Context

The `src/app/dev/` demo pages must not be public, yet end-to-end tests run the production build and need them.

## Decision

Demo routes under `src/app/dev/` answer 404 unless `DEMO_ROUTES=1`, which `.env.development` and the Playwright web server set.

## Consequences

Removing the flag from the Playwright web server breaks the e2e specs that open demo pages; setting it on the production service publishes them.
