# 12: Cleanup of accepted notes

Status: ready-for-agent
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

- [ ] Hook test for the retry: "Zapisuję" at once, one send for two taps
- [ ] No unused export and no `flushRef` left (`grep` in the PR body)
- [ ] The two decisions are in `spec/decisions.md`
- [ ] Screenshot at 1440 of "Wszyscy" with the meta line and the inline hint
- [ ] Every appended note closed with its evidence

## Appended notes
