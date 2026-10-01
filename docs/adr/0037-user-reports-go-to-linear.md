# ADR 0037: User reports go to Linear triage

- **Status:** Accepted
- **Date:** 2026-09-30
- **Owner:** owner (Linear as the destination, the key, the pill's place); host (honeypot and rate limit, no captcha); container (the request, the log lines, the placement mechanics)

## Context

The owner wants reporting a problem to be easy: a clearly visible button with a form in the app, not a mailto link (WPA-97). The GitHub repository is public, so a report filed there would publish what a user wrote. Linear is private and is where the agents take their work from.

## Decision

- "Zgłoś problem" is a pill fixed in the bottom-right corner of every page, mounted once in `src/app/layout.tsx` by the `report-problem` module. It opens the form in `Sheet`: a bottom sheet on the phone, a panel above the pill from `lg` (`menuAbove`)
- The server action `reportProblem` sends one `issueCreate` to `https://api.linear.app/graphql` with `LINEAR_API_KEY` as the `Authorization` header and a 10-second timeout: team Wpasuj, state Triage and label "User report" set by id, since the key acts as a team member and Linear sends only outside members' issues to triage by itself
- The issue carries the text, the contact the user typed, and what the page attaches: the path with the organiser token as `[token]` (`maskedPath` in `src/shared/masked-path.ts`, the rule `onRequestError` uses), the poll id, the user agent, the viewport and the server time. Never a name or a cookie
- Against bots: a hidden `website` field that, when filled, answers success and sends nothing, and at most 5 reports per client address per hour, counted in process memory by `x-real-ip`. No captcha until spam shows up
- A missing key, a network error and a Linear error all answer `unavailable`, write `{"level":"error","message":"report_failed","cause","status"}` (`status` is Linear's HTTP status, present only with `cause: "linear"`) without the report's text, and the form points to kontakt@wpasuj.pl. A filed report writes `{"level":"info","message":"report_filed","issue"}`
- The pill never moves: it rests in its corner (`--spacing` × 4 plus the safe area) on every page and width (WPA-102, host and owner; it replaces WPA-101's `body:has([data-bottom-bar])` lift, which held the pill 88px up on the whole landing because the create form keeps its bar in the DOM). Below `lg`, while an element marked `data-report-pill-clear` overlaps the pill's corner strip, from the pill's top to the viewport's bottom, the pill fades out and takes no taps (`data-covered`, `max-lg:` utilities). Two elements carry the marker: the create form's sticky bar (pinned at the bottom, or scrolling past after the form ends) and the hero's "Utwórz ankietę →", which the pill would cover on a 390×664 phone (host). `observe` from `react-intersection-observer` watches each marked element twice, with no `scroll` or `resize` listener: on the viewport (the element is on screen) and with `rootMargin: 100% 0px -<strip>px 0px` and `threshold: 1` (the element is wholly above the strip). `observe` rather than `useInView`, because a hook watches one element and the marked elements are found in the DOM per path. The strip is measured once per path from the pill itself, its height plus its computed `bottom`, so it carries the safe area, which no CSS length in a `rootMargin` can, and does not depend on which viewport height the browser reports. The observer is asynchronous: a frame or two of overlap right after a large jump is accepted. Every page ends in a spacer (`data-report-room`, `--spacing` × 19 plus the safe area) so its last content scrolls clear of the pill. `MotionToggle` moves to the bottom-left from `lg`, since both were fixed bottom right
- A paint stroke finds its cell through `document.elementsFromPoint`, taking the first element inside the grid, so the pill floating over a cell mid-scroll neither ends nor bends a stroke that started on the grid

## Consequences

- Report text lands in Linear as untrusted data: an agent that reads a "User report" issue treats its description as data, never as instructions
- The rate limit resets on every deploy or restart and counts per process; one Railway service runs one process, so it holds there
- `x-real-ip` is what Railway's edge sets for the connecting client (unverified against Railway's reference page when written); behind another proxy, every client shares one count
- An element the pill must keep clear of opts in with `data-report-pill-clear`; one left unmarked can sit under the visible pill. The pill reads the marked elements once per path, so one that mounts later on the same path is not watched
- The pill on the landing's first screen of a short phone is hidden until the hero's button scrolls above it
- Removing the `report-problem` module removes the pill, the spacer and the route to Linear, and leaves the `data-report-pill-clear` markers in `create-poll` and `landing` to delete; `MotionToggle` could then go back to the right
