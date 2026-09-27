# 21: Live demo grid

Status: ready-for-agent
Blocked by: 26-tailwind-base.md (written in Tailwind from the start, per the `AGENTS.md` Styling pattern)

## Parent

As ticket 14. Reference render: `section-demo.png`.

## Outcome

"Wypróbuj na żywo · Czworo znajomych już zaznaczyło. Twoja kolej." Four invented friends have answered; the visitor taps or drags their own hours on a real grid, and the best time, the count, "Nie może: …" and the two alternatives recompute at once. "Zrób taką ankietę dla swojej paczki" scrolls to the hero form; "Wyczyść moje godziny" resets.

## Scope

- `src/modules/landing/ui/demo/` on `src/shared/day-hour-grid`; a copy of the runs and best-time rule in `landing/domain/` (copy domain code, no module import); no network, no storage
- Loaded lazily near the viewport

## Out of scope

- Saving anything

## Acceptance criteria

- [ ] Unit tests of the copied rule on the demo data, before and after the visitor adds hours
- [ ] e2e on phone-chromium, phone-webkit and desktop: a tap and a drag change the best time as a hand count says
- [ ] Screenshots at 1440 beside `section-demo.png` and at 390; differences listed in the PR body
