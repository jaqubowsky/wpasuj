# 17: Story scene "Wrzucasz link"

Status: ready-for-agent
Blocked by: 16-story-create.md

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

- [ ] Unit test of the scene's pure state at in-step time 0, 0.5 and 1
- [ ] e2e: at its step the scene is visible and the others are not
- [ ] Screenshots at 1440 beside `story-3.png` and at 390 in the sequence; differences listed in the PR body
