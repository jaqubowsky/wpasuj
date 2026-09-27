# 03: Create a poll and land on its page

Status: done
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

- [x] Unit tests for every preset (Dziś, Jutro, Ten weekend without past days, Przyszły tydzień), chip lit and toggle rules, the 10-date limit with "Maksymalnie 10 dni", the Własne range bounds: `src/modules/create-poll/date-presets.test.ts`, `hour-range.test.ts`, `create-poll-form.test.tsx`
- [x] Action tests: success, and each failure reason the action can return, against a real SQLite file: `create-poll-action.test.ts` (success, 12 `invalid` cases), `organiser-actions.test.ts` (`setFinal`, `deletePoll`: success, `not-organiser`, `gone`, `invalid`)
- [x] Playwright on phone-chromium and phone-webkit: create with "Ten weekend", the default range and a title in under 30 seconds of steps, landing on the poll page; share stubbed and copy fallback both covered: `e2e/create-poll.spec.ts`; PR #2 CI run 36313103552, 23 passed across phone-chromium, phone-webkit, desktop-chromium
- [x] Inputs render at 16px or more; the sticky button sits above the safe area: `e2e/create-poll.spec.ts` "inputs render at 16px or more", "the create button sits above the safe area"; `.bar` pads with `env(safe-area-inset-bottom)`
- [x] Screenshots at 390 and 1440 of create (empty, filled, Własne, month open, the 10-day message), the poll shell and the gone page; PR body names the mockup and parts compared: CI run 36313103552 artifact `screenshots` holds all seven screens for the three projects; PR #2 body "Screens compared"

## Comments

- Segment now takes `panels` and owns the tabpanel; 04 and 05 pass their panel content through `src/app/e/[id]/poll-tabs.tsx`
- `src/shared/last-name.ts`, `share-link.ts`, `token-cookie.ts` and `src/shared/testing/*` are ready for 04 and 06
- The time-zone note for viewers in another zone ("named once in small text") is not built; no ticket names it yet
