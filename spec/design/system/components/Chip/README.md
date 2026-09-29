# Chip

A one-tap toggle for a preset (a set of dates, an hour range), with `aria-pressed`.

- The consumer provides the label and the pressed state; a group decides whether chips are exclusive (ranges) or additive (dates).
- Off: `surface` with an `edge` border on an `edge` ledge; on: `ink` with white text, no border, on a `heat-5` ledge. The small ledge (`shadow-ledge-sm`); pressed, the chip drops 4px onto `shadow-ledge-sm-down`, only under `motion-safe`.
- Height `size-target`, `radius-pill`, `chip` type, `space-2` apart, wrapping rather than scrolling.
