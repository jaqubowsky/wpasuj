# ADR 0008: Touch on WebKit is proven by computed styles

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** container
- **Replaces:** `webkit-touch-proof` (former decision entries)
- **Amended by:** ADR 0036 (the hold on phone-webkit is proven with dispatched pointer and touchmove events)

## Context

Playwright cannot move a touch in WebKit, so a real drag cannot run on phone-webkit.

## Decision

On phone-webkit the grid's touch zones are proven by computed `touch-action` and snap; the real touch drag and swipes run on phone-chromium through CDP.

## Consequences

A touch-drag test added for phone-webkit fails for a tool reason, not a product one.
