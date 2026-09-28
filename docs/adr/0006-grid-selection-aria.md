# ADR 0006: The grid announces selection on the gridcell

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container
- **Replaces:** `cell-one-component`, `grid-focus-aria` (former decision entries)

## Context

Cell is one component: a button (`state`) on the answer grid, or a heat cell (`heat`) on results. A selected cell could be announced twice, once by the button and once by the grid.

## Decision

The grid passes each Cell `selected` and announces it once, as `aria-selected` on the gridcell, so Cell carries no `aria-pressed` (corrected by WPA-19). Focus stays on the Cell button and `aria-selected` on its gridcell, which the ARIA grid pattern allows for focus inside a cell.

## Consequences

- Adding `aria-pressed` to Cell makes a screen reader announce the state twice
- Whether VoiceOver announces the change after Space is checked on a device in WPA-8, not in a container without a screen reader
- The `everyone` and `best` heat props are gone (ADR 0029)
