# 15: Scroll story frame and scene "Na grupie cisza"

Status: done
Blocked by: 30-tailwind-landing.md

## Parent

As ticket 14. Reference renders: `story-1.png` (and `story-0.png` for the frame).

## Outcome

Below the hero a pinned stage about seven screens tall carries the timeline rail ("Na grupie cisza" … "Ustalone"), the caption of the current step and a phone frame. The first scene is the group chat: "Ej, planszówki w weekend? Kiedy możecie?", "Wyświetlone przez 5 osób", the typing dots, silence; caption "Znasz to · Pytanie do wszystkich to pytanie do nikogo." Below 900px the story is a vertical sequence of caption plus a still phone per step, no pinning. With reduced motion every step shows at once, still.

## Scope

- `src/modules/landing/ui/story/`: stage, rail, captions, phone frame, one scene slot per step
- `domain/`: a pure function from scroll progress to step and in-step time; `ui/` hook reading scroll through `requestAnimationFrame`
- Scene 1 only; scenes 2-7 stay empty slots for 16-20

## Out of scope

- Scenes 2-7

## Acceptance criteria

- [x] Unit tests of progress → step and in-step time, edges included (`src/modules/landing/domain/story-moment.test.ts`: 0, 1, an exact step boundary, mid-step, below 0, above 1)
- [x] e2e at 1440: scrolling to each step lights its rail label and shows its caption (`e2e/story.spec.ts`, "scrolling to each step lights its rail label and shows its caption")
- [x] e2e: reduced motion shows all captions without pinning (`e2e/story.spec.ts`, "with reduced motion › every caption shows and nothing pins")
- [x] Screenshots at 1440 beside `story-1.png` and at 390 of the sequence; differences listed in the PR body (`e2e/screenshots/landing-story-1-desktop-chromium.png`, `landing-story-phone-chromium.png`)

## Comments

- The story pins from 1280px, not 900: the canvas columns (200 + 380 + 2×56 gap + 2×48 padding) leave the caption column 492px only from 1280; at 1024 it is 236px and "wszystkich" at 60px (319px) runs into the phone. Below 1280, and with reduced motion, it is the still sequence (`e2e/story.spec.ts`, "below 1280px the story is a still sequence")
- Four type tokens outside the brief's table, approved by the owner in the session: `--text-story` 60/62, `--text-story-lead` 20/30, `--text-bubble` 15/21, `--text-mini` 12/16
- The still scene (phone, reduced motion) shows the scene's end state, so "Na grupie cisza" shows silence without the typing dots
- Anchor contract: a lazy section's id sits on its server-rendered `NearViewport` wrapper (`jak-to-dziala`), so the link works before the chunk loads

