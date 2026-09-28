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

## Consequences

- Counting happens in Railway's Log Explorer, over its log retention; nothing in the app stores or shows the counts
- A new event is one `writeLogLine` call after the store call, and a new key in a line is a new attribute to filter on
- Adding a personal field to a line puts it in Railway's logs, outside the 60-day cleanup of the database
- Renaming an event or moving it before the store call breaks counts the owner already filters on
