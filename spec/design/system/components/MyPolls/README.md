# MyPolls

The landing's "Moje ankiety" (`landing`, WPA-63): a header button and the list it opens.

- The button is a ghost: no border, no fill, `ink` Onest 600 at 16px, 44px tall. It reads "Moje" on the phone and "Moje ankiety" from `lg`, followed by the count in an `ink` pill 24px tall with white tabular figures. Its accessible name is "Moje ankiety, N".
- The list opens in `Sheet`: a bottom sheet on the phone, and from `lg` a 420px panel from the right edge, full height, the page dimmed. "Twoje ankiety" is Bricolage 700 at 24px, with the text button "Zamknij" beside it and one muted line under it.
- Each poll is a row card linking to it: `surface` with a 1px `edge` ring, since the whole card is a control, and `radius-control`, 8px apart. The title is Bricolage 700 at 18px; a muted 14px line carries the role and the dates; the third line is "Ustalone: …" in `ink` 600, or the answer count in muted.
