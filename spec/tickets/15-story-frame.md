# 15: Scroll story frame and scene "Na grupie cisza"

Status: ready-for-agent
Blocked by: 26-tailwind-base.md (written in Tailwind from the start, per the `AGENTS.md` Styling pattern)

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

- [ ] Unit tests of progress → step and in-step time, edges included
- [ ] e2e at 1440: scrolling to each step lights its rail label and shows its caption
- [ ] e2e: reduced motion shows all captions without pinning
- [ ] Screenshots at 1440 beside `story-1.png` and at 390 of the sequence; differences listed in the PR body
