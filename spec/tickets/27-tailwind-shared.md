# 27: Tailwind in shared

Status: ready-for-agent
Blocked by: 26-tailwind-base.md

## Parent

`spec/brief.md`, "Stack (decided)" (Styling) and "Code rules"; host decision in `spec/decisions.md` (Tailwind migration)

## Outcome

`src/shared/` (design-system components, day-hour grid, fonts) is styled with the theme utilities and looks and behaves exactly as before.

## Scope

- `src/shared/**/*.module.css` (11 files, 599 lines) to utilities, the pattern from 26
- The components page under `src/app/` keeps rendering every variant

## Out of scope

- Other modules: the sibling tickets 27 to 30
- Any visual or behaviour change: none

## Acceptance criteria

- [ ] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body
- [ ] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base
