# ADR 0001: Technical code lives in shared

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** host; container (`last-name-storage`)
- **Replaces:** `db-schema-in-shared`, `design-system-in-shared-ui`, `brand-constant`, `last-name-storage` (former decision entries)

## Context

A module imports no other module (`spec/brief.md`, "Code rules"), yet `participants.poll_id` references `polls.id`, several modules draw the same components, name the product and remember the same device value.

## Decision

- Drizzle tables live in one file, `src/shared/db/schema.ts`, with one migration history. Modules own their zod schemas, queries and writes; the table file is the database's technical shape
- Design-system components (Text, Button, Chip, Segment, Input, Stepper, Cell, Card, Avatar, Status) live in `src/shared/ui/<component>/`: they carry look, no business rule
- The product name and wordmark are one constant, `src/shared/brand.ts`
- The last name used on a device lives in `localStorage` under `last-name` (`src/shared/last-name.ts`), written and read by create and answer alike

## Consequences

- A table moved into a module would make another module import it; a business rule added to a shared component moves domain code into `shared`
- Renaming the `last-name` key forgets every device's saved name
