# Button

An action, labelled with what it does: "Utwórz i wyślij na grupę", "Ustal ten termin", never "OK" or "Wyślij".

- The consumer provides the label, the variant and, where it fills its row, `data-block`.
- Every variant but `text` stands on a ledge (`shadow-ledge`, coloured with a shadow colour utility): under the pointer it lifts 2px onto a taller ledge (`shadow-ledge-up`), pressed it drops 6px onto a thin one (`shadow-ledge-down`), so the ledge's bottom edge stays put. The box and its hit area keep their size; the ledge is a shadow (ADR 0035).
- `primary`: `ink` with white text on a `heat-5` ledge; one per screen, the main action; on the phone full width in the sticky bottom bar.
- default (secondary): `surface` with a 2px `ink` ring on an `ink` ledge.
- `on-dark`: `surface` on an `ink` card, on an `accent` ledge.
- `loud`: `ink` with white text, 56px tall at `text-lg`, on a `heat-5` ledge. The landing's calls to create a poll (ADR 0034).
- `loud-light`: the same on `paper` with an `accent` ledge, for an `ink` section, where an `ink` ledge would vanish.
- `danger`: `accent-ink` with white text on an `ink` ledge.
- `aria-pressed`: a toggle ("Nie mogę w żadnym terminie" under the grid). Unpressed it is the default look; pressed it turns `ink` with white text on a `heat-5` ledge, like a pressed Chip.
- `text`: a quiet underlined action in `muted`; still `size-target` of hit area.
- `data-size="small"`: 44px on the smaller ledge (`shadow-ledge-sm`, `-sm-up`, `-sm-down`: 5, 7 and 1px), desktop toolbars only; on the phone buttons are `size-button` tall.
- Disabled buttons are avoided: explain what is missing instead. Where unavoidable, 40% opacity.
- Lift and press in `duration-fill`, only under `motion-safe`; `text` keeps a 0.97 press scale. A 2px `ink` focus ring with a 2px offset.
