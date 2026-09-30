# ADR 0038: The logo leads to the landing

- **Status:** Accepted
- **Date:** 2026-09-30
- **Owner:** owner (WPA-100)
- **Replaces:** ADR 0035's "a click scrolls to the top" for every page except the landing

## Context

ADR 0035 made `BrandMark` a button that scrolls to the top, shuffles its tiles and bursts, on the landing and on every app page. The owner finds it irritating that the logo on a poll page, the legal pages and the error pages does not lead to the landing, the way a logo does on most sites (WPA-100, 2026-09-30).

## Decision

- On every page except `/` the logo is a link to `/`, named "Wpasuj, strona główna". `AppHeader`, which heads every page but the landing, renders `<BrandMark href="/" />`
- On `/` the logo stays a button, "Wpasuj, na górę strony", that scrolls to the top; the landing's own header renders `<BrandMark />`
- The tile shuffle and the burst stay on both

## Consequences

- A participant who taps the logo on a poll page leaves it for the landing, as the footer's "Zrób własną ankietę" already does
- A page that should scroll to the top instead has to render `BrandMark` without `href`; `AppHeader` on the landing would link the landing to itself
