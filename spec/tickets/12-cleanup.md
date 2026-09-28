# 12: Cleanup of accepted notes

Status: done
Blocked by: 35-poll-page-v3.md, 36-finalised-poll.md, 37-overnight-hours.md

## Parent

`spec/brief.md` ("Code rules"); host acceptance files `~/.sandboxes/wpasuj/claude-wpasuj-t04-answer/acceptance.md` (Round 2), `claude-wpasuj-t05-results/acceptance.md` and `claude-wpasuj-t11-create-fixes/acceptance.md` (Recheck); notes from later acceptances, which the host appends below.

## Outcome

The small points the host accepted at merge time are fixed or recorded, so no accepted note is left before the final acceptance (08).

## Scope

- answer-poll: drop the unused `Problem` export; "Spróbuj ponownie" shows "Zapisuję" at once and a second tap during the retry sends nothing more; call `flush` directly and delete `flushRef`
- `spec/decisions.md`: a save on unload may be cancelled with the page (the brief's Stack allows no route handler for it); "one save in flight" wins over sending at once on hide
- create-poll and the poll page: the zone copy next to the component that shows it; one shared read of the device time zone for today, the zone note and the create form
- view-results at 1440: the meta line "Kuba pyta · pt 17 – nd 19 października" and the hint inline with the segment, as `results-desktop.html`
- Notes appended by the host from the acceptance of 06, 07, 09 and 10

## Out of scope

- New behaviour beyond the notes

## Acceptance criteria

- [x] Hook test for the retry: "Zapisuję" at once, one send for two taps. Evidence: `src/modules/answer-poll/ui/use-autosave.test.ts` "says saving at once on a retry, and a second tap while it runs sends nothing more" (red before f0329c0)
- [x] No unused export and no `flushRef` left. Evidence: `git grep -n "flushRef\|export type Problem" src` prints nothing; `npm run knip` exit 0 (commit 265b7e0; `flush` reaches the leave listeners through `useEffectEvent`, since `react-hooks/exhaustive-deps` warns on a bare `flush`)
- [x] The two decisions are in `spec/decisions.md`. Evidence: decisions 68 (save on unload may be cancelled) and 69 (one save in flight wins over sending on hide)
- [x] Screenshot at 1440 of "Wszyscy" with the meta line and the inline hint: superseded by decision 78: the owner-approved v3 boards (decision 63) drop the date range from the meta line and put the hint above the heatmap (`page.tsx` "Kuba pyta"; `results-body.tsx` hint); CI's `results-*-desktop-chromium.png` show the approved layout
- [x] Every appended note closed with its evidence. Evidence: the list below
- [x] Owner fix (must): desktop hour tiles, first-click feedback and 2 then 8 = 2:00 → 9:00 · 7 godzin. Evidence: `hour-range.test.ts` "a last tile earlier in the order runs on into the next morning" (withTiles(2, 8) = 7, red at −17) and withTiles(22, 3) = 6; `create-poll-form.test.tsx` "picks 22:00 to 4:00 …" (start tile pressed after the first click, red before) and "ends on a tile before the start in the next morning"; e2e `create-poll.spec.ts` "on desktop the first tile shows as the start, and 2 then 8 runs to 9:00 the next morning" with `create-hours-start-desktop-chromium.png` (commit 88f9edc, decision 70)

## Appended notes

Copied from `~/.sandboxes/wpasuj/host-acceptance/notes-for-12.md`; each closed below.

From PR #9 (ticket 07)
- Dates as a range on the card: done, `link-preview.test.ts` "names three or more days in a row as a range" (325e5aa, decision 72)
- Docker CI step for `/e/<id>` and its card: done, ci.yml docker step "serves the poll page on SITE_URL and its card with the fonts in the image" (20befb6); runs in CI only (no docker here, gate-baseline)
- 60-character title with ten dates clear of the wordmark: done, e2e `link-preview.spec.ts` compares the wordmark band with a short card's; a band moved onto the content fails it (743729f)
- Escape `siteUrl` in the regex: done, prefix match instead of a regex (bd5b91c)

From PR #10 (ticket 10)
- Screen reader after Space: decision 77, VoiceOver check left to ticket 08
- Stroke left open blocks later strokes: fixed, a new primary press replaces it; `use-paint-stroke.test.ts` "lets a new press replace a stroke whose pointer went away unseen" (0868902)
- Grid wires `onPointerCancel` and buttonless moves: `day-hour-grid.test.tsx` "drops a drag the browser cancels", "drops a drag once the pointer moves with no button pressed"; both fail with the wiring removed (df50e38)
- `Pointer.buttons` unused in `start`: `start` takes `pointerId` and `isPrimary` only (0868902)
- Cell README documents `aria-pressed`: fixed (7600d90)

From PR #11 (ticket 09)
- Organiser avatar key in the header: e2e `poll-page.spec.ts` "the organiser's avatar in the header takes the tint of the organiser's row" ("Kuba" and "kuba" give different tints) (6972f64)
- 44px sweep on `/e/[id]` and by width: `design-system.spec.ts` "every target on the poll page is at least 44px tall and wide" (cell sheet, Moje, "Tak, to ja"); width added to every sweep (c7f5392)
- `respondent-list.tsx` keys on the display name: already fixed, `people-list.tsx` keys and tints on `normalisedName`
- Input Label variant: no caller needs one; `Input` has `title` and `compact` variants
- Focus state of Button, Chip and Segment: `design-system.spec.ts` "Button, Chip and Segment show the ink focus ring from the keyboard", screenshots `components-focus-*` (ff826dd)

From PR #12 (ticket 06)
- Best-time range breaks inside: hours in one nowrap span; `view-results.spec.ts` asserts one line box (db03ce4)
- "Najlepiej" under "Ustalone": moot, the invitation (decision 67) replaces the open poll
- Organiser token in the payload: decision 74, kept
- Pending state on "Ustal termin" and "Tak, usuń": `organiser.test.tsx` "waits on a slow set …", "waits on a slow delete …" (32412c9)
- Non-Latin-1 id answers 500: 404, `organizator/[token]/route.test.ts` "answers 404 for an id that is no poll id" (red on the ByteString TypeError) (a9869e9)
- `.ics` UID and SEQUENCE: `calendar-file.test.ts` "names the event by the poll and the site …", route test checks the UID (374271e, decision 73)
- Poll row read twice per organiser action: one read, the cookie compared with the row's hash (6a4017e)

From PR #15 (ticket 13)
- Domain type-only imports from `server/`: decision 75, kept

From PR #34 review (ticket 25)
- Tap during the clearing fade: already consistent, the tap goes through `replaceSlots`, which stops the fade (`use-answer.ts`)
- "Cofnij" with no earlier hours: already fixed by decision 57, the toggle only turns off
- Check icon duplicated: decision 76, kept inline at three sizes
- `shared/fresh-poll.ts`: stays, decision 54
- Device checks (userActivation, view-transition-class, header clip): no code uses the first two; the morph check is left to ticket 08

From ticket 34 review (PR #37)
- landing.tsx / story.tsx widths: left, `src/modules/landing` belongs to open ticket 23 (order)
- `cn("mt-[6px]")` fails lint: proven, `@shadcn/lint` reads `cn` by default; probe log `claude-wpasuj-t12-cleanup/logs/lint-probe/eslint.log`
- AGENTS.md half steps: reworded to any half step (c665077); the landing's half steps are allowed by it
- `--leading-none` redundant: removed, `leading-none` still builds `line-height:1`; AGENTS.md names `leading-3.5` (45becd6, c665077)
- tailwind-merge shadows: already merged by default; `cn.test.ts` proves lift, sheet and menu (5fdd74a)
- `grid-rows` allow: narrowed to `grid-rows-[auto]`; text-shadow already in the colour pattern (f619b0f)
- Brief tracking range: −0.01 to −0.03em (a3c8433)
- Ticket 34 evidence: 7xl and `--container-grid-fit` (3f4dd42)
- faq.tsx 60ch: already `max-w-165`
- story.tsx transitions `transform` for `translate-y-*`: left, landing (ticket 23)

From ticket 37 (PR #40)
- Sheet hours 4px apart: 6px, e2e measures the gap (red at 4) (cb7677b)
- Brief to decision 59: Terms, "O której?" and Data rewritten (a3c8433)
- After-midnight calendar date: decision 71; `time-label.test.ts` "names an hour or a run that starts after midnight by its calendar date" (4f0a080)
- t37 review P2s: all closed in that review except the three host items above

From ticket 35 (PR #41)
- "Też dobre" removed: brief Results, Organiser's extras and Acceptance (a3c8433)
- t35 review P2s: disabled "Ustal termin", "To nie ja", copy split, organiser-name rule, `newestFirst`, `Sheet open`, poll-gone padding, `hashToken`, eslint allow and decision 37 were fixed in PR #41; side panel after Moje fixed here, `poll-tabs.test.tsx` "forgets a tapped hour once Moje is open …" (98f4899); AGENTS.md plain-CSS example now `sheet.css` (c665077); invite-card clipboard stub is `refuseClipboard()`

From ticket 38 (PR #42)
- Docker read-back under retries: already `--retries=0` on that step
- Brief `/api/health` and self-hosted fonts: Stack (a3c8433)
- Runtime image as root: for ticket 31

From ticket 36 (PR #43)
- Fill-in motion struck and decision 46 superseded (a3c8433, 199afc7)
- Invitation radius 20px: accepted by the host, no change
- Other t36 P2s: all closed in PR #43

Original scope, not a note above: zone copy moved into `ZoneNote` with `zone-note.test.tsx` (469bccf); one read of the device zone, `deviceTimeZone()` (0c18866)
