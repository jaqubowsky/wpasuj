# Cell

One hour on one date: the only thing a participant touches. A `button` on "Moje", whose selected state the grid announces as `aria-selected` on its gridcell (`docs/adr/0006-grid-selection-aria.md`); a button with its count on "Wszyscy".

- The consumer provides the state (`data-state` = `mine`, `adding`, `removing`, or none for free) or the heat (`data-heat` 1–5 from the share of respondents free), and the count as text. A heat cell carries no other mark: the heat shows the result and the best-time card names the best time (`docs/adr/0029-no-result-marks.md`).
- Free cells carry a 1px `edge` border so they read as controls; filled cells carry none.
- Your own cell (`mine`) is `accent` on a `heat-5` ledge (`shadow-ledge-xs`). A stroke in progress previews its rectangle: adding is `heat-3` with a 2px `heat-5` ring, removing is `surface` with a 2px `ink` ring at half opacity, both at 0.96 scale.
- A heat cell tapped to see who can (`data-selected`) gets a 3px `ink` ring and pops once (`animate-pop`: 1.12 and −3° at the midpoint, `duration-turn`, `ease-spring`).
- A committed stroke ripples: the grid pops each painted cell once, delayed `duration-ripple` per step away from the stroke's first cell. Only under `useMotion`, so reduced motion and "Zatrzymaj ruch" keep it still (ADR 0035).
- A heat cell always shows its count: colour never carries the number alone. `ink` on heat 1–4, white on `heat-5`.
- At least `size-cell` tall and 56px wide on the phone; the hit area is the tile, never the gap around it.
- Fill in `duration-fill` with a 0.96 press scale; a rising count bumps to 1.08 for `duration-bump`. Counts in 16px Onest 800.
- Don't round cells into pills, drop the count, or put icons inside.
