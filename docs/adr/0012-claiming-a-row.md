# ADR 0012: Claiming a row with "Tak, to ja"

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container; owner (`claim-merges-own-row`)
- **Replaces:** `not-yours`, `claim-union`, `claim-merges-own-row` (former decision entries)

## Context

One person may answer from two devices; "Tak, to ja" lets a device take over a row, and the device that lost it must learn so.

## Decision

- `not-yours` means this device's cookie names a row another device took over. The save action clears that cookie, and the client sends once more as a newcomer, which reaches "To Ty, {imię}?"
- After "Tak, to ja" the grid holds the row's saved slots plus the ones painted on this device, and that union is saved
- On a device that already holds another row of the same poll, the claim copies that row's slots into the claimed row and deletes it, in one transaction, so one person is one respondent and no saved hour depends on a later save. The "To ty?" card says so before the tap: "Twoje godziny jako {imię} dołączą do tych.", or "Odpowiedź jako {imię} zniknie." when that row holds no hour. A claim from a device with no row is unchanged (WPA-56)

## Consequences

A claim that deletes the device's own row without copying it loses saved hours, which WPA-56 fixed.
