# 16: Story scene "Tworzysz ankietę"

Status: ready-for-agent
Blocked by: 15-story-frame.md

## Parent

As ticket 14; the story frame of ticket 15. Reference render: `story-2.png`.

## Outcome

At step 2 the phone shows the create form: the title "Planszówki u Michała" types itself, "Ten weekend" and "Wieczór 17–23" light up, and "Utwórz i wyślij na grupę" presses. Caption "Krok 1 · Ankieta w trzy tapnięcia."

## Scope

- One scene in `src/modules/landing/ui/story/scenes/`, driven only by the step and in-step time from the frame, with invented data; its pure state in `domain/`
- Only `transform` and `opacity` animate; reduced motion and the phone sequence show the scene's end state

## Out of scope

- Other scenes

## Acceptance criteria

- [ ] Unit test of the scene's pure state at in-step time 0, 0.5 and 1
- [ ] e2e: at its step the scene is visible and the others are not
- [ ] Screenshots at 1440 beside `story-2.png` and at 390 in the sequence; differences listed in the PR body
