# PeopleList

Who answered, and who can at a tapped hour (`view-results`): rows of an `Avatar` and a name, 44px high, under a small heading with the count.

- Rows are `radius-cell` with 6px side padding; the list bleeds 6px so avatars line up with the heading.
- A tapped hour splits the list into "Może" and "Nie może". "Może" rows fill `heat-1` and sit 4px right, arriving with one nudge (10px, then back to 4px) under `motion-safe`. "Nie może" rows keep `muted` names and untinted avatars with the cross badge; they are not faded further, so the names keep their contrast.
- The same list serves the phone sheet and the desktop side panel.
