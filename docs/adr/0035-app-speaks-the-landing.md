# ADR 0035: The app speaks the landing's language

- **Status:** Accepted
- **Date:** 2026-09-29
- **Owner:** owner (WPA-86)
- **Replaces:** ADR 0034's "no shadows, hero or idle motion on the poll pages until WPA-86 decides otherwise" for shadows and the poster header; ADR 0021's "Nie mogę" at the top of the Moje card; the brief's role table for the poll title and the settled date, its permanent "Zapisane", its "no shadows" and "a hero on the app's own pages", and its `accent` wordmark mark (the brand mark draws heat tiles)

## Context

After the bold landing (ADR 0034) the app looked like a different product: a friend who taps the link in the group chat lands on the plain v3 page. The owner approved an interactive prototype of every app screen (`app-prototype.html`, create variant B, https://claude.ai/artifact/QMtJ1uZxGBm6Gm987cBKEp) and a decision list (WPA-86 comment 2026-09-29 10:35). The host's order of the same day asks for a ledge under every button, a poll poster header, a sliding segmented control, an hour-range picker that asks for the end hour, a more menu as a dropdown on desktop and a sheet on the phone, and a saved flash, while every behaviour stays and no feature or toast is added. That breaks `spec/brief.md` "Visual design" (no shadows, no hero on app pages, the role table's sizes, motion only in `transform` and `opacity`), ADR 0021 (the Moje card layout) and ADR 0034's last point.

## Decision

- Every `Button` and `Chip` stands on a ledge: `ink` and `loud` on `heat-5`, light variants on `ink`, and a light button on an `ink` ground (`on-dark`, `loud-light`) on `accent`, where an `ink` ledge would vanish (the prototype's `on-ink`). A button lifts 2px on hover and drops onto the ledge on press; a chip stands on an `edge` ledge (`heat-5` when pressed) and only drops, as in the prototype; `text` stays flat. The ledge's `box-shadow` animates with the box, so the ledge's foot stays put; lift and press run only under `motion-safe`. Sizes and hit boxes do not change, so ADR 0009's 44px holds (decision list, host order)
- A 3×3 tile `BrandMark` with the wordmark heads the landing and every app page; a click scrolls to the top, shuffles the tiles and bursts (host order)
- Each poll page opens with a `PollPoster`: `coral` for participants, `ink` for the organiser, `coral` with the date once settled. It holds an eyebrow pill ("Kuba pyta" / "Pytasz jako Kuba"), the title in Bricolage 800 at `text-4xl`, `lg:text-8xl`, and the respondent count with an avatar stack, over a `WaveEdge`. No decorative tiles (decision list)
- The settled poster shows the date at `text-5xl`, `lg:text-9xl`, with the hours in `paper` on `coral` as large text (3:1, as ADR 0034's "wszystko"), a "Widzimy się" stamp, then "Będą N osób" with an avatar stack and "X nie może." (decision list)
- The top bar on poll pages is sticky and solid `paper`; the prototype's blurred bar is not built, because the brief rules glassmorphism out
- Shadows on the app pages: `shadow-poster` on the grid board, the `shadow-ledge` steps (`-up`, `-down`, and `-sm`, `-sm-up`, `-sm-down` for small buttons and chips), coloured by a shadow colour utility, under buttons, chips, your own cells and the best-time card (`ink` on a `heat-5` ledge), besides the segment's lift and the sheet's shadow the brief keeps
- "Nie mogę w żadnym terminie" is a light ledge button under the grid, no longer at the top of the Moje card (host order)
- "Zapisane" fades out about 1.6 s after each save but stays the text of the `role="status"`; "Zapisuję" and "Nie zapisano" with "Spróbuj ponownie" stay visible (decision list: "zapisane flashes … instead of a permanent label")
- Motion on the poll pages plays once, in answer to a change: the segment's sliding pill, a ripple when a stroke commits, a pop on a tapped results cell, the best-time pulse and burst, the saved fade, the brand mark's shuffle. Nothing idles and nothing moves on load, so the poll pages carry no "Zatrzymaj ruch"; bursts read `useMotion`, and `prefers-reduced-motion` removes all of it. Like the landing's pulse, the best-time pulse may animate its background
- The grain covers every app page. Avatars are rounded squares at every size
- The phone hour picker keeps its Od/Do fields and hour sheet in the new look: tiles at 390 would be about 38px wide, under ADR 0009's 44px. From `lg:` the first hour click marks one tile and the summary reads "Od N:00 kliknij godzinę końca →" (decision list)
- "Twoja kolej" is variant B: the title field is the section headline, the rest of the form sits in one card below, and the link preview beside it goes (decision list)
- Every new look is a token or a `src/shared/ui` component with its page in `spec/design/system/components/`, as ADR 0034 set; no role token is added (ADR 0019 holds)
- Not built: a create page on its own route (a new feature), a restyled link card image (the prototype does not draw it), the drag demo, the chat preview and the tilted link card (removed by the owner after review)

## Consequences

- A change that takes the poster, the ledges, the board's shadow or the grain off the app pages, or brings back a permanent "Zapisane", undoes this decision and needs the owner
- Idle motion on a poll page is still out; a new animation there plays once and answers a change
- `spec/design/v2/` and ADR 0021's layouts no longer describe the poll page's look; the prototype and the `spec/design/system/` pages do
