# 20: Story scene "Najlepszy termin i Ustalone"

Status: ready-for-agent
Blocked by: 19-story-heat.md

## Parent

As ticket 14; the story frame of ticket 15. Reference render: `story-6.png` and `story-7.png`.

## Outcome

At step 6 the best-time card rises ("Sobota 18.10, 19–22", "5 z 6 może", "Nie może: Ola", "Ustal ten termin"); at step 7 it reads "Ustalone", the button becomes "Dodaj do kalendarza" and the chosen cells get their outline. Captions "Krok 5 · Najlepszy termin wyskakuje sam." and "Gotowe · Ustalone. Prosto do kalendarza."

## Scope

- One scene in `src/modules/landing/ui/story/scenes/`, driven only by the step and in-step time from the frame, with invented data; its pure state in `domain/`
- Only `transform` and `opacity` animate; reduced motion and the phone sequence show the scene's end state

## Out of scope

- Other scenes

## Acceptance criteria

- [ ] Unit test of the scene's pure state at in-step time 0, 0.5 and 1
- [ ] e2e: at its step the scene is visible and the others are not
- [ ] Screenshots at 1440 beside `story-6.png` and `story-7.png` and at 390 in the sequence; differences listed in the PR body
