# 40: Landing story in the approved look

Status: done
Blocked by: 23-landing-seo-perf.md

## Parent

`~/.sandboxes/wpasuj/host-acceptance/notes-landing.md` ("Landing follow-up after ticket 23" and earlier open notes); design-v3 boards (decision 58) for the app screens the story draws.

## Outcome

The landing story's scenes draw the app as it looks now (v3 grid, cards, person rows, invitation), scene 6 at 390 no longer hides the best cells under the best card, and the hero does not reflow when the web font loads.

## Scope

- `src/modules/landing/ui/story/scenes/*`: the v3 look
- Scene 6 phone frame height or card position
- Font fallback metrics (`adjustFontFallback` or `size-adjust`) or a reserved h1 height so load CLS is 0
- Open notes from `notes-landing.md` that are still true on main

## Acceptance criteria

- [x] Screenshots of every story step at 390 and 1440 beside the v3 boards they draw: `e2e/story.spec.ts` saves `landing-story-{1..7}-{phone,desktop}-*.png` (CI `screenshots` artifact); pairing with boards in the task dir `browser/story-v3-20260928T121626/report.md`
- [x] Scene 6 at 390: every best cell visible (e2e bounding-box check): `e2e/story.spec.ts` "on the phone every best cell of step 6 shows inside the phone, clear of the best card", red on the old layout, green now
- [x] perf job: CLS at load 0 in all 5 runs: `npm run perf` locally CLS 0.000 in 5 runs (base 0.042); fallback faces in `src/app/globals.css`
- [x] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green: all exit 0 locally (phone-webkit runs in CI only)

## Comments

- The v3 best card has no "backups", so scene 6's body "Wpasuj pokazuje najlepszy termin i dwa zapasowe." (decision 63 removed "Też dobre") is stale owner copy, left unchanged
- Scene 2's button follows the live form, "Utwórz i wyślij na grupę", where board Create reads "Utwórz ankietę"
- The fallback faces match Arial, Liberation Sans and Arimo; Android (Roboto) still swaps, unmeasured here
