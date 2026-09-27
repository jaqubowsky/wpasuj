# 35: Poll page in the approved look

Status: done
Blocked by: 34-design-token-scale.md, 30-tailwind-landing.md

## Parent

Owner-approved screens: `~/.sandboxes/wpasuj/host-acceptance/design-v3/*.dc.html` (canvas https://claude.ai/artifact/65gibAJh1194kmFL6BobRn). They win over `spec/design/v2` where they differ; the brief's rules (tokens, 44px targets, reduced motion) still hold. `spec/brief.md` "Answering", "Results", "Organiser"; decisions 58-60.

## Outcome

The poll page looks and behaves as the approved boards Answer, NameClash, OrganiserName, CantMake, CellSheet, Organiser, OrganiserSheet, Respondents, DeleteConfirm, Invite, PollGone, DesktopMoje and DesktopWszyscy show, on phone and desktop, with no layout shift between "Moje" and "Wszyscy".

## Scope

- One person row everywhere (board People): 44px, 32px avatar, name; state carried by the avatar only: ring = you, crown badge = organiser, cross badge = cannot, dashed = not answered yet; screen-reader text for each. Groups with a heading and count. No trailing labels, no chips
- One grid look for both tabs: the same white card, day headers, hour labels and 48px cells; only the fill differs (your coral vs heat); hint line under the grid; no legends
- Desktop: title full width, then two fixed columns (grid 1fr, panel 340px) in BOTH tabs; the panel holds "Najlepiej teraz", then "Twoja ankieta" (organiser), then "Odpowiedzieli"; its top aligns with the tab switch
- "Najlepiej teraz" shows only the time where a people list is on the same screen; "4 z 5" only where no list is shown; never "Nie może: …" on the card
- Organiser card "Twoja ankieta": "Ustal termin", "Przypomnij", "⋯"; "⋯" opens a bottom sheet on the phone (slide up 200 ms) and a menu on desktop (140 ms), no motion under reduced motion; items with icons, "Usuń ankietę" last in `accent-ink`; replaces the current organiser row and inline "Więcej"
- "Nie mogę w żadnym terminie": full-width button at the top of the Moje card; pressed state in place, grid faded, "Cofnij" as a small link under the grid where the hint was; no extra copy
- Invite card after create (board Invite): check badge, "Ankieta gotowa", one line, the link, "Wyślij na grupę" and "Kopiuj" side by side; replaces ticket 25's card look, keeps its share timing
- Name clash: "To Ty?" card; the organiser's name cannot be claimed ("Tak ma na imię organizator. Wpisz swoje."), enforced in `claimName` on the server, not only in the UI
- Phone: every people list is a bottom sheet (boards CellSheet, Respondents): tapping an hour opens who can and who cannot at that hour; the header counter ("4 osoby") is a button that opens "Odpowiedzieli". No inline people list on the phone; desktop keeps it in the side panel
- Poll gone: centred coloured grid mark, heading, one line, full-width button

## Out of scope

- The finalised poll screen: ticket 36
- Hour ranges past midnight: ticket 37
- Landing story scenes that draw the old look: follow-up after this lands

## Acceptance criteria

- [x] Screenshots at 390 and 1440 of every board listed in Outcome beside its `.dc.html`, differences listed in the pull request body: `e2e/poll-page.spec.ts` saves `v3-*` (Invite: `invite-card` from `create-poll.spec.ts`); side by side in the task directory `browser/v3-compare/`
- [x] e2e: switching "Moje" and "Wszyscy" on desktop moves no element of the header, title, tab switch or side panel (bounding boxes equal before and after): `e2e/poll-page.spec.ts` "DesktopMoje: on a desktop, switching tabs moves no part…"
- [x] e2e: "⋯" opens the sheet on phone and the menu on desktop, Escape and the scrim close it, focus returns to "⋯"; reduced motion has no animation: `e2e/poll-page.spec.ts` "⋯ opens a sheet on a phone and a menu on a desktop…" and "with reduced motion › the ⋯ sheet opens with no animation"
- [x] Action test: `claimName` with the organiser's normalised name returns a refusal and changes no row: `answer-actions.test.ts` "refuses the organiser's name and changes no row"
- [x] e2e: "Nie mogę" pressed and "Cofnij" shift no element above the grid: `e2e/poll-page.spec.ts` "CantMake: Nie mogę and Cofnij move nothing above the grid"
- [x] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green: task directory `logs/gate-20260927T234853/` (e2e phone-chromium and desktop-chromium here; phone-webkit in CI)

## Comments

- "Też dobre" is gone with the boards, so "Ustal termin" sets only the best run; the brief still describes "Też dobre" and asks for a host call (task `status.md`)
- A tapped hour stays in the desktop side panel after switching to "Moje" (review P2, left for the host)
