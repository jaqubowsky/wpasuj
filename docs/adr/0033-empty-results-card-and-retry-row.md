# ADR 0033: The empty results stay in their white card, and the save retry keeps its own row

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** owner

## Context

Two states on the poll page differ from the brief and the design system, and no v3 board draws either (WPA-8):

- With nobody answered, "Wszyscy" shows "Nikt jeszcze nie odpowiedział. Wyślij link na grupę." in the white results card (`results-body.tsx`) in place of the heatmap. `spec/brief.md` ("the block reads") and `spec/design/system/patterns.md` ("Best time") put that line in the ink best-time card
- After a failed save, "Spróbuj ponownie" sits on its own row under the name field (`answer-lead.tsx`). `spec/brief.md` and the Status README of the design system put it beside "Nie zapisano"; at 390 px "Twoje imię", "Nie zapisano" and the button do not fit one row

## Decision

Both stay as built. "Wszyscy" keeps the line in its white card with nobody answered, and "Spróbuj ponownie" keeps its own row under the name field after a failed save. The brief and the design system are not changed.

## Consequences

- A change that moves the empty line into the best-time card, or the retry button beside the status, follows the brief and undoes this decision; it needs the owner
- Screens of both states are judged against this ADR, not against `patterns.md` or the Status README
