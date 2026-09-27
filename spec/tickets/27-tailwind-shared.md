# 27: Tailwind in shared

Status: done
Blocked by: 26-tailwind-base.md, 33-architecture-gates.md

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

- [x] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body — all 64 e2e screenshots (shared components reach every screen) differ by 0.000% from `fb76f27`; the PR body
- [x] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base — `src/shared` holds only `ui/avatar/avatar.css` (the pop keyframes); all five and `knip` exit 0, Vitest 46 files, 313 tests and e2e 98 passed, 8 skipped on `fb76f27` and after (phone-webkit in CI)

## Comments

- One new type token, `--text-stepper` (20px, line height 1), for the stepper's − and + glyphs: the brief's type table has no 20px role and lint rejects `text-[20px]`. Host decision to confirm.
- The day header swaps the short weekday for the long one at 600px and up with `@min-[600px]:[font-size:0]` on the short text plus an `::after` at `text-label`, as the old CSS did; it hides text, it is no type size.
- Where two states set the same property at equal specificity, Tailwind's variant order differs from the old source order, so the losing rule carries `not-*`: a focused or everyone heat cell keeps its ink ring, a focused invalid input shows the focus ring.
- Zero is `-[0]` (`p-[0]`, `left-[0]`), as on the landing branch: the spacing reset leaves no `0` step.
