# Operations

How Wpasuj runs in production and what it writes to its logs. Product rules are in `spec/brief.md`; the decisions behind each fact are the ADRs named beside it.

## System

```text
 organiser and participants,            group chat app
 phone or desktop browser, no account   (unfurls the poll link)
      |  pages, server actions,              |  GET /e/[id]/opengraph-image/<version>
      |  GET /api/polls/[id] every 8 s       |  (generateImageMetadata in opengraph-image.tsx)
      v                                      v
 +------------------------------------------------------+
 | Next.js standalone server, one Docker image          |
 | one Railway service at https://wpasuj.pl             |
 +------------------------------------------------------+
      |  better-sqlite3, migrations from drizzle/ on start
      v
 SQLite file at DATABASE_PATH (/data/wpasuj.db on the Railway volume)
```

- The organiser creates a poll at `/` and keeps an organiser cookie for it; `/e/[id]/organizator/[token]` grants that cookie on another device. Participants answer at `/e/[id]` under a per-poll cookie; the organiser sets the final time there, exported at `/e/[id]/termin.ics`
- Mutations are server actions. Client-side server state is the results query (TanStack Query in `view-results`), refetched every 8 s from `/api/polls/[id]`, and the landing's "Moje ankiety" query, which calls the `findPolls` server action when the list opens (ADR 0043)
- One process owns the database file and deletes expired polls from it on start and every 24 h (ADR 0039)

## Deploy

- `next.config.ts` sets `output: 'standalone'`; the `Dockerfile` runs it. `railway.json` builds that `Dockerfile` and gates each deploy on `GET /api/health`
- Production is one Railway service with a volume at `/data`
- `SITE_URL` is set on the service (ADR 0014)
- `LINEAR_API_KEY` sends user reports to Linear (ADR 0037). Without it, "Zgłoś problem" answers with the e-mail fallback; `/api/health` does not read it

## Health check

`GET /api/health` answers 200 once the database takes a write and `SITE_URL` is an http(s) URL, and 503 when either fails, with the SQLite error code for the write (ADR 0031). A database that cannot open still throws, a 500.

## Log lines

Every line is one JSON object written through `writeLogLine` (`src/shared/log-line.ts`).

- Server errors go to stderr from `onRequestError` in `src/instrumentation.ts`: `{"level":"error","message","path","digest","routeType"}`, `path` without its query and with the organiser token as `[token]`
- Usage events go to stdout after the action's store call succeeds, with no title, name or token (ADR 0032):
  - `{"level":"info","message":"poll_created","pollId","createdByParticipant"}` from `createPoll`
  - `answer_saved` (a first or changed answer) from `saveAnswer`
  - `time_set` from `setFinal`
  - `report_filed`, with the Linear `issue` identifier, from `reportProblem`
- `{"level":"error","message":"report_failed","cause","status"}` when a report cannot reach Linear: `cause` is `no-key`, `network` or `linear`; `status`, the HTTP status, comes only with `linear`
- `{"level":"error","message":"cleanup_failed","code"}`, with the SQLite error code, when the database refuses an expired-poll cleanup run; the server keeps serving and the next run tries again

## Railway Log Explorer

A quoted phrase searches `message`; `@<key>:<value>` searches any other key (Railway's documented syntax).

- `@level:error` finds every server error
- `"poll_created"` counts new polls; adding `@createdByParticipant:true` counts those created from a device that had answered another poll
