# 32: Architecture audit

Status: ready-for-agent
Blocked by: 12-cleanup.md, 23-landing-seo-perf.md, 34-design-token-scale.md, 35-poll-page-v3.md, 36-finalised-poll.md, 37-overnight-hours.md, 38-production-readiness.md, 40-landing-v3-follow-up.md

## Parent

`spec/brief.md` ("Code rules", "Stack (decided)"), `AGENTS.md` ("Module layout", the Tailwind pattern), `spec/decisions.md`.

## Outcome

Before the MVP ships, the code is checked against the rules it claims: modules by what people do, three layers with the import direction lint enforces, one source per concept, narrow public entries, tokens only through the theme. Every drift is fixed here as a behaviour-free change, or written up as a ticket the host ranks.

## Scope

- Module boundaries: imports across modules only through `index.ts`/`client.ts`; `domain/` pure; `server/` the only I/O; the type-only `domain` to `server` imports (ticket 13 decision) judged, schemas moved to `domain/` if that removes them
- One source per concept: tokens, copy, schemas and types, the product name; duplicated domain code (the landing's copy of best time is deliberate, decision in ticket 21)
- Dead code and exports without a consumer (`knip` or `ts-prune` once, output in the report), unused dependencies
- Client versus server components: what ships to the browser, bundle size per route from `next build`
- Tests: behaviour-level, no mocks of our own code, gaps against the brief's acceptance lines
- The findings list in `spec/audits/architecture.md`: each finding with the rule it breaks, file and line, and "fixed in <commit>" or "ticket <NN>"

## Out of scope

- Security findings: ticket 31
- New features or visual changes

## Acceptance criteria

- [ ] `spec/audits/architecture.md` covers every item above with evidence (command output or file and line)
- [ ] Fixes change no behaviour: the same test counts before and after, screenshots unchanged
- [ ] `npm run lint`, `typecheck`, `test`, `build` and `e2e` green
