# 25: Feedback on creating a poll and on "Nie mogę w żadnym terminie"

Status: ready-for-agent
Blocked by: 13-module-layers.md

## Parent

`spec/brief.md` ("Create", "Answer" 6, "Motion", "Ergonomics", "Out, by name"). Owner feedback after using the app: the create tap "just opens and copies, you don't know what happened"; "Nie mogę w żadnym terminie" "feels like it doesn't work".

## Outcome

Creating a poll feels like something was made: the button answers at once ("Tworzę ankietę…"), the title carries over from the form into the poll page, and the organiser lands on a "Ankieta gotowa" card with the link, a large "Wyślij na grupę" and the line "Wklej go na grupę. Odpowiedzi pojawią się tutaj." On the phone the share sheet still opens right after the tap; the card is there when the organiser comes back. Tapping "Nie mogę w żadnym terminie" visibly clears the painted cells, replaces the grid's lead with "Zapisane: nie możesz w żadnym terminie" and "Cofnij" (restores the previous hours and saves them), and the link reads as selected; a tap on any hour leaves that state.

## Scope

- create-poll: a pending state on the button within 100 ms (label and a progress mark, the button stays in place); the "Link skopiowany" and "Nie udało się skopiować linku…" notices move onto the ready card
- The poll page: the "Ankieta gotowa" card for the organiser on the first visit after creating (a one-shot flag set by the create flow, not a URL anyone can share); "Wyślij na grupę" shares or copies the invite text; the card closes with "Gotowe" and stays closed
- A View Transition from the form's title to the poll title, and the chosen dates settling into the grid; none of it under reduced motion or without the API
- answer-poll: "Nie mogę" clears painted cells in sequence (120 ms per step, capped at 600 ms), shows the lead card with "Cofnij", keeps "Zapisuję / Zapisane" in the Status; "Cofnij" restores and saves the previous set
- Only `transform` and `opacity` animate; no confetti, no toast; `spec/decisions.md` records the new card and the transitions

## Out of scope

- The final-time sequence (already the one celebratory moment)

## Acceptance criteria

- [ ] e2e on phone-chromium, phone-webkit, desktop: after the tap the button shows the pending state before the action returns (slowed action), and the organiser lands on the "Ankieta gotowa" card with the link; a second visit shows no card
- [ ] e2e: "Wyślij na grupę" shares (stubbed) or copies the invite text
- [ ] e2e: "Nie mogę…" shows "Zapisane: nie możesz w żadnym terminie"; "Cofnij" brings back the previous hours and saves them; a tap on an hour leaves the state
- [ ] e2e with reduced motion: the flows work with no transition or animation
- [ ] Screenshots at 390 and 1440: pending button, ready card, "Nie mogę" state, beside the design-system parts named in the PR body
