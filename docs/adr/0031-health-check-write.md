# ADR 0031: The health check proves a committed write

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container

## Context

`railway.json` gates every deploy on `GET /api/health`. SQLite opens a write-protected database file read-only without an error, so a `select 1` passes on a read-only `/data` volume, and every create and save then fails (WPA-73). A write inside a transaction that is rolled back never reaches the disk: a probe left the WAL at 0 bytes, so that write cannot see a full volume either.

## Decision

`GET /api/health` rewrites SQLite's `user_version` with the value it already holds, in a transaction that commits. The commit appends one frame to the WAL (4152 bytes in the probe) and leaves the value unchanged, so it fails on a read-only or full volume and leaves nothing behind, with no table and no migration. Neither the app nor Drizzle reads `user_version`; Drizzle tracks migrations in `__drizzle_migrations`. A failed write answers 503 with the SQLite error code in the body (`SQLITE_READONLY`, `SQLITE_FULL`); an error that is not a `SqliteError` still throws, and a database that cannot open still throws.

## Consequences

- A rolled-back write in its place passes on a full volume
- Anything that starts using `user_version` shares it with the health check, which writes it on every call
