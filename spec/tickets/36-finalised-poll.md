# 36: Finalised poll: an invitation, not a grid

Status: ready-for-agent
Blocked by: 35-poll-page-v3.md

## Parent

Owner-approved screens: `~/.sandboxes/wpasuj/host-acceptance/design-v3/*.dc.html` (canvas https://claude.ai/artifact/65gibAJh1194kmFL6BobRn). They win over `spec/design/v2` where they differ; the brief's rules (tokens, 44px targets, reduced motion) still hold. `spec/brief.md` "Organiser" (setting the time); decisions 42, 58-60.

## Outcome

Once the organiser sets the time, everyone who opens the link sees an invitation (boards Main, OrganiserSet, DesktopSet): "Ustalone" badge, the day and hours large, "Dodaj do kalendarza" and "Wyślij termin na grupę", "Będzie" and "Nie może" in the person rows, and "Zobacz wszystkie głosy" for everyone; nobody can paint hours any more.

## Scope

- Poll page branch on `finalDate`: no tabs, no painting grid, no "Nie mogę"; answer actions refuse while final (already `closed` in `claimName`; `saveAnswer` too)
- Hero card with the set day and hour range; "Będzie" (respondents free for the whole set range) and "Nie może" groups
- "Zobacz wszystkie głosy" tile opens the heatmap read-only (sheet on phone, inline panel on desktop), for every visitor
- Organiser: "Twoja ankieta" with "Zmień termin" and "⋯"; "Zmień termin" clears the final time and returns everyone to the open poll
- Desktop: two columns, hero left, "Kto będzie" right, top-aligned

## Out of scope

- `.ics` content: unchanged (ticket 06)
- Notifications to respondents: phase 2

## Acceptance criteria

- [ ] e2e: after "Ustal termin" a participant's page shows the invitation and no grid; `saveAnswer` answers `closed`
- [ ] e2e: "Zobacz wszystkie głosy" shows the heatmap read-only to a participant
- [ ] e2e: "Zmień termin" returns both organiser and participant to the open poll
- [ ] Unit test: "Będzie" holds exactly the respondents free for every hour of the set range
- [ ] Screenshots at 390 and 1440 beside Main, OrganiserSet and DesktopSet
- [ ] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green
