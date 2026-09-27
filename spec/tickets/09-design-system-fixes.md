# 09: Design-system fixes from the acceptance of ticket 01

Status: ready-for-agent
Blocked by: 04-answer-poll.md, 05-view-results.md

## Parent

`spec/brief.md` ("Visual design", "Ergonomics"), host acceptance `~/.sandboxes/wpasuj/claude-wpasuj-t01-foundation/acceptance.md`.

## Outcome

Every shared component matches the brief's type table, target sizes and motion rules, an avatar keeps its colour through a case-only rename, and a components page shows every state of every component, screenshotted on each run.

## Scope

- `src/shared/ui/avatar`: tint from a key the caller passes; callers pass `normalisedName`; decision 11 in `spec/decisions.md` corrected
- `src/shared/ui/button`: the small size 44px tall, radius 14, 16/20 600, or removed if nothing uses it
- Type roles: the create form's questions and "Jak masz na imię?" as Section heading (Bricolage 18/24 700); stepper "od"/"do" as Label (13/18 500); the title input as Title (30/34 phone, 40/44 desktop)
- `src/shared/ui/text`: day numbers tracked −0.02em
- `src/app/globals.css`: reduced motion also removes the `:active` press scale
- `src/shared/ui/input`: a visible focus ring in every state, invalid included
- A components page under `src/app/dev/` behind `DEMO_ROUTES`, screenshotted by Playwright at 390 and 1440

## Out of scope

- Segment radii and `#fff` literals (accepted in the acceptance file)

## Acceptance criteria

- [ ] Avatar test: "Ola" and "ola" with the same key get the same tint
- [ ] Computed-style e2e: the small button (if kept) and every chip, tab and button are ≥44px tall
- [ ] Computed-style e2e: question labels 18px Bricolage 700, stepper labels 13px 500, title input 30px phone / 40px desktop
- [ ] Reduced-motion e2e (`reducedMotion: 'reduce'`): a pressed button has no transform
- [ ] Screenshot of an invalid, focused input shows a ring
- [ ] `components-*` screenshots at 390 and 1440 in the CI artifact
