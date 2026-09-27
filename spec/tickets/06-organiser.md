# 06: Organiser's extras and the final time

Status: ready-for-agent
Blocked by: 04-answer-poll.md, 05-view-results.md

## Parent

`spec/brief.md` ("Organiser's extras", "Motion"), `patterns.md` ("Best time").

## Outcome

The organiser, on "Wszyscy", has "Przypomnij" and "Więcej" in one row under the title and "Ustal ten termin" on the best time and on each "Też dobre" row. "Przypomnij" shares or copies "Już są: Bartek, Ola i Michał. Reszta, kiedy możecie? {title} {link}" ("Już jest: Ola." for one; the plain invite with nobody). "Ustal ten termin" makes the page lead with "Ustalone: sobota 18.10, 19:00" for everyone, with "Dodaj do kalendarza" downloading an `.ics` in UTC, and closes answering; "Zmień" reopens it. "Więcej" holds "Kopiuj link", "Link organizatora" (a URL that sets the organiser cookie on another device, with one line to keep it private) and "Usuń ankietę", confirmed inline. Every poll page ends with the quiet "Zrób własną ankietę" link.

## Scope

- `src/modules/view-results`: reminder text (pure, Polish list joining), `.ics` builder (pure) and its route handler, the "Ustalone" block, the organiser row and menu, `use-is-organiser.ts`
- Route handler for the organiser link (sets the cookie, redirects)
- The page supplies `setFinal`, `clearFinal` and `deletePoll` from create-poll as narrow function types; actions return `not-organiser` and `gone`
- Final-time fill-in-sequence motion

## Out of scope

- OG image (07)

## Acceptance criteria

- [ ] Unit tests: reminder text for 0, 1, 2 and 3+ names; `.ics` with DTSTART and DTEND in UTC for a poll zone of `Europe/Warsaw` across a DST change
- [ ] Action tests: set, clear and delete succeed for the organiser and return `not-organiser` and `gone`
- [ ] Playwright: remind copies text naming who answered; set the time, a participant context sees "Ustalone" and downloads the `.ics` with the right UTC times; answering is closed; the organiser link restores organiser controls in a fresh context
- [ ] Screenshots at 390 and 1440: organiser row, menu open, delete confirm, Ustalone; PR body names the parts compared
