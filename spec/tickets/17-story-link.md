# 17: Story scene "Wrzucasz link"

Status: done
Blocked by: 15-story-frame.md

## Parent

As ticket 14; the story frame of ticket 15. Reference render: `story-3.png`.

## Outcome

At step 3 the chat returns and the link preview drops in ("Kuba pyta, kiedy możesz", the title, a miniature grid, "wpasuj.app · pt 17 – nd 19 października"), then the bubble "Zaznaczcie tu, zajmie wam to 20 sekund". Caption "Krok 2 · Jeden link zamiast pytania."

## Scope

- One scene in `src/modules/landing/ui/story/scenes/`, driven only by the step and in-step time from the frame, with invented data; its pure state in `domain/`
- Only `transform` and `opacity` animate; reduced motion and the phone sequence show the scene's end state

## Out of scope

- Other scenes

## Acceptance criteria

- [x] Unit test of the scene's pure state at in-step time 0, 0.5 and 1 (`src/modules/landing/domain/link-scene.test.ts`: 0, 0.2, 0.5, 1)
- [x] e2e: at its step the scene is visible and the others are not (`e2e/story.spec.ts`, "at its step the link scene drops the preview and the reply into the chat, alone in the phone"; "the first scene is the group chat going silent" now counts only the visible chat)
- [x] Screenshots at 1440 beside `story-3.png` and at 390 in the sequence; differences listed in the PR body (`e2e/screenshots/landing-story-3-desktop-chromium.png`, `landing-story-phone-chromium.png`)
