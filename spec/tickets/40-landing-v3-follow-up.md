# 40: Landing story in the approved look

Status: ready-for-agent
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

- [ ] Screenshots of every story step at 390 and 1440 beside the v3 boards they draw
- [ ] Scene 6 at 390: every best cell visible (e2e bounding-box check)
- [ ] perf job: CLS at load 0 in all 5 runs
- [ ] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green
