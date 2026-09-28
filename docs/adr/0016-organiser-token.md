# ADR 0016: The organiser token

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container; host (`log-path-redacted`)
- **Replaces:** `organiser-link`, `organiser-token-payload`, `log-path-redacted` (former decision entries)

## Context

Organiser rights sit on the `<id>-org` cookie, whose value is a secret: whoever holds it may set the time and delete the poll.

## Decision

- The organiser link is `/e/{id}/organizator/{token}`, the token being the organiser cookie's value. The server passes it only to the page of a device that already holds that cookie; the route sets the cookie when the token matches and redirects to the poll either way (303). The `.ics` is `/e/{id}/termin.ics`, 404 while no time is set
- The token stays in that device's page payload: a server action on click would send the same secret to the same device, adding a round trip and no protection (note from PR #12)
- The server error log line carries `path` without its query string and with the organiser route's token segment replaced by `[token]` (WPA-7)

## Consequences

- Both URLs are shared outside the app, so changing either breaks links people already hold
- Rendering the token for a device without the cookie, or logging the raw path, leaks organiser rights
