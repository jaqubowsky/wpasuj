# ADR 0032: Usage events are JSON log lines

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** owner (Railway only, no external service); container (the line's shape)

## Context

The owner could learn whether anyone uses Wpasuj only by opening the SQLite file on the Railway volume, and `polls.created_by_participant` (`spec/brief.md`, "Data") was written but never read. The brief rules out analytics inside the app, and the owner wants no external service and no notifications (WPA-74). Server errors already reach Railway's Log Explorer as one JSON line each (WPA-7).

## Decision

- One function, `writeLogLine` in `src/shared/log-line.ts`, writes every structured log line: `JSON.stringify` of a flat object with `level` and `message`, `level: "error"` on stderr and `level: "info"` on stdout. `onRequestError` uses it, and so does every usage event
- A usage event is `level: "info"` with the event name as `message` and `pollId` as the only key to the poll: `poll_created` (plus `createdByParticipant`) from `createPoll`, `answer_saved` from `saveAnswer` for a first answer and a changed one alike, `time_set` from `setFinal`
- An action writes its event after its store call returns, so a refused or failed action writes none
- No title, name, token or cookie value goes into a line; the poll id is enough to count and to join lines
- A save whose promise rejects in the browser (WPA-75), whether the request failed or the server answered with an error, is reported by `reportFailedSave` (`src/shared/failed-save.ts`) with `navigator.sendBeacon` to `POST /api/failed-saves`, at most 5 reports per page load. The route writes `{"level":"error","message":"client_save_failed","action","errorName"}` and answers 204. `action` is one of `saveAnswer`, `createPoll`, `setFinal`, `clearFinal`, `deletePoll`; `errorName` is one of `TypeError`, `Error`, `AbortError`, `SyntaxError`, or `other` for any other thrown value. Any other body is refused with 400 and writes nothing, so the public route never puts client text in the log. It carries no `pollId`

## Consequences

- Counting happens in Railway's Log Explorer, over its log retention; nothing in the app stores or shows the counts
- Failed saves show under `@level:error` beside server errors, and the phrase search `"client_save_failed"` counts them. The count is a floor: a page stops reporting after 5, and a report sent while the network is down is lost. A save that throws on the server also writes its `onRequestError` line, so `@level:error` counts that failure twice
- Anyone can post to `/api/failed-saves`, so its count can be inflated, never filled with text
- A new event is one `writeLogLine` call after the store call, and a new key in a line is a new attribute to filter on
- Adding a personal field to a line puts it in Railway's logs, outside the 60-day cleanup of the database
- Renaming an event or moving it before the store call breaks counts the owner already filters on
