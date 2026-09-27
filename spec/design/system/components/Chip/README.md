# Chip

A one-tap toggle for a preset (a set of dates, an hour range), with `aria-pressed`.

- The consumer provides the label and the pressed state; a group decides whether chips are exclusive (ranges) or additive (dates).
- Off: `surface` with an `edge` border; on: `ink` with white text, no border.
- Height `size-target`, `radius-pill`, `chip` type, `space-2` apart, wrapping rather than scrolling.
