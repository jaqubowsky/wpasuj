# 25: Feedback on creating a poll and on "Nie mogę w żadnym terminie"

Status: ready-for-agent
Blocked by: 27-tailwind-shared.md, 28-tailwind-create-answer.md, 29-tailwind-view-results.md

## Parent

`spec/brief.md` ("Create", "Answer" 6, "Motion", "Ergonomics", "Out, by name"). Owner feedback: the create tap "just opens and copies, you don't know what happened"; "Nie mogę w żadnym terminie" "feels like it doesn't work". Host research (Rallly PR #3162, Apple Invites guide, Partiful flows, MDN `navigator.share`, WebKit User Activation API, NN/g on confirmation dialogs, Material snackbar spec, Doodle and Rallly voting) in the task directory of this ticket's container.

## Outcome

- Creating: the button answers at once ("Tworzę ankietę…"); the form turns into the poll page (the title moves into place, the chosen dates become the grid's headers); the organiser lands on the poll with a "Wyślij na grupę" card on top that shows the link preview friends will see (the Open Graph card in miniature), a large "Wyślij na grupę" and "Kopiuj link". The share sheet opens from that tap, so it keeps the user activation iOS needs. After sharing, the card folds into one line: "Wysłane. Odpowiedzi pojawią się tutaj." Copying changes the button to "Skopiowano" for a moment; the card stays.
- "Nie mogę w żadnym terminie": the link becomes a selected toggle with a check; painted cells fade out in sequence; the Status reads "Zapisane"; an inline "Cofnij" stays until the person paints or leaves and restores the previous hours; one muted line "Organizator zobaczy Twoją odpowiedź". No reason asked. In results the person looks like anyone else, with "nie może".

## Scope

- create-poll: pending state within 100 ms; `navigator.share` no longer runs after the awaited create call; the create flow navigates to the poll with a one-shot flag (not a shareable URL) that shows the card once
- Poll page: the "Wyślij na grupę" card for the organiser (share or copy the invite text "Kiedy możecie? {title} {link}"), folded after a share, closable with "Gotowe"; the miniature reuses the link preview's data
- A View Transition from the form's title and dates to the poll page; nothing under reduced motion or without the API
- answer-poll: the toggle state, the sequence fade (120 ms per step, capped at 600 ms), "Cofnij" that restores and saves, leaving the state on any painted hour
- Only `transform` and `opacity` animate; no confetti, no toast, no emoji; `spec/decisions.md` records the card, the transition and the share timing

## Out of scope

- The final-time sequence; haptics (`navigator.vibrate` is not in iOS WebKit)

## Acceptance criteria

- [ ] e2e on phone-chromium, phone-webkit, desktop: with a slowed create action the button shows the pending state before it returns; the organiser lands on the card with the link preview; a second visit shows no card
- [ ] e2e: "Wyślij na grupę" calls `navigator.share` from its own tap with the invite text (stubbed), and folds the card after success; "Kopiuj link" copies and shows "Skopiowano"
- [ ] Unit or e2e: the create flow calls no `navigator.share` after the awaited action
- [ ] e2e: "Nie mogę…" selects the toggle, clears the grid, shows "Zapisane" and "Cofnij"; "Cofnij" restores and saves the previous hours; painting an hour leaves the state
- [ ] e2e with reduced motion: both flows work with no transition or animation
- [ ] Screenshots at 390 and 1440: pending button, the card, the folded line, "Nie mogę" state; the PR body names the design-system parts compared
