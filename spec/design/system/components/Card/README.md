# Card

A ground that groups one thing on the page. Cards separate by colour, never by border; only the `ink` card casts a shadow, its ledge (ADR 0035).

- The consumer provides the content; the card only sets ground, radius and padding.
- Default: `surface`, `radius-card`, `space-5` padding.
- `data-tone="ink"`: the one emphasised block on a screen (the best time), standing on a `heat-5` ledge (`shadow-ledge`); labels inside use `on-dark-muted`. The best time sits beside "N z M" in display 800 `heat-3`.
- `data-pulse`: the card scales up 3% and flashes `heat-5` once (`animate-pulse`), when the best time changes; its consumer remounts the card to pulse again and throws a `TileBurst` from it. Nothing under reduced motion.
- `data-size="compact"`: `radius-control`, 12/16 padding, for list rows such as alternative times.
- Never nest cards.
