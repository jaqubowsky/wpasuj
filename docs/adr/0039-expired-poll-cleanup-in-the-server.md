# ADR 0039: The server deletes expired polls on start and once a day

- **Status:** Accepted
- **Date:** 2026-10-01
- **Owner:** host (no scheduled services, WPA-59); container (the column and the interval)
- **Replaces:** `spec/brief.md` Data, "The create action deletes polls 60 days past their last date before it inserts"; ADR 0003's "The create action's cleanup" for where the cleanup runs (its `Etc/GMT+12` cutoff stays)

## Context

The create action deleted expired polls inside every create transaction, scanning `json_each(dates)` over every row, and nothing deleted them while nobody created a poll (WPA-59). The owner runs no scheduled services on Railway, so no cron can call a route.

## Decision

- `polls.last_date` holds the poll's latest date, indexed; migration `0002_last-date` fills it from `dates`, and `insertPoll` writes it
- `dates` do not change after create; a write to `dates` writes `last_date` in the same statement, since pages judge expiry from `dates` (`isExpired`) and the cleanup from `last_date`
- `register()` in `src/instrumentation.ts` runs `scheduleExpiredPollCleanup` after the migrations: one delete at start, then one every 24 hours on an unref'd interval in the server process. It deletes polls whose `last_date` is before `cleanupCutoff`; participants and slots go with them by cascade
- `createPoll` deletes nothing

## Consequences

- Moving the app to a serverless or edge runtime, or to several processes, drops or repeats the cleanup; the interval assumes the one long-lived process `docs/operations.md` "System" describes
- An expired poll stays in the database at most a day past its 60 days, longer only when the server is down or a run fails (`cleanup_failed`, logged; the next run comes a day later); pages already treat it as gone through `isExpired`
- A Drizzle insert without `lastDate` fails `typecheck`. A raw SQL insert without `last_date` stores the migration's default `''`, which sorts before every date, so the next cleanup deletes it
