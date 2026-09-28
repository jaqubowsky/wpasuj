# ADR 0013: How answers are saved

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container; host (`unload-save`, `save-queue`)
- **Replaces:** `save-status`, `unload-save`, `save-queue` (former decision entries)

## Context

The brief sends one save in flight at a time, the newest pending set next, after a 500 ms quiet time, and allows no route handler.

## Decision

- The Status reads "Zapisuję" from the stroke on, through the quiet time, so "Zapisane" never stands beside a change that has not been sent; after a failure it keeps "Nie zapisano" with "Spróbuj ponownie" through new strokes until a save succeeds
- While a save is in flight a pending set waits, also when the page hides: the brief's queue wins over sending at once on hide (acceptance of WPA-13). "Spróbuj ponownie" reads "Zapisuję" from the tap, and a tap while that retry runs sends nothing more (WPA-21)
- A save sent on unload may be cancelled with the page: server actions fetch without `keepalive`, so a leave within 500 ms of the last tap can lose that change (acceptance of WPA-13)

## Consequences

- Sending on hide past the queue breaks the brief's one-in-flight rule
- Making unload saves reliable needs a route handler, which the brief's Stack does not allow
