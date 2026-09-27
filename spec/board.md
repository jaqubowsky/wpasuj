# Board

The host keeps this file current and a fresh host session resumes from it. One line per ticket: its file in `spec/tickets/` and, while it runs, its container. What each seat may do lives in the repository's profile, never here.

Every ticket whose blockers have landed runs at once, one container each, up to 4 containers (32 GB host, 6 GB per container). MVP: 13 alone; then 26 (Tailwind base) alone; then 33 (architecture gates) alone; then 27 to 30 (Tailwind per module) in parallel; then 25; then 12; then, once the landing (23) has landed too, 31 (security audit) and 32 (architecture audit) in parallel, with the fix tickets they open; then 08; then 24. Landing, beside it: 15, 21 and 22 after 30 (21 also after 27); scenes 16 to 20 after 15, each in its own file under `story/scenes/`; 23 last. A merge is blocked only by a proven broken acceptance criterion of the ticket; notes go to 12 (MVP) or to `host-acceptance/notes-landing.md` (landing). One fix round and one recheck per ticket, then merge or a host decision. Each landing ticket is accepted by its screenshots beside the canvas renders in `~/.sandboxes/wpasuj/host-acceptance/landing-canvas/`.

## Now

- `tickets/33-architecture-gates.md`

## Next

- `tickets/27-tailwind-shared.md`, `28-tailwind-create-answer.md`, `29-tailwind-view-results.md`, `30-tailwind-landing.md` (after 26, 33; in parallel)
- `tickets/25-create-and-cant-feedback.md` (after 27, 28, 29)
- `tickets/15-story-frame.md` (after 30)
- `tickets/21-landing-demo.md` (after 27, 30)
- `tickets/22-landing-faq-footer.md` (after 30)
- `tickets/16-story-create.md` … `tickets/20-story-best.md` (after 15)
- `tickets/12-cleanup.md` (after 25)
- `tickets/23-landing-seo-perf.md` (after 15-22)
- `tickets/31-security-audit.md`, `tickets/32-architecture-audit.md` (after 12, 23 and every ticket 14-30; in parallel)
- `tickets/08-acceptance.md` (after 31, 32 and their fix tickets)
- `tickets/24-readme.md` (after 08)

## Landed

- `tickets/01-foundation.md`: PR #1; gaps in ticket 09
- `tickets/02-day-hour-grid.md`: PR #3; gaps in ticket 10
- `tickets/03-create-poll.md`: PR #2; gaps in ticket 11
- `tickets/04-answer-poll.md`: PR #5
- `tickets/05-view-results.md`: PR #4
- `tickets/06-organiser.md`: PR #12
- `tickets/07-link-preview.md`: PR #9
- `tickets/09-design-system-fixes.md`: PR #11
- `tickets/10-grid-robustness.md`: PR #10
- `tickets/11-create-fixes.md`: PR #7
- `tickets/13-module-layers.md`: PR #15
- `tickets/14-landing-skeleton.md`: PR #13
- `tickets/26-tailwind-base.md`: PR #18
