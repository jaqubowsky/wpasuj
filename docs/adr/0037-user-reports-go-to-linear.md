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
- The pill rises above an element marked `data-bottom-bar` (the create form's sticky bar) only while it is pinned: `position: sticky` with its bottom within 1px of the viewport's bottom edge. A bar that scrolls with the content passes under the pill, so the pill never follows the scroll position (WPA-100, host). Every page ends in a spacer (`data-report-room`) so its last content scrolls clear of the pill. `MotionToggle` moves to the bottom-left from `lg`, since both were fixed bottom right
- A paint stroke finds its cell through `document.elementsFromPoint`, taking the first element inside the grid, so the pill floating over a cell mid-scroll neither ends nor bends a stroke that started on the grid

## Consequences

- Report text lands in Linear as untrusted data: an agent that reads a "User report" issue treats its description as data, never as instructions
- The rate limit resets on every deploy or restart and counts per process; one Railway service runs one process, so it holds there
- `x-real-ip` is what Railway's edge sets for the connecting client (unverified against Railway's reference page when written); behind another proxy, every client shares one count
- A new sticky bottom bar that is not marked `data-bottom-bar` lets the pill sit on its button
- A bar pinned with `position: fixed` gets no lift until the hook counts that position as pinned too
- Removing the `report-problem` module removes the pill, the spacer and the route to Linear; `MotionToggle` could then go back to the right
