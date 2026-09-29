# Segment

Two mutually exclusive views of the same content, as tabs ("Moje" / "Wszyscy").

- The consumer provides the labels and the selected one; each option is a `tab` with `aria-selected`.
- Track `track`; an `ink` pill slides under the selected option (`duration-turn`, `ease-spring`, no slide under reduced motion), its label `paper`, the other `muted`; labels weight 600, full width on the phone.
- It switches views, never submits or filters data.
