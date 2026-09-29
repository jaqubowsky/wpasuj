# ADR 0028: The error page retries with retry()

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container
- **Replaces:** `error-page` (former decision entries)

## Context

Any unhandled error, a root layout one included, needs a Polish page; Next offers `reset()` and `retry()`.

## Decision

The error page shows "Coś poszło nie tak" / "Spróbuj jeszcze raz. Jeśli dalej nie działa, zrób własną ankietę." in `PageFrame` under the app header, with "Spróbuj ponownie" and a "Zrób własną ankietę" link to `/`, and no error message or digest. "Spróbuj ponownie" calls Next's `retry()`, not `reset()`, because `reset()` re-renders without fetching again and a server error stays on screen (WPA-55).

## Consequences

Switching to `reset()`, which WPA-55 named, leaves a server error on screen after the tap.
