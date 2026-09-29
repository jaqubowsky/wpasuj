# Patterns

Screens are built from the components; these are the compositions that repeat, with the rules that hold them together. They are not components: build them in the app from the parts named here.

## Day-hour grid

- Parts: Cell, Text (`meta` for weekdays and hours, `day-number` for dates).
- Dates are columns, one-hour slots rows, `space-cell-gap` between cells, a 48px hour column.
- The date header toggles the whole date, the hour label toggles that hour on every date; both are buttons.
- Up to four dates fill a 390px phone; more scroll sideways with snap per date and a sticky hour column.
- Touch: cells `touch-action: none` (a drag paints), the hour column `pan-y`, the header `pan-x`. Keyboard: an ARIA grid with `aria-multiselectable`.

## Best time

- Parts: Card (`ink`), Text (`meta` label, `best-time`), Button (`on-dark`, organiser only), then up to two Card (`compact`) rows under a "Też dobre" `meta` label.
- The count ("5 z 6 może") is `heat-3` on the ink card; who can't make it sits on the right in white.
- When the best time changes its text cross-fades; the card keeps its place.
- With no respondents: "Nikt jeszcze nie odpowiedział. Wyślij link na grupę." and no button.

## Poll header

- Parts: Avatar, Text (`meta` "Kuba pyta", `title`), Input (name), Status, Segment.
- Order on the phone: who asked, title, name with its Status on the right, the Segment, then the grid.

## Create form

- Parts: TitleInput, Chip groups for dates and ranges, Stepper pair for a custom range, Input (name), primary Button in a sticky bottom bar.
- Four questions, one screen: "Co robimy?", "Kiedy?", "O której?", "Twoje imię".

## Bottom sheet

- Opens on a tap on a result cell; lists who can and who can't with Avatars.
- `surface`, `radius-card` top corners, `shadow-sheet`, slides up in `duration-sheet`; on desktop the same content sits in a side panel instead.
