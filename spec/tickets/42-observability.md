# 42: Know when production breaks

Status: ready-for-agent
Blocked by: 31-security-audit.md, 32-architecture-audit.md (both touch server code)

## Parent

Owner request (2026-09-28): observability that works out of the box on Railway, no third-party service. The trigger: production served "This page couldn't load" on every new poll (SITE_URL unset, PR #46) while `/api/health` answered 200, and only the owner noticed.

## Outcome

A server exception anywhere in the app is one JSON log line that Railway's Log Explorer parses (`@level:error`), with the route, the error message and Next's digest; and a check every few minutes opens the real pages the way a visitor does and, when one fails, makes the owner's Railway project report it.

## Scope

- `src/instrumentation.ts` with Next's `onRequestError`: one JSON line per server error, `level`, `message`, `path`, `digest`, `routeType` (Railway docs: `message` and `level` are parsed, every other field becomes an `@attribute`, docs.railway.com/observability/logs)
- The smoke check as a script in the repo run by a Railway cron service (docs.railway.com/reference/cron-jobs, every 5 minutes at most): `GET /`, `/api/health`, `/robots.txt`, `/og.png` and a poll page that does not exist (expects the gone page, not a 500); it exits non-zero on any failure so the cron run shows failed, and writes one JSON error line naming what failed
- The owner's Railway steps in `AGENTS.md` or the README draft: the cron service, a project webhook to Slack or Discord for `Failed` and `Crashed` deploys (docs.railway.com/guides/alerts-crashes-failed-deploys), the volume-usage monitor if the plan has monitors

## Out of scope

- Sentry or any external service; analytics
- Alerting on log patterns or 5xx rates (Railway has no native trigger for them)

## Acceptance criteria

- [ ] A test proves `onRequestError` writes one parseable JSON line with `level: "error"`, the path and the digest
- [ ] The smoke script fails against a local production build with the #46 crash put back on a scratch branch (the poll page's metadata built from an unset `SITE_URL`) and passes against main's build: both outputs in the PR body
- [ ] The Railway steps list every click the owner makes, each with its docs link
- [ ] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green
