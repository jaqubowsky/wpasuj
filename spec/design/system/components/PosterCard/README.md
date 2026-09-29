# PosterCard

A poll as a poster: its title large, a strip of heat tiles, the people and the time. It shows what kinds of plans Wpasuj settles, on the landing and wherever WPA-86 needs an example poll.

- The card grows to its content from a 4:5 minimum, so a long title never clips the time.
- The consumer provides `title`, `when`, `people`, `heat` (ten levels, 0 to 5) and a `tone`: `coral`, `ink`, `peach` (`heat-2`), `deep` (`heat-5`), `paper` (`surface`) or `pink` (`heat-1`). Text is `ink` on light tones, `paper` on `ink` and white on `deep`, all at least 4.5:1.
- Sizes: default 108px wide on the phone and 188px from `lg`; `small` 140px; `large` 220px. The ratio is at least 4:5 and the radius `radius-card`, with `shadow-poster`.
- A tap turns it to its back in `duration-turn`: the time in `ink` with "Ustalone" on `accent`, and a tile burst. A second tap turns it back. It is a toggle button named "{title}, {when}", so the time reaches a screen reader whichever side shows.
- Positions, tilt and drift belong to the consumer, on a wrapper; the card owns only its look.
