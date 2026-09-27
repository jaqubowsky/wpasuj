# Board

The host keeps this file current and a fresh host session resumes from it. One line per ticket: its file in `spec/tickets/` and, while it runs, its container. What each seat may do lives in the repository's profile, never here.

Two tracks. MVP: 06, 07, 09 and 10 in parallel; then 13 alone; then 25; then 12; then 08. Landing: 14 to 23 in order, one container at a time, beside the MVP track; paused while 13 runs. A merge is blocked only by a proven broken acceptance criterion of the ticket; notes go to 12. One fix round and one recheck per ticket, then merge or a host decision. Each landing ticket is accepted by its screenshots beside the canvas renders in `~/.sandboxes/wpasuj/host-acceptance/landing-canvas/`.

## Now

- `tickets/06-organiser.md`: claude-wpasuj-t06-organiser
- `tickets/07-link-preview.md`: claude-wpasuj-t07-link-preview
- `tickets/09-design-system-fixes.md`: claude-wpasuj-t09-design-fixes
- `tickets/10-grid-robustness.md`: claude-wpasuj-t10-grid
- `tickets/14-landing-skeleton.md`

## Next

- `tickets/13-module-layers.md` (after 06, 07, 09, 10; alone)
- `tickets/25-create-and-cant-feedback.md` (after 13)
- `tickets/12-cleanup.md` (after 25)
- `tickets/08-acceptance.md` (after 12, 13)
- `tickets/24-readme.md` (after 08)
- `tickets/15-story-frame.md` … `tickets/23-landing-seo-perf.md` (in order, after 14)

## Landed

- `tickets/01-foundation.md`: PR #1; gaps in ticket 09
- `tickets/02-day-hour-grid.md`: PR #3; gaps in ticket 10
- `tickets/03-create-poll.md`: PR #2; gaps in ticket 11
- `tickets/04-answer-poll.md`: PR #5
- `tickets/05-view-results.md`: PR #4
- `tickets/11-create-fixes.md`: PR #7
