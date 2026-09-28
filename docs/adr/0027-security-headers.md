# ADR 0027: Security headers and Secure cookies

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** owner
- **Replaces:** `security-headers` (former decision entries)

## Context

The security audit (WPA-5, `spec/audits/security.md`) closed framing, referrer and sniffing holes. Railway's edge terminates TLS, and e2e serves plain-http localhost with an https `SITE_URL`.

## Decision

Every response carries `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: same-origin` and `X-Content-Type-Options: nosniff`, set once in `next.config.ts`. The token cookies are `Secure` when the request arrived over https, read from `x-forwarded-proto` (Railway's edge sets it; Next fills it from the socket without a proxy), not from `SITE_URL`: WebKit drops a `Secure` cookie set over plain-http localhost (CI run 36415182352). No script-src CSP: no user text reaches an HTML sink, and a nonce CSP would make every page dynamic. HSTS, rate limits and the root image stay with the owner and WPA-45.

## Consequences

- Deriving `Secure` from `SITE_URL` breaks WebKit e2e
- A nonce CSP turns every page dynamic
