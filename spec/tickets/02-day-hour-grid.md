# 02: Day-hour grid

Status: done
Blocked by: 01-foundation.md

## Parent

`spec/brief.md` ("Answer", step 3; "Ergonomics"; "Grid"), `spec/design/system/patterns.md` ("Day-hour grid"), `spec/design/v2/answer-phone.html` and `v2/grid.js` for layout.

## Outcome

A technical grid in `src/shared/day-hour-grid/` that the answer and results tabs render through a cell render prop: dates as columns, hours as rows, a sticky hour column, a date header with weekday over day number, sideways scroll with snap per date past four dates, the touch zones (`none` on cells, `pan-y` on the hour column, `pan-x` on the header) and an ARIA grid with `aria-multiselectable` (arrows move, Space toggles, Shift+arrows extend). It reports taps, header and hour-label taps, and drag rectangles as plain events; it holds no business rule and no selection state of its own beyond the stroke in progress.

## Scope

- `src/shared/day-hour-grid/` with its hook for pointer strokes (`use-paint-stroke.ts`), keyboard handling and tests
- A dev-only demo route or story page to screenshot it at 390 and 1440 with 3 and 7 dates

## Out of scope

- What a cell means (mine, heat, best): 04 and 05 decide through the render prop
- Autosave (04)

## Acceptance criteria

- [x] Unit tests: a drag from an empty cell reports an add rectangle, from a filled cell a remove rectangle; tap alone toggles one cell. Evidence: `src/shared/day-hour-grid/use-paint-stroke.test.ts`, `day-hour-grid.test.tsx` "reports a tap on a cell"
- [ ] Playwright on phone-chromium and phone-webkit: a drag across cells does not scroll the page; a vertical swipe on the hour column does; 7 dates scroll sideways with snap. Evidence: phone-chromium, real touch through CDP, `e2e/day-hour-grid.spec.ts` "on a touch screen". Left unticked: phone-webkit asserts only computed touch-action and snap, because Playwright cannot move a touch in WebKit (decision 14)
- [x] Keyboard test: arrows, Space, Shift+arrows behave as the ARIA grid pattern. Evidence: `src/shared/day-hour-grid/day-hour-grid.test.tsx`
- [x] Cells 48px tall, at least 56px wide at 390, 6px gap, 10px radius (asserted from computed style). Evidence: `e2e/day-hour-grid.spec.ts` "shows 3/7 dates as 48px tiles with a 6px gap"
- [x] Screenshots at 390 and 1440 in the CI artifact; PR body names the mockups compared. Evidence: `day-hour-grid-{3,7}-dates-*.png` in `e2e/screenshots/`, PR body

## Comments

- The grid fits the answer tab: `onStroke`, `onDateTap` and `onHourTap` are required, and cells are `touch-action: none`. Ticket 05 decides whether results need a mode without painting and focusable heat cells
- Shift+arrows only extend (mode `add`); shrinking with the opposite arrow does not remove
