# ADR 0009: Touch targets stay at 44px

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** container
- **Replaces:** `segment-height`, `date-strip-card`, `small-button-height` (former decision entries)

## Context

The brief sets a 44px minimum touch target; the design system draws some controls at 40px, and the create page's date strip does not fit its card at 390px.

## Decision

- Segment tabs and the small Button are 44px tall, where the design system draws 40px (small Button: WPA-18)
- The create page's date strip sits on a `surface` card (20px radius, 12px padding) that reaches 12px into the page gutter, because seven 44px tiles with 6px gaps (344px) do not fit a padded card inside the 350px column at 390; the tiles keep the brief's target and gap

## Consequences

Matching the design system's 40px, or shrinking the date tiles to fit the card, breaks the brief's minimum target.
