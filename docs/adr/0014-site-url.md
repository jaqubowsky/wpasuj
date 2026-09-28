# ADR 0014: Absolute URLs come from SITE_URL at request time

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** container; owner (`production-domain`)
- **Replaces:** `site-url-at-request`, `production-domain` (former decision entries)

## Context

The poll page's metadata and link preview need absolute URLs; the build should not depend on the deploy's address.

## Decision

- `SITE_URL` is read at request time by the poll page's `generateMetadata`, which sets `metadataBase`, so the build never needs it. The poll page fails without it; `.env.development` sets `http://localhost:3000`, Playwright `https://wpasuj.example`, and the production service must set it
- The production domain is wpasuj.pl: `SITE_URL=https://wpasuj.pl` on the production service; every absolute URL is built from `SITE_URL`; the landing story shows wpasuj.pl (WPA-33)

## Consequences

- Reading `SITE_URL` at build time bakes one address into the image
- A hard-coded host in an absolute URL breaks every environment but one
