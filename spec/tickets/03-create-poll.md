# 03: Create a poll and land on its page

Status: ready-for-agent
Blocked by: 01-foundation.md

## Parent

`spec/brief.md` ("Create", "Data", "Errors and gone polls"), `spec/decisions.md`, mockup `spec/design/v2/create-phone.html`, `patterns.md` ("Create form", "Poll header").

## Outcome

On `/` the organiser types a title, picks dates with the chips or the two-week strip (or the month calendar), keeps "Wieczór 17–23" or picks "Cały dzień" or "Własne" with steppers, checks the prefilled name, and taps "Utwórz i wyślij na grupę": the share sheet opens with "Kiedy możecie? {title} {link}" (or the link is copied with "Link skopiowany"), and the organiser lands on `/e/:id` showing "{imię} pyta", the title, the answered count line, and the "Moje" / "Wszyscy" segment with two empty panels for 04 and 05. A missing or expired poll shows "Tej ankiety już nie ma" with a link to create one.

## Scope

- `src/modules/create-poll`: form components, `use-*` hooks, pure date presets and range rules with the clock as an argument, the zod schema, the create action (organiser token and cookie, `created_by_participant`, cleanup of polls 60 days past their last date before insert), `setFinal` and `deletePoll` writes exported for 06 but without UI
- `src/shared`: share sheet and clipboard, date formatting
- `src/app/page.tsx`, `src/app/e/[id]/page.tsx` shell, the gone page
- Desktop create at 1440 composed from design-system parts

## Out of scope

- The grid and answering (04), results (05), organiser buttons (06), OG image (07)

## Acceptance criteria

- [ ] Unit tests for every preset (Dziś, Jutro, Ten weekend without past days, Przyszły tydzień), chip lit and toggle rules, the 10-date limit with "Maksymalnie 10 dni", the Własne range bounds
- [ ] Action tests: success, and each failure reason the action can return, against a real SQLite file
- [ ] Playwright on phone-chromium and phone-webkit: create with "Ten weekend", the default range and a title in under 30 seconds of steps, landing on the poll page; share stubbed and copy fallback both covered
- [ ] Inputs render at 16px or more; the sticky button sits above the safe area
- [ ] Screenshots at 390 and 1440 of create (empty, filled, Własne, month open, the 10-day message), the poll shell and the gone page; PR body names the mockup and parts compared
