# 30: Tailwind in landing

Status: done
Blocked by: 26-tailwind-base.md, 33-architecture-gates.md

## Parent

`spec/brief.md`, "Stack (decided)" (Styling) and "Code rules"; host decision in `spec/decisions.md` (Tailwind migration)

## Outcome

The landing on `/` looks and behaves exactly as before, reduced motion included, styled with the theme utilities.

## Scope

- `src/modules/landing/**/*.module.css` (1 file, 220 lines) to utilities, the pattern from 26; scroll-driven animation keyframes may stay in the theme CSS

- Host notes carried here (`~/.sandboxes/wpasuj/host-acceptance/notes-landing.md`): move the FAQ between the reasons and the final call as the canvas orders it; the `rise` reveal keyframes into the theme so the FAQ and sections reveal; token cleanup (`--spacing-0`, duplicate type tokens) is ticket 34, not here

## Out of scope

- Other modules: the sibling tickets 27 to 30
- Any visual or behaviour change: none

## Acceptance criteria

- [x] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body: reasons, final call and footer 0.000% at both widths; every non-landing screen 0.000%; each larger number is the FAQ move, the tint, the tile mark or the kicker, listed per screen in the pull request body
- [x] No `*.module.css` left in Scope (`find src/modules/landing -name '*.module.css'` prints nothing); `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base: 54 files, 348 tests as on `d24f5a1`; e2e 130 passed, 22 skipped against 123 and 21, the difference being the 4 new tests
