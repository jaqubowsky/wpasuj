# 20: Story scene "Najlepszy termin i Ustalone"

Status: done
Blocked by: 15-story-frame.md

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

- [x] Unit test of the scene's pure state at in-step time 0, 0.5 and 1: `src/modules/landing/domain/best-scene.test.ts` (`bestTimeAt` and `settledAt`)
- [x] e2e: at its step the scene is visible and the others are not: `e2e/story.spec.ts` "at step 6 the best-time card rises over the heat, alone in the phone" and "at step 7 the time is settled, off to the calendar, alone in the phone"
- [x] Screenshots at 1440 beside `story-6.png` and `story-7.png` and at 390 in the sequence; differences listed in the PR body: `landing-story-6-desktop-chromium.png`, `landing-story-7-desktop-chromium.png`, `landing-story-6-phone-chromium.png`, `landing-story-7-phone-chromium.png`

## Comments

- Both scenes share one poll view (`scenes/best-time.tsx`, `BestTimePoll`); `scenes/settled.tsx` drives it with the settled state
- The poll data (six friends, days 17 to 19, hours 17 to 22) copies ticket 19's heat scene so the grid reads the same across steps 5 to 7; the best time comes from the demo's rule in `domain/best-time.ts`
- The card title uses `text-day` (22/26); the canvas has 26/30, which has no token (ticket 34 rescales)
- At 390 the frame's phone is `82dvh` tall, so the card covers the grid's last three rows and two of the three outlined cells
