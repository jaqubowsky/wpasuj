# ADR 0011: Segment keeps every panel mounted

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** container
- **Replaces:** `segment-keeps-panels` (former decision entries)

## Context

The answer on "Moje" is seeded from the server once; remounting it would reseed it and drop unsaved strokes.

## Decision

Segment keeps every panel mounted and hides the unselected ones (`hidden`), so switching to "Wszyscy" and back never reseeds "Moje" from the server.

## Consequences

Rendering only the selected panel loses the answer in progress on every tab switch.
