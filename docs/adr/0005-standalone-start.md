# ADR 0005: Production runs the standalone build

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** container
- **Replaces:** `standalone-start` (former decision entries)

## Context

`output: 'standalone'` leaves static assets and migrations outside the server folder, and the Dockerfile should copy one directory.

## Decision

`npm run start` runs `.next/standalone/server.js`; `npm run build` copies `.next/static` and `drizzle/` into the standalone folder.

## Consequences

A build script that stops copying either folder ships a server without styles or without migrations; the Dockerfile relies on the one folder.
