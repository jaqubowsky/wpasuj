# MotionToggle

"Zatrzymaj ruch" stops every animation that runs by itself on the page; "Włącz ruch" starts it again. It is how a page with idle motion meets WCAG 2.2.2.

- A pill on `paper` with a 2px `ink` border, at least `size-target` tall: in the flow where the page places it on the phone (the landing puts it under the hero's call), fixed bottom right from `lg`.
- Stopping sets `data-motion="still"` on `<html>` while the toggle is on the page, which pauses CSS animations on elements marked `data-idle-motion`, and turns off motion driven from script (`useMotion().moving`); the choice is remembered on the device. Motion that plays once (a sheet, a pop) never opts in, so it still plays.
- Under `prefers-reduced-motion` nothing moves in the first place, so the toggle is not shown.
