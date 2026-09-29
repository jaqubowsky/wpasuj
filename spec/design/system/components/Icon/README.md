# Icon

Every icon the app draws: `Icon` (`src/shared/ui/icon`), one named drawing each, in the text colour (`currentColor`). A new icon joins the drawings there; lint refuses an inline `<svg>` anywhere else, except the illustrations (`WaveEdge`, the landing's hand-drawn arrow).

- `name` picks the drawing; `size` is 8, 12, 14, 16, 18, 20, 24 or 32px (default 18, the Lucide size); `stroke` is 1.5 (default), 2.25, 2.5 or 2.75, on the drawing's own grid.
- Always `aria-hidden`: an icon sits beside a word, and a button without one ("Więcej") carries its own `aria-label`.
- Sets its size through `width` and `height`, so the link-preview card (Satori, which ignores classes) draws the same component.

| Name | Grid | Used at | Where |
| --- | --- | --- | --- |
| `check` | 24 | 18 / 1.5, 14 / 2.5, 20 / 2.5, 24 / 2.75 | "Nie mogę w żadnym terminie" pressed, SettledBadge, "Ankieta gotowa", the set-time card's "Ustalone" |
| `check-status` | 16 | 16 / 1.5 | Status "Zapisane" |
| `check-badge` | 12 | 12, stroke 1.8 in the drawing | "Skopiowano" and "Wysłane" in the invite card |
| `pending` | 16 | 16 / 1.5, dashed, butt caps | Status "Zapisuję" |
| `alert` | 16 | 16 / 1.5 | Status "Nie zapisano" |
| `crown` | 24 | 8, filled | Avatar organiser badge |
| `cross` | 24 | 8, stroke 4 in the drawing | Avatar "nie może" badge |
| `more` | 24 | 18 / 1.5 | Organiser card "Więcej" |
| `chevron-right` | 24 | 18 / 1.5, turns 90° when open | "Zobacz wszystkie głosy" |
| `copy` | 24 | 18 / 1.5 | Menu "Kopiuj link", invite card "Kopiuj" |
| `phone` | 24 | 18 / 1.5 | Menu "Link organizatora na inny telefon" |
| `trash` | 24 | 18 / 1.5 | Menu "Usuń ankietę" |
| `calendar` | 24 | 18 / 1.5 | Calendar menu |
| `mail` | 24 | 18 / 1.5 | Calendar menu |
| `link` | 24 | 18 / 1.5 | Invite card link row |
| `share` | 24 | 18 / 1.5 | Invite card "Wyślij na grupę" |
| `calendar-square` | 24 | 32 / 2.25 | Link-preview card, days |
| `clock` | 24 | 32 / 2.25 | Link-preview card, hours |

The three checks differ in geometry, not only in size; they stay three drawings so no screen changes by a pixel (WPA-93).
