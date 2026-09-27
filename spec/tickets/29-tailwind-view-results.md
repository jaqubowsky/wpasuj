# 29: Tailwind in view-results

Status: ready-for-agent
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

- [ ] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body
- [ ] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base
