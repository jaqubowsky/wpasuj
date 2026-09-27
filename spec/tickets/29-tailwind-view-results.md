# 29: Tailwind in view-results

Status: done
Blocked by: 26-tailwind-base.md, 33-architecture-gates.md

## Parent

`spec/brief.md`, "Stack (decided)" (Styling) and "Code rules"; host decision in `spec/decisions.md` (Tailwind migration)

## Outcome

Results, the organiser view and the link preview page look and behave exactly as before, styled with the theme utilities.

## Scope

- `src/modules/view-results/**/*.module.css` (8 files, 362 lines) to utilities, the pattern from 26
- The Open Graph image keeps its inline styles (Satori takes no classes)

## Out of scope

- Other modules: the sibling tickets 27 to 30
- Any visual or behaviour change: none

## Acceptance criteria

- [x] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body — all 68 e2e screenshots differ by 0.000% from `e580838`, the view-results ones (results empty, three answers, sheet, side panel, final time, organiser row, menu and delete confirm, poll gone, link preview) included; the PR body
- [x] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base — `src/modules/view-results` holds only `best-time-card.css` and `cell-details.css` (keyframes) and `heatmap.css` (the desktop surface on the grid's hour column, DOM of `shared/day-hour-grid`); all five and `knip` exit 0, Vitest 46 files, 313 tests and e2e 104 passed, 8 skipped on `e580838` and after (phone-webkit in CI)

## Comments

- 14px/20px text (who can, "Też dobre" times, the organiser problem) uses the existing `text-footer` token, which has exactly those values; no new token.
- `FinalTime` restyles the `OrganiserProblem` alert inside it with `[&_p[role=alert]]:` variants, the same `.x p[role=alert]` specificity as the old `.final p[role="alert"]`. No e2e screenshot shows that state; checked in the built CSS only.
- The old `.confirm > p { margin: 0 }` is dropped: the `Text` it targeted already sets `m-[0]`.
- Buttons and links that had the `font` shorthand carry `normal-nums`, as the avatar in ticket 27, since the shorthand reset the body's tabular numbers.
