# Button

An action, labelled with what it does: "Utwórz i wyślij na grupę", "Ustal ten termin", never "OK" or "Wyślij".

- The consumer provides the label, the variant and, where it fills its row, `data-block`.
- `primary`: `ink` with white text; one per screen, the main action; on the phone full width in the sticky bottom bar.
- default (secondary): `surface` with an `edge` border.
- `on-dark`: `surface` on an `ink` card.
- `text`: a quiet underlined action in `muted`; still `size-target` of hit area.
- `data-size="small"`: 40px, desktop toolbars only; on the phone buttons are `size-button` tall.
- Disabled buttons are avoided: explain what is missing instead. Where unavoidable, 40% opacity.
- Press scale 0.97 in `duration-fill`; a 2px `ink` focus ring with a 2px offset.
