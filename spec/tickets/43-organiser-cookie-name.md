# 43: One source for the organiser cookie name

Status: ready-for-agent
Blocked by: 31-security-audit.md

## Parent

`spec/brief.md` ("Code rules": one source per concept, share technical code), `spec/audits/architecture.md` (finding S5), decision 44.

## Outcome

Organiser recognition reads one cookie name everywhere: renaming the `<id>-org` cookie in one place can no longer leave the answer module checking a cookie nobody sets, which would let the organiser's own device be refused its name.

## Scope

- `organiserCookie(id)` moves from `src/modules/create-poll/server/organiser-access.ts:8` to `src/shared/token-cookie.ts`, beside `hashToken` and `tokenCookieOptions`
- `src/modules/answer-poll/server/answer-queries.ts:18` builds the name through it instead of `` `${poll.id}-org` ``
- No change to the name, the cookie options or who may act

## Out of scope

- Cookie flags, token strength or any other security property: ticket 31
- The e2e helpers that set the cookie by hand (`e2e/organiser.spec.ts`): they play a browser, not the app

## Acceptance criteria

- [ ] ``grep -rnF -- '-org`' src`` finds the name only in `src/shared/token-cookie.ts` and tests
- [ ] The same test counts before and after; `npm run lint`, `typecheck`, `test`, `knip`, `build` and `e2e` green

## Notes

Left out of ticket 32 because ticket 31 audits the same cookie code in parallel.
