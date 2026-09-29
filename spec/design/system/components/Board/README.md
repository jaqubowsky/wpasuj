# Board

The white card the day-hour grid sits on, with its hint above and, on "Moje", "Nie mogę w żadnym terminie" under it (ADR 0035).

- The consumer provides the content: a `muted` hint, the grid, and what acts on the whole grid.
- `surface`, `radius-card`, `shadow-poster`; 16px padding and a 12px gap on the phone, 24px and 16px from `lg:`.
- One board per view; never nest a Card in it.
