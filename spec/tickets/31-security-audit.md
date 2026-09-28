# 31: Security audit

Status: done
Blocked by: 12-cleanup.md, 23-landing-seo-perf.md, 34-design-token-scale.md, 35-poll-page-v3.md, 36-finalised-poll.md, 37-overnight-hours.md, 38-production-readiness.md, 40-landing-v3-follow-up.md

## Parent

`spec/brief.md` (every section; "Stack (decided)" and the organiser, answer and link rules above all), `spec/decisions.md`.

## Outcome

Before the MVP ships, someone who wants to break Wpasuj without an account has been simulated against the whole app: every way in is listed with how it is closed, and every hole found is either fixed here, with a failing test first, or written up as a ticket the host ranks.

## Scope

- Trust boundaries: server actions, route handlers (read endpoint, organiser link, `.ics`, Open Graph image), cookies and the organiser token, zod at every boundary
- Abuse without an account: guessing poll ids and organiser tokens, taking over another person's name, flooding answers or polls, oversize input, SQL through Drizzle, XSS through titles and names (page, Open Graph image, `.ics`), header injection in `.ics`, open redirect on the organiser route
- Headers and cookies: `Secure`, `HttpOnly`, `SameSite`, CSP, `Referrer-Policy` (the organiser link must not leak through `Referer`), `X-Frame-Options`
- `npm audit --omit=dev` and the Docker image (runs as non-root, no secrets baked in)
- The findings list in `spec/audits/security.md`: each finding with severity, a reproduction, and "fixed in <commit>" or "ticket <NN>"

## Out of scope

- Deploy, Railway settings, rate limits at the edge: the owner's
- Architecture findings: ticket 32

## Acceptance criteria

- [x] `spec/audits/security.md` lists every boundary above with its verdict and the evidence (test, command output or file and line): sections "Server actions", "Route handlers", "Cookies and the organiser token", "Abuse without an account", "Headers", "Dependencies and the image"
- [x] Every critical or high finding is fixed with a test that failed before the fix; medium and low are tickets or accepted with a reason: no critical or high; mediums 1–3 fixed test-first in `7c4f248`, `c17503a` with `969645b`, `643bb80`; 4–9 accepted with their reasons in the findings table and decision 80
- [x] `npm run lint`, `typecheck`, `test`, `build` and `e2e` green: each exit 0 locally (450 tests; e2e phone-chromium and desktop-chromium 201 passed, 31 skipped); phone-webkit in the pull request's CI
