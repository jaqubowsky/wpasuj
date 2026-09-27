# 08: End-to-end acceptance

Status: ready-for-agent
Blocked by: 06-organiser.md, 07-link-preview.md

## Parent

`spec/brief.md` ("Acceptance"), every earlier ticket.

## Outcome

One Playwright journey proves the product: the organiser creates a poll with "Ten weekend", the default range and a title, shares it, three participants answer in separate browser contexts, the results agree with a hand count including a changed free set at the same count, the organiser reminds (the message names who answered), sets the time, and a participant downloads the `.ics` with the right UTC times. Every acceptance line of the brief is checked in a real browser, and any gap found is fixed here.

## Scope

- `e2e/journey.spec.ts` on phone-chromium and phone-webkit, results also at 1440
- A pass over every screen at 390 and 1440 against the mockups and design system, fixing gaps within the brief (copy, spacing, motion with reduced motion honoured, 44 px targets)
- Errors: every failure path shows Polish copy saying what happened and what to do

## Out of scope

- Deploy, Railway, the marketing site

## Acceptance criteria

- [ ] The journey passes in CI on both phone engines
- [ ] Each line of `spec/brief.md` "Acceptance" ticked with the test or screenshot that proves it, listed in the PR body
- [ ] The `screenshots` artifact holds every screen and state at 390 and 1440
