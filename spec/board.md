# Board

The host keeps this file current and a fresh host session resumes from it. One line per ticket: its file in `spec/tickets/` and, while it runs, its container. What each seat may do lives in the repository's profile, never here.

Every ticket whose blockers have landed runs at once, one container each, up to 4 containers (32 GB host, 6 GB per container). MVP: 34 (design token scale) once 25 and 30 land; then 35 (poll page in the approved look) and 37 (hours past midnight) in parallel; then 36 (finalised poll); then 12; then 31 and 32 in parallel with their fix tickets; 38 (production readiness) beside them, before 08; then 08; then 24. Landing, beside it: 15, 21 and 22 after 26, written in Tailwind from the start (30 migrates only the skeleton's CSS); scenes 16 to 20 after 15, each in its own file under `story/scenes/`; 23 last. A merge is blocked only by a proven broken acceptance criterion of the ticket; notes go to 12 (MVP) or to `host-acceptance/notes-landing.md` (landing). One fix round and one recheck per ticket, then merge or a host decision. Each landing ticket is accepted by its screenshots beside the canvas renders in `~/.sandboxes/wpasuj/host-acceptance/landing-canvas/`.

## Now

- `tickets/40-landing-v3-follow-up.md`: claude-wpasuj-t40-landing-follow-up, PR #50

## Next

- `tickets/31-security-audit.md`, `tickets/32-architecture-audit.md` (after 40; in parallel)
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
- `tickets/33-architecture-gates.md`: PR #20
- `tickets/21-landing-demo.md`: PR #21
- `tickets/22-landing-faq-footer.md`: PR #22
- `tickets/27-tailwind-shared.md`: PR #24
- `tickets/28-tailwind-create-answer.md`: PR #29
- `tickets/29-tailwind-view-results.md`: PR #25
- `tickets/15-story-frame.md`: PR #23
- `tickets/16-story-create.md`: PR #27
- `tickets/17-story-link.md`: PR #28
- `tickets/18-story-paint.md`: PR #31
- `tickets/19-story-heat.md`: PR #32
- `tickets/20-story-best.md`: PR #33
- `tickets/25-create-and-cant-feedback.md`: PR #34
- `tickets/30-tailwind-landing.md`: PR #35
- `tickets/34-design-token-scale.md`: PR #37
- `tickets/37-overnight-hours.md`: PR #40
- `tickets/35-poll-page-v3.md`: PR #41
- `tickets/38-production-readiness.md`: PR #42
- `tickets/36-finalised-poll.md`: PR #43
- `tickets/12-cleanup.md`: PR #44
- `tickets/23-landing-seo-perf.md`: PR #39
- `tickets/41-webkit-answer-flake.md`: PR #47
- `tickets/39-ci-parallel.md`: PR #48
- Production crash without SITE_URL (no ticket): PR #46
