# HourRangePicker

"O której?" on the create form: a whole-hour range of 1 to 24 hours, 17:00 to 23:00 by default.

- Desktop (`lg:`): 24 tiles in rows of eight, ordered 6 to 5, 44px high, weight 800 on `surface` with an `edge` ring. A first click marks its tile as the start (`ink` on a `heat-5` ledge, one pop) and the summary turns `ink`: "Od N:00" and "kliknij ostatnią godzinę →" in `heat-3`, the arrow nudging while motion is on. Meanwhile every other tile has a `heat-4` ring, a hover fills it `heat-1`, and the tiles from the start up to the hovered one fill `heat-2` as a preview. The second click makes the clicked tile the last hour (`spec/brief.md`, "O której?"); the ends are `ink` on a `heat-5` ledge, the hours between `heat-2`.
- Phone: the "Od" and "Do" fields open a bottom sheet with two hour columns, because tiles at 390 would be under 44px (ADR 0009).
- Under both, the summary on `heat-1` in display 800 reads "22:00 → 4:00 · 6 godzin".
- The day tiles above the hours share the look: weight 800 on `surface` with an `edge` ring; a picked day is `accent` on a `heat-5` ledge (`shadow-ledge-sm`).
