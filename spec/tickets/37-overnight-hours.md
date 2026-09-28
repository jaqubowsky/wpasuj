# 37: Hour ranges past midnight

Status: done
Blocked by: 34-design-token-scale.md

## Parent

Owner-approved screens: `~/.sandboxes/wpasuj/host-acceptance/design-v3/*.dc.html` (canvas https://claude.ai/artifact/65gibAJh1194kmFL6BobRn). They win over `spec/design/v2` where they differ; the brief's rules (tokens, 44px targets, reduced motion) still hold (boards Create, TimePhone, TimeDesktop). `spec/brief.md` "Creating a poll"; decision 59.

## Outcome

An organiser can ask for any whole-hour range, including one past midnight such as 22:00 to 4:00, and the grid, the best time, the reminder text, the link preview and the `.ics` all read it as one evening running into the next day.

## Scope

- Create form: "Od" and "Do" always visible, no presets. Phone: bottom sheet with two hour columns and the summary "22:00 → 4:00 · 6 godzin". Desktop (board TimeDesktop, the full create screen): 24 hour tiles in three rows of eight ordered 6 to 5, the hour number only, click start then end; ends in `ink`, the span in `heat-2` with `ink` text; the same summary. No "rano" or "następnego dnia" labels: order carries it
- Model: a poll's range is `firstHour` plus `length` (1 to 24), stored so a slot keeps its calendar date of the evening it belongs to; migration keeps existing polls identical
- Grid rows run 22, 23, 0, 1, 2, 3 under the evening's date column; best time, runs and heat treat the wrap as contiguous; labels "pt 17.10, 23–2"
- `.ics` and "Ustalone" produce the right UTC start and end across midnight and across DST changes in the poll's zone

## Out of scope

- Minutes, per-day ranges: phase 2

## Acceptance criteria

- [x] Unit tests of the range model: 22→4 is 6 hours; 0→24 is 24; a run 23–1 is one run; DST night in Europe/Warsaw keeps local hours. Evidence: `src/modules/create-poll/domain/hour-range.test.ts` ("22:00 to 4:00 is 6 hours", "0:00 to 24:00 is 24 hours"), `src/modules/view-results/domain/best-time.test.ts` ("keeps 23:00 to 1:00 one run across midnight"), `src/modules/view-results/domain/calendar-file.test.ts` ("keeps local hours through a night the clocks go back or forward")
- [x] e2e: create 22:00→4:00 on phone and desktop, paint 23 and 0 on one date, results show one run "23–1". Evidence: `e2e/create-poll.spec.ts` "the organiser asks for 22:00 to 4:00 and a night run reads 23–1" (phone-chromium, desktop-chromium; phone-webkit in CI)
- [x] `.ics` test: a set time 23–1 on 25.10 in Europe/Warsaw has the right UTC DTSTART and DTEND. Evidence: `src/modules/view-results/domain/calendar-file.test.ts` "ends a set time 23–1 on 25.10 the next day in UTC" (20261025T220000Z to 20261026T000000Z)
- [x] Migration test: existing polls read back unchanged. Evidence: `src/shared/db/migrate.test.ts` "keeps a poll created before ranges could pass midnight"
- [x] Screenshots of the pickers beside TimePhone and TimeDesktop. Evidence: `e2e/screenshots/create-hours-phone-chromium.png` and `create-hours-desktop-chromium.png`, saved by the night e2e and uploaded by CI; compared in the pull request body
- [x] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green. Evidence: task directory `logs/gate-20260927T232413/summary.txt` (all exit 0; 396 unit tests, 139 e2e passed in phone-chromium and desktop-chromium); phone-webkit runs in CI
