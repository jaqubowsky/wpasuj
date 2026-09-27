# 19: Story scene "Godziny się nagrzewają"

Status: done
Blocked by: 15-story-frame.md

## Parent

As ticket 14; the story frame of ticket 15. Reference render: `story-5.png`.

## Outcome

At step 5 the segment switches to "Wszyscy", six avatars pop in one by one and the cells warm through the five heat buckets with their counts. Caption "Krok 4 · Wspólne godziny robią się coraz cieplejsze." The bucket rule is the landing demo's `heatCellOf` in `domain/best-time.ts`, reused (host order, 2026-09-27).

## Scope

- One scene in `src/modules/landing/ui/story/scenes/`, driven only by the step and in-step time from the frame, with invented data; its pure state in `domain/`
- Only `transform` and `opacity` animate; reduced motion and the phone sequence show the scene's end state

## Out of scope

- Other scenes

## Acceptance criteria

- [x] Unit test of the scene's pure state at in-step time 0, 0.5 and 1 (`src/modules/landing/domain/heat-scene.test.ts`)
- [x] e2e: at its step the scene is visible and the others are not (`e2e/story.spec.ts`, "at its step the heat scene switches to everyone and warms the grid as friends join, alone in the phone")
- [x] Screenshots at 1440 beside `story-5.png` and at 390 in the sequence; differences listed in the PR body (`e2e/screenshots/landing-story-5-desktop-chromium.png`, `landing-story-5-phone-chromium.png`)
