# TileBurst

A handful of 14px heat tiles (`heat-2` to `heat-5` and `ink`) thrown out of an element and fading as they fall, in `duration-burst` with `ease-out`. It answers a moment of settling: a poster turning to its time today, and a poll settled once WPA-86 uses it.

- `useTileBurst()` returns `burst(element, count = 14)`; the tiles are hidden from assistive technology and removed once they land.
- It throws nothing under reduced motion or once the motion is stopped. It is never confetti: tiles only, a few, once per action.
