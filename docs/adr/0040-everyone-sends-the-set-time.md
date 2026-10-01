# ADR 0040: Everyone sends the set time to the group

- **Status:** Accepted
- **Date:** 2026-10-01
- **Owner:** owner (ticket 36, owner-approved boards Main, OrganiserSet and DesktopSet); host (WPA-117, the copy feedback)
- **Replaces:** decision 67 of the former `spec/decisions.md` (ticket 36) for the send action, which `c9a4767` dropped without an ADR

## Context

Once a time is set, the poll page is an invitation for everyone. WPA-117 asked to add "Wyślij termin na grupę" to the organiser card for the organiser only, with new wording, because the action looked missing; it had been on the invitation since ticket 36, for everyone. The host kept ticket 36's decision.

## Decision

- "Wyślij termin na grupę" shows on every settled poll: the organiser's is the primary action above "Dodaj do kalendarza", a participant's a secondary one under it
- It opens the share sheet where `navigator.share` exists and otherwise copies, with the message "{tytuł}: {Sobota 26 października}, {19:00–21:00}. {link}" (`setTimeMessage`)
- A copy swaps the button's label for a check and "Skopiowano" for 1.6 s, as the create flow's "Ankieta gotowa" card does; a refused copy shows "Nie udało się skopiować. Spróbuj jeszcze raz." under the actions

## Consequences

- Hiding the action from participants or rewording the message reverses this ADR; the unit and e2e tests on the message and the participant's click fail on either
- The "Skopiowano" look is one component in view-results (`ui/copied.tsx`) for both cards; changing it changes both
