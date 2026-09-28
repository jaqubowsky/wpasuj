# ADR 0022: The organiser's name is reserved

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** host; container (`organiser-answers-as-organiser`)
- **Replaces:** `organiser-name-reserved`, `organiser-answers-as-organiser` (former decision entries)

## Context

Person rows mark the organiser with a crown matched by name, so a friend taking that name would take the crown.

## Decision

- The organiser's name cannot be claimed with "Tak, to ja"; other names still can among friends. Organiser rights stay on the `<id>-org` cookie (WPA-42; WPA-5 audits the rest)
- The organiser answers under the poll's organiser name with no name field ("Pytasz jako Kuba"); the save status sits at the end of that line. `saveAnswer` refuses the organiser's name (`organiser-name`) from a device without the organiser cookie unless its own row already holds it, and `claimName` refuses it from any such device. The organiser's second device still takes its row with "Tak, to ja"

## Consequences

Dropping either refusal lets someone else wear the organiser's crown.
