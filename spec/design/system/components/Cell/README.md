# Cell

One hour on one date: the only thing a participant touches. A `button` on "Moje", whose selected state the grid announces as `aria-selected` on its gridcell (decision `cell-one-component`); a button with its count on "Wszyscy".

- The consumer provides the state (`data-state` = `mine`, `adding`, `removing`, or none for free) or the heat (`data-heat` 1–5 from the share of respondents free), the count as text, and `data-everyone` / `data-best` where they apply.
- Free cells carry a 1px `edge` border so they read as controls; filled cells carry none.
- A heat cell always shows its count: colour never carries the number alone. `ink` on heat 1–4, white on `heat-5`.
- At least `size-cell` tall and 56px wide on the phone; the hit area is the tile, never the gap around it.
- Fill in `duration-fill` with a 0.96 press scale; a rising count bumps to 1.08 for `duration-bump`.
- Don't round cells into pills, drop the count, or put icons inside.
