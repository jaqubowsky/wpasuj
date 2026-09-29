# Menu

The organiser's "•••" menu and the calendar menu: `MenuItem` and `MenuLink` rows (`view-results`) inside a `Sheet` with `menuBelow`.

- A row is 58px high, `radius-control`, weight 700: a 34px `track` icon tile (`radius-cell`, 18px stroke icon), then the label. Hover fills `heat-1` and nudges the row 4px right, only under `motion-safe`. A danger row is `accent-ink` with a `heat-2` tile.
- Rows split by a `line` rule inset 8px.
- From `lg:` the menu opens under its button as a dropdown: `surface`, `radius-card`, `shadow-poster`, springing from the button's corner (`scale 0.9`, `ease-spring`, `duration-pop`). Below `lg:` it is the bottom sheet with "Zamknij".
- "Usuń ankietę" swaps the rows for the confirm in the same menu: the question in display 800 `text-2xl`, the warning in `muted`, then "Tak, usuń" (`danger`) and "Nie, zostaw", 16px apart so each ledge clears the next button.
