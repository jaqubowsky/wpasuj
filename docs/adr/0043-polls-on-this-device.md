# ADR 0043: "Moje ankiety" keeps the device's polls in one localStorage list

- **Status:** Proposed
- **Date:** 2026-10-01
- **Owner:** owner (what is listed and shown, WPA-63); container (the storage format and where it lives)

## Context

The landing lists the polls this browser created or answered, without an account (WPA-63). create-poll and answer-poll write the list, the landing reads it, and none of the three may import another. The list outlives deploys: a browser keeps what an older version wrote.

## Decision

- One `localStorage` key, `device-polls`, holds a JSON array of `{ id, role, lastDate }`, newest first; `role` is `organiser` or `participant`. `src/shared/device-polls.ts` is its only reader and writer (`rememberPoll`, `forgetPolls`, `useDevicePolls`), since the three modules share it and it holds no business rule
- `useCreatePoll` remembers a poll as `organiser` after `createPoll` succeeds; `useAnswer` remembers it as `participant` after a `saveAnswer` succeeds, "Tak, to ja" included, because its save follows. A poll already listed keeps its first role, so an organiser's own answer leaves it "Twoja ankieta"
- A stored list that fails its schema reads as empty, so a format written by another version starts over instead of breaking the landing
- The landing drops a poll 60 days after its last date, the window of `isExpired`, before any request. Opening the list calls the `findPolls` server action from create-poll, which `src/app/page.tsx` hands to `Landing`; it returns title, dates, answer count and set time for each live id, and the landing forgets every id it did not return
- `findPolls` is a read through a server action, since `spec/brief.md` names the only route handlers; it takes at most 100 ids

## Consequences

- Changing the stored shape needs a migration in `device-polls.ts` or accepts that every device's list empties once
- Only polls created or answered after this ships are listed; nothing backfills from cookies
- The list never leaves the browser: `findPolls` receives ids only, the same ids the poll links carry
