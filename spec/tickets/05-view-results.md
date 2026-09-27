# 05: Results on "Wszyscy"

Status: done
Blocked by: 02-day-hour-grid.md, 03-create-poll.md

## Parent

`spec/brief.md` ("Results", "Terms", "Motion"), mockups `spec/design/v2/results-phone.html` and `results-desktop.html`, `patterns.md` ("Best time", "Bottom sheet").

## Outcome

Anyone on "Wszyscy" sees the best time as the headline ("Najlepiej: sobota 18.10, 19–22", "5 z 6 może", "Nie może: Ola"), up to two "Też dobre" runs, the heatmap with counts in five buckets and an ink border where everyone is free, who can and can't for a tapped cell (bottom sheet on the phone, side panel on desktop), and "Kto odpowiedział", newest first. Other people's changes appear within 10 seconds while the tab is visible and at once on focus.

## Scope

- `src/modules/view-results`: pure runs and best-time ranking (free-set size, then length, then earliest; "Też dobre" non-overlapping), buckets, respondent share, relative time with the clock as an argument; the read route handler `src/app/api/polls/[id]/route.ts` with a zod response schema; TanStack Query polling (10 s, refetch on focus, paused while hidden); the panel, heatmap cells, sheet and side panel
- Results need the poll's title and dates as a narrow function type the page supplies
- Seed participants in tests by writing rows directly; the empty state copy

## Out of scope

- Organiser buttons and the final time (06), OG image and `.ics` (06, 07)

## Acceptance criteria

- [x] Unit tests for runs, best time, "Też dobre", buckets, including a case where the free set changes while the count stays the same (the run splits): `src/modules/view-results/best-time.test.ts`, `heat.test.ts`
- [x] Read endpoint test: shape validated, gone poll answered with 404: `src/app/api/polls/[id]/route.test.ts`
- [x] Playwright: with seeded answers from three people the headline, "Też dobre", cell counts, per-cell names and "Kto odpowiedział" agree with a hand count; a change from another context shows within 10 s: `e2e/view-results.spec.ts`
- [x] Screenshots at 390 and 1440: empty, three answers, sheet open, side panel open; PR body names the mockups and parts compared: `results-*` in the CI `screenshots` artifact
