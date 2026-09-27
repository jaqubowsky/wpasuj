# 04: Answer on "Moje"

Status: done
Blocked by: 02-day-hour-grid.md, 03-create-poll.md

## Parent

`spec/brief.md` ("Answer", "Ergonomics", "Motion"), mockup `spec/design/v2/answer-phone.html`, `patterns.md` ("Poll header").

## Outcome

A first-time participant opens the link on a phone, types a name, taps or drags hours on the grid, and sees "Zapisane" beside the name without pressing a button; reopening the link resumes editing; "Nie mogę w żadnym terminie" saves an empty set; a name already in the poll asks "To ty, Ola?" and "Tak, to ja" moves the row to this device. The page opens on "Moje" when this device has not answered and on "Wszyscy" when it has, and never switches tabs by itself.

## Scope

- `src/modules/answer-poll`: pure name rules (trim, collapse spaces, NFC, `toLocaleLowerCase('pl')` uniqueness), the save action (create on first save, rename, replace slots, participant cookie, 30-participant limit, `closed` when a final time is set), the claim action for "Tak, to ja", `use-autosave.ts` (500 ms after a stroke, one save in flight, newest pending next, "Nie zapisano" with "Spróbuj ponownie" until success), the "Moje" panel on the shared grid
- Filling the "Moje" panel in `src/app/e/[id]/page.tsx`; the tab choice on load

## Out of scope

- Heatmap and results (05); the final-time banner (06) beyond returning `closed`

## Acceptance criteria

- [x] Unit tests for the name rules and the autosave queue (fake timers): `src/modules/answer-poll/name-rules.test.ts`, `src/modules/answer-poll/use-autosave.test.ts`
- [x] Action tests: success, `invalid`, `name-taken`, `not-yours`, `closed`, `full`, `gone`: `src/modules/answer-poll/answer-actions.test.ts`
- [x] Playwright on phone-chromium and phone-webkit at 390: a fresh participant answers with a name and one drag and sees "Zapisane"; the same with taps only; a second context typing the same name gets "To ty, Ola?" and takes the row over: `e2e/answer-poll.spec.ts` (touch drag and `tap()` on phone-chromium, mouse drag and `tap()` on phone-webkit per decision 14; phone-webkit runs in CI only)
- [x] Polling never overwrites local "Moje" state (test with a concurrent save from another context): `e2e/answer-poll.spec.ts` "server data never overwrites my Moje grid while another device saves" and `answer-panel.test.tsx` "resumes the saved answer and keeps it when newer server data arrives"; rerun once ticket 05 adds polling
- [x] Screenshots at 390 and 1440: empty, painting, Zapisuję, Zapisane, Nie zapisano, "To ty?", "nie może"; PR body names the mockup and parts compared: `e2e/screenshots/answer-*` via `e2e/answer-poll.spec.ts`, table in pull request #5

## Comments

- Host acceptance of the first head closed 13 points: tab lead above the Segment and body below (decision 23), "Kiedy możesz?" heading, pending answer sent on hide, leave and unmount, focus rules in `use-answer`, claim reads its row inside the write, stored name on "To ty?" and after "Tak", strokes kept while "Tak" is on its way, sticky "Nie zapisano", "Gotowe" only while this device holds a row, mounted Status region, exhaustive claim switch, View Transition on the tab switch, one-shade paint preview
