# BrandMark

The brand: a 3×3 mark of 8px heat tiles beside the wordmark, heading the landing and every app page.

- Tiles: `heat-2`, `heat-4`, `heat-1`, `heat-3`, `surface` with an `edge` ring, `heat-5`, `heat-1`, `heat-3`, `heat-2`; 2px gaps, 2.5px radius. The wordmark is `Text` `wordmark` in `ink`.
- Hover shrinks every other tile to 75%, except under reduced motion. Under reduced motion or once the motion is stopped the scroll jumps and nothing bursts; the shuffle still shows.
- Hover shrinks every other tile to 75%. Under reduced motion or once the motion is stopped the scroll jumps, the hover stays still and nothing bursts; the shuffle still shows.
- A click shuffles the tiles and bursts. On the landing it is a button, "Wpasuj, na górę strony", that scrolls to the top; with `href` it is a link, "Wpasuj, strona główna", and every other page's header passes `href="/"` (ADR 0038).
- It owns its look; the header places it.
