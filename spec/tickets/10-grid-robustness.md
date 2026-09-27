# 10: Grid robustness from the acceptance of ticket 02

Status: ready-for-agent
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

- [ ] Unit test: a second pointer down during a stroke changes neither its anchor nor its rectangle
- [ ] Unit test: `pointercancel` and a buttonless move report no stroke
- [ ] Component test: column header n is the header of data column n
- [ ] e2e on all three projects: mouse drag paints the rectangle
- [ ] e2e: at 320 columns are ≥56px; with 7 dates at 390 part of the fifth column is visible
- [ ] Screenshots at 390 and 1440 with 7 dates in the CI artifact
