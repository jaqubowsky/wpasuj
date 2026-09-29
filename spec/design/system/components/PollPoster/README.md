# PollPoster

The head of every poll page: the poll as a poster, so a friend who taps the link lands in the same product as the landing (ADR 0035).

- `tone` by role: `coral` (`accent` ground, `ink` text) for a friend, `ink` (`ink` ground, `paper` text) for the organiser. A `WaveEdge` of the same tone hangs under it.
- The consumer provides the `eyebrow` (an `Avatar` and "Kuba pyta" or "Pytasz jako Kuba"), shown in a `surface` pill; the `title`, the page's only `h1`, in Bricolage 800 at `text-4xl`, `lg:text-8xl`, balanced and breaking anywhere; and, as children, the row under the title: the respondent count with its avatar stack (`Avatar` with `stack` set to the poster's tone).
- It spans the page and aligns its content with the wide page frame by copying its numbers (`max-w-150`, `px-5`; from `lg:` `max-w-280`, `px-10`), as the top bar does; a change to `PageFrame` changes all three. It carries no decorative tiles and no motion.
- `morph` names the view transition that carries the create form's title into this one.
- A settled poll passes `when` (weekday, day, hours) instead of `title`: the heading becomes the date in Bricolage 800 at `text-5xl`, `lg:text-9xl`, one part per line, the hours in `paper` (large text, 3:1 as ADR 0034's "wszystko"), and a rotated `ink` stamp "Widzimy się" leads the row under it. The page puts the title in the eyebrow and "Ustalone przez…" in the row.
