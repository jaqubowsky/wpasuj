# ADR 0003: Dates are judged in the poll's time zone

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** host; container (`poll-expiry`, `zone-line-by-name`)
- **Replaces:** `past-dates-in-poll-zone`, `poll-expiry`, `zone-line-by-name` (former decision entries)

## Context

A poll is created on one device in one zone, while the server and other viewers may sit in another, so "today" differs between them.

## Decision

- The server checks "none in the past" against today in the poll's zone, the same date the organiser's device shows
- A poll is gone once all its dates are more than 60 days before today in its zone. The create action's cleanup takes today in `Etc/GMT+12`, where the date changes last, so it never deletes a poll its own zone still shows
- The poll page's zone line compares IANA zone names, so a viewer in `Europe/Berlin` on a `Europe/Warsaw` poll reads it too; the brief says "when a viewer's zone differs"

## Consequences

- A check against the server's date refuses a valid date or deletes a live poll near midnight
- Comparing UTC offsets instead of names hides the zone line from viewers in a zone with the same offset today
