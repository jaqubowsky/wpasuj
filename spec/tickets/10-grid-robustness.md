# 10: Grid robustness from the acceptance of ticket 02

Status: claimed
Blocked by: 04-answer-poll.md, 05-view-results.md

## Parent

`spec/brief.md` ("Answer" step 3, "Ergonomics", "Grid"), host acceptance `~/.sandboxes/wpasuj/claude-wpasuj-t02-grid/acceptance.md`.

## Outcome

Painting stays exactly the rectangle the first finger draws, whatever else touches the screen or cancels the gesture; a participant with more than four dates sees that more exist; screen readers hear each cell with its own date; a mouse drag is proven in all three browsers.

## Scope

- `src/shared/day-hour-grid`: a stroke belongs to its first pointer (`pointerId`), a second pointer neither restarts nor moves it; `pointercancel` and a move with no button pressed drop the stroke without reporting it
- ARIA: the header row lines up with the data rows (a corner `columnheader`, or `aria-colindex`)
- One source of "selected" per cell passed to the render prop, announced once
- Columns never narrower than 56px on a phone (`max(56px, …)`)
- Past four dates, a fifth column peeks in, about 0.4 of a column
- e2e: a `page.mouse` drag on phone-chromium, phone-webkit and desktop-chromium

## Out of scope

- Real touch in WebKit (decision 14)
- Auto-scroll during a stroke, Home/End keys (the brief does not ask)

## Acceptance criteria

- [x] Unit test: a second pointer down during a stroke changes neither its anchor nor its rectangle: `use-paint-stroke.test.ts` "keeps the rectangle of the first finger when a second one touches the grid"
- [x] Unit test: `pointercancel` and a buttonless move report no stroke: `use-paint-stroke.test.ts` "drops a stroke the browser cancels", "drops a stroke once the pointer moves with no button pressed"
- [x] Component test: column header n is the header of data column n: `day-hour-grid.test.tsx` "puts each date header over its own column of cells"
- [ ] e2e on all three projects: mouse drag paints the rectangle: `e2e/day-hour-grid.spec.ts` "a mouse drag across cells paints the rectangle…", green on phone-chromium and desktop-chromium locally; phone-webkit only in CI
- [x] e2e: at 320 columns are ≥56px; with 7 dates at 390 part of the fifth column is visible: `e2e/day-hour-grid.spec.ts` "keeps 7 dates at least 56px wide", "shows part of the fifth of 7 dates at the edge of a phone"
- [ ] Screenshots at 390 and 1440 with 7 dates in the CI artifact: `day-hour-grid-7-dates-*` from "shows 7 dates as 48px tiles with a 6px gap"; waits for the CI run

## Comments

- "Announced once" needed `src/shared/ui/cell`, outside the grid: on the user's word Cell dropped `pressed`/`aria-pressed` and the grid's `aria-selected` is the one announcement (decision 10). `spec/design/system/components/Cell/README.md` and `preview.html` still show `aria-pressed`; left to the host
- At 320 the 56px floor wins over the peek: the fourth column is the one cut and the fifth is off screen. The peek of 0.4 holds from a container of 324.4px (390 phones and up)
