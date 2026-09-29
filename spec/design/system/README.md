Wpasuj finds a time for a group of friends: one link in the group chat, everyone taps the hours they are free, the best time comes out on top. Everything here serves one reader: a friend who opened the link from Messenger on a phone and will leave in twenty seconds.

## Content

- Polish, informal second person, the way a friend writes in a chat: "Kliknij godziny, kiedy możesz." Short sentences, no exclamation marks.
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows.
- Buttons name the action: "Utwórz i wyślij na grupę", "Ustal ten termin", "Przypomnij". Never "OK", "Wyślij", "Zatwierdź".
- Errors say what happened and what to do: "Nie zapisano" with "Spróbuj ponownie"; "Tej ankiety już nie ma" with a link to create one.
- No corporate words ("użytkownik", "zarządzaj", "konfiguruj"), no emoji, no filler ("Seamlessly", "Let's get started").
- Dates read as friends say them: "sobota 18.10, 19–22". A run of slots 19, 20 and 21 is written "19–22".

## Colour

- Page on `paper`; cards, inputs and free cells on `surface`. Text in `ink`; secondary text in `muted`.
- Colour means "free" and nothing else. `accent` fills your own hours and selected dates; it is never text (use `accent-ink` for that).
- The heat ramp `heat-1` to `heat-5` shows the share of respondents free, in 20% steps, always with the count in the cell: `ink` on heat 1–4, white on `heat-5`.
- `line` is decorative only (dividers). Anything you can tap and that is not filled carries a 1px `edge` border.
- The best-time card is the one dark block: `ink` ground, `on-dark-muted` labels, the count in `heat-3`.
- Avatars sit on the five `tint-*` grounds, picked from the name.
- Out: gradients, glassmorphism, purple or indigo, a second accent.

## Type

- Display in Bricolage Grotesque (`title`, `best-time`, `day-number`, `heading`, `wordmark`), tight tracking. Everything else in Onest (`body`, `chip`, `button`, `meta`), tabular figures wherever a number can change.
- Inputs are at least 16px (`body`), so iOS does not zoom on focus.
- Out: Inter, Poppins, Montserrat, DM Sans, Plus Jakarta Sans, Satoshi, General Sans.

## Space, shape and touch

- 4px base: `space-1` to `space-10`; `space-cell-gap` (6px) between grid cells.
- Radii by role: `radius-cell` on cells, `radius-control` on buttons and inputs, `radius-card` on cards, `radius-pill` on chips and avatars.
- Every tappable thing is at least `size-target`; grid cells `size-cell`; phone buttons `size-button`, the main action full width in a sticky bottom bar above the home indicator.
- No shadows except `shadow-lift` on the selected segment and `shadow-sheet` on the bottom sheet. Cards separate by ground colour, not borders.
- The landing adds `shadow-poster` on posters, link cards and its try-it board, and a `shadow-ledge` under its loud buttons (ADR 0034); the poll pages keep the two above.

## Motion

- Taps answer within 100 ms: a fill in `duration-fill` with a 0.96 press scale.
- A heat count that rises bumps for `duration-bump`; a newly arrived respondent's avatar pops in with `ease-pop`, the only overshoot.
- The bottom sheet slides up in `duration-sheet` with `ease-out`; the best-time text cross-fades when it changes; setting the final time fills the chosen cells in sequence.
- Nothing animates on load. Only `transform` and `opacity` move. `prefers-reduced-motion` removes all of it.
- The landing is the exception (ADR 0034): posters drift and follow the pointer, a word swaps, a count runs and a wall of posters scrolls, all under `MotionToggle` ("Zatrzymaj ruch") and gone under reduced motion. New idle motion reads `useMotion().moving`, or marks its element `data-idle-motion` so `data-motion="still"` pauses it; motion that plays once never opts in.

## Icons

- Lucide at 18px with a 1.5 stroke, always beside a word; no icon-only buttons. The save states use their own 16px check, ring and alert glyphs in the text colour.
- No logo file exists yet: set the name "Wpasuj" in `wordmark`.
