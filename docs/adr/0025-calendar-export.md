# ADR 0025: Calendar export

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container; owner (`calendar-menu`)
- **Replaces:** `ics-sequence`, `calendar-menu` (former decision entries)

## Context

Once a time is set, people add it to their calendar, and the organiser may change it later. The device does not know which calendar its owner uses.

## Decision

- "Dodaj do kalendarza" opens a small menu, the bottom sheet on a phone and the dropdown below the button on a desktop: Kalendarz Google (`calendar.google.com/calendar/render?action=TEMPLATE`, new tab), Kalendarz Apple (`/e/{id}/termin.ics`, served `inline` as `text/calendar` with no `download` attribute, so iOS Safari offers "Add to Calendar") and Outlook (`outlook.live.com` compose deeplink, new tab); each carries the title, the UTC start and end of the `.ics` and the poll link (WPA-54)
- The `.ics` event is `UID:<id>@<SITE_URL host>` with `SEQUENCE` set to the download's minutes since the epoch and `DTSTAMP` to its time, so a file downloaded after "Zmień termin" outranks the earlier one; no revision column is stored (WPA-21)

## Consequences

- Serving the `.ics` as an attachment turns iOS's "Add to Calendar" back into a file download
- A constant `SEQUENCE` or a changed `UID` leaves the old event in people's calendars after a change
