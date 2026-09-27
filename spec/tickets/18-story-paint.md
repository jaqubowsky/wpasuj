# 18: Story scene "Każdy klika godziny"

Status: done
Blocked by: 15-story-frame.md

## Parent

As ticket 14; the story frame of ticket 15. Reference render: `story-4.png`.

## Outcome

At step 4 the phone turns into the poll on "Moje": a finger paints seven cells along a path, one by one. Caption "Krok 3 · Każdy klika swoje godziny."

## Scope

- One scene in `src/modules/landing/ui/story/scenes/`, driven only by the step and in-step time from the frame, with invented data; its pure state in `domain/`
- Only `transform` and `opacity` animate; reduced motion and the phone sequence show the scene's end state

## Out of scope

- Other scenes

## Acceptance criteria

- [x] Unit test of the scene's pure state at in-step time 0, 0.5 and 1: `src/modules/landing/domain/paint-poll.test.ts`
- [x] e2e: at its step the scene is visible and the others are not: `e2e/story.spec.ts` "the fourth scene paints hours on the poll and shows only at its step"
- [x] Screenshots at 1440 beside `story-4.png` and at 390 in the sequence; differences listed in the PR body: `landing-story-4-desktop-chromium.png`, `landing-story-4-phone-chromium.png`
