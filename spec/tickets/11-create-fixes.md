# 11: Create fixes from the acceptance of ticket 03

Status: done
Blocked by: None, can start immediately

## Parent

`spec/brief.md` ("Create", "Errors and gone polls", "Code rules"), host acceptance `~/.sandboxes/wpasuj/claude-wpasuj-t03-create/acceptance.md`, mockup `spec/design/v2/create-phone.html`.

## Outcome

The organiser always learns what happened to the link, one tap makes one poll, and a viewer in another time zone reads, once and in small text, which zone the hours are in.

## Scope

- `src/modules/create-poll`: share and copy both failing shows "Nie udało się skopiować linku. Skopiuj go z paska adresu." before landing on the poll; a thrown create shows "Coś poszło nie tak. Spróbuj jeszcze raz."; the button stays blocked from the tap until the page changes
- `poll-rules.ts`: the expiry cutoff and the past-date rule, called from the action and the date picker; `Selection` and `HourRange` derived from their sources
- "Ten weekend" unit cases for Friday and Monday
- The date strip on a `surface` card with the card radius, as `create-phone.html`
- The poll page header: when the viewer's `Intl` zone differs from the poll's, one small line naming the poll's zone ("Godziny w strefie Europe/Warsaw"); the page supplies it, the zone comparison is a pure function

## Out of scope

- Type roles on the form (ticket 09)
- A `secure` cookie flag (production phase)

## Acceptance criteria

- [x] Hook test: share rejected and clipboard rejected shows the copy line; a thrown action shows the neutral line. `create-poll-form.test.tsx`, "says to copy the link from the address bar when sharing and copying both fail", "says the link was not copied and still lands on the poll", "says something went wrong when creating throws and lets the organiser try again" (`useCreatePoll` driven through the form, where the copy renders)
- [x] Hook test: a second submit during "Link skopiowany" creates nothing. `create-poll-form.test.tsx`, "a second tap while Link skopiowany shows creates nothing"
- [x] Unit tests: cutoff and past-date rule in `poll-rules.test.ts`; weekend on Friday gives Fri–Sun, on Monday gives the coming Fri–Sun. `poll-rules.test.ts` "a date before today is past…", "cleanup keeps 60 days…"; `date-presets.test.ts` "Ten weekend on a Friday…", "Ten weekend on a Monday…"
- [x] e2e with `timezoneId: 'Europe/London'` on a Warsaw poll shows the zone line; with the same zone it does not. `e2e/create-poll.spec.ts`, "a viewer in London on a Warsaw poll"
- [x] Screenshots at 390 and 1440 of create and the poll header with the zone line. `e2e/screenshots/create-*` and `poll-zone-line-*`, CI artifact `screenshots`
