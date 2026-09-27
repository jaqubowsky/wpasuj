# 28: Tailwind in create-poll and answer-poll

Status: done
Blocked by: 26-tailwind-base.md, 33-architecture-gates.md

## Parent

`spec/brief.md`, "Stack (decided)" (Styling) and "Code rules"; host decision in `spec/decisions.md` (Tailwind migration)

## Outcome

Creating and answering a poll look and behave exactly as before, styled with the theme utilities.

## Scope

- `src/modules/create-poll/**/*.module.css` and `src/modules/answer-poll/**/*.module.css` (2 files, 244 lines) to utilities, the pattern from 26

## Out of scope

- Other modules: the sibling tickets 27 to 30
- Any visual or behaviour change: none

## Acceptance criteria

- [x] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body (all create-* and answer-* 0 px against 5a12859; create-filled at 390 compared on isolated runs)
- [x] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base (332 tests; e2e 116 passed, 14 skipped, as on 5a12859)
