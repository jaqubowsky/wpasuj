# Security audit

WPA-5, run on `main` at `ad30473` (2026-09-28). The attacker has no account and holds what anyone in a group chat holds: a poll link, maybe an organiser link, a browser and `curl`. Production (`https://wpasuj.pl`) was read with `GET` only; everything that writes ran against the local standalone build.

Severity: **critical** loses or leaks every poll, **high** takes over a poll or its people without the link holder's help, **medium** needs a victim's click, a hostile network or the organiser's own hand, **low** hardens without a reachable hole.

## Findings

| # | Finding | Severity | Reproduction | Outcome |
| --- | --- | --- | --- | --- |
| 1 | A lone CR in a poll title ends the `.ics` SUMMARY line, so the organiser plants properties (`URL:`, `ATTACH:`, a second `VEVENT`) in every participant's calendar | medium | `createPoll` with title `"Kino\rURL:https://evil.example"`, set a time, `GET /e/<id>/termin.ics`: the file carries `SUMMARY:Kino` and a separate `URL:https://evil.example` line. Test: `calendar-file.test.ts` "keeps a lone carriage return in the title inside the summary" | fixed in `7c4f248` |
| 2 | No framing, referrer or content-type header; `x-powered-by: Next.js` names the framework | medium | `curl -sD - -o /dev/null https://wpasuj.pl/` prints no `X-Frame-Options`, no `Content-Security-Policy`, no `Referrer-Policy`, no `X-Content-Type-Options`. A page that frames `/e/<id>` can lead the organiser's clicks onto "Usuń ankietę", "Tak, usuń". Test: `e2e/security-headers.spec.ts` | fixed in `643bb80` |
| 3 | The participant and organiser cookies have no `Secure`, and `http://wpasuj.pl/` answers `301` with no HSTS, so the first plain-HTTP request sends both tokens in clear | medium | `curl -sD - -o /dev/null http://wpasuj.pl/` -> `301` to https, no `Strict-Transport-Security` on the https answer; `src/shared/token-cookie.ts` at `ad30473` sets `httpOnly`, `sameSite`, `path`, `maxAge` only. Tests: "marks the organiser cookie Secure on a request that arrived over https" (`create-poll-action.test.ts`), "marks the participant cookie Secure on a request that arrived over https" and "leaves Secure off a cookie set over plain http, so a browser on http://localhost keeps it" (`answer-actions.test.ts`) | fixed in `c17503a` and `969645b`: `Secure` when the request arrived over https, read from `x-forwarded-proto`, which Railway's edge sets and Next fills from the socket when no proxy does (`node_modules/next/dist/server/base-server.js:608-611`). `c17503a` took the scheme from `SITE_URL`; e2e serves `http://localhost` with an https `SITE_URL`, and the CI `e2e (phone-webkit)` job then lost the cookies after create and answer (run 36415182352) |
| 4 | Anyone with the poll link creates up to 30 participants and fills the poll (`full`), or creates polls without limit until the volume is full | medium | a loop of `saveAnswer` with a fresh cookie jar and a new name refuses the 31st with `full` (`answer-rules.ts:23`, `answer-actions.test.ts:202`); `createPoll` has no per-client cap (`create-poll-action.ts:16`) | accepted: rate limits at the edge are the owner's (WPA-5, "Out of scope"); the 30-person cap is the brief's ("Data") |
| 5 | Anyone with the poll link types an existing name, answers "Tak, to ja" and takes the row, its hours and its cookie | low | `claimName(pollId, "Ola")` from a fresh jar moves the row (`answer-actions.ts:77-100`) | accepted: the brief's "Identity" rule ("Friends are trusted; there is no password") |
| 6 | Names differing only by a zero-width or look-alike character read as the same person | low | `saveAnswer` with `"Ola​"` next to `"Ola"`: two rows, one look (`name-rules.ts:3-9` collapses only `\s`) | accepted: the same trust as finding 5, and taking the real name is already one tap |
| 7 | No script-src CSP | low | response headers above; only `frame-ancestors` is set | accepted, decision `security-headers`: no user text reaches an HTML sink, and a nonce CSP would make every page dynamic |
| 8 | No HSTS | low | response headers above | accepted: TLS and the domain are Railway's and the owner's; finding 3's `Secure` closes the token exposure without it |
| 9 | The image runs as root | low | `Dockerfile` has no `USER` | accepted: WPA-45, Railway mounts the volume root-owned and a non-root image failed with `SQLITE_CANTOPEN` |

No critical or high finding.

## Boundaries

### Server actions

| Action | Input check | Authorisation | Verdict |
| --- | --- | --- | --- |
| `createPoll` | `createPollSchema` (`poll-schema.ts:15-35`): title 1–60 after trim, 1–10 unique ISO dates, none past in the poll's zone (`hasPastDate`, `create-poll-action.ts:19`), hours 0–23 and 1–24, a zone `Intl` knows, name 1–30 | none needed; sets the organiser cookie | closed; flooding is finding 4 |
| `saveAnswer` | poll id regex, `answerSchema` (`answer-schema.ts:6-13`), `fitsPoll` keeps slots inside the poll's dates and hours | the participant cookie, looked up by hash in this poll only (`answer-queries.ts:22-28`); a stale cookie is deleted and answered `not-yours` | closed; the name rule is finding 5 |
| `claimName` | poll id regex, `nameSchema`; refuses the organiser's name off the organiser device | none, by the brief | accepted, finding 5 |
| `setFinal`, `clearFinal`, `deletePoll` | poll id regex, `finalTimeSchema` plus `fitsPoll` | organiser cookie hash equals `polls.organiser_token_hash` (`organiser-access.ts:19-22`); `not-organiser` otherwise. Tests: `organiser-actions.test.ts` "refuses someone without the organiser cookie" | closed |

Every action is behind Next's origin check (`node_modules/next/dist/server/app-render/action-handler.js:450-460`, "Invalid Server Actions request.") and its 1 MB body limit (same file, `:517-519`), so a cross-site form cannot call one and no body reaches zod above 1 MB. The largest valid answer is 10 dates × 24 hours = 240 slots.

### Route handlers

| Route | Verdict | Evidence |
| --- | --- | --- |
| `GET /api/polls/[id]` (read endpoint) | closed: 404 for an unknown or malformed id; returns names, hours and save times, never a token or its hash; `you` is computed from this device's cookie | `route.ts:5-10`, `results-queries.ts:27-39` |
| `GET /e/[id]/organizator/[token]` (organiser link) | closed: sets the cookie only when the token's hash matches; answers the same `303` either way, so it tells nothing about a guess; `location` is built from a regex-checked id, so no open redirect | `route.ts:3-8`; prod `GET /e/abcdefghij/organizator/x` -> `303 location: /e/abcdefghij` |
| `GET /e/[id]/termin.ics` | fixed, finding 1: the only user text is the title, escaped for `\`, `;`, `,` and every line break; the filename is a constant | `calendar-file.ts:34-36`, `route.ts:12-13` |
| `GET /e/[id]/opengraph-image` | closed: Satori draws the title and organiser name as text, not HTML; 404 for an unknown id | `opengraph-image.tsx:10-12`, `link-preview-image.tsx` |
| `GET /og.png`, `GET /api/health` | closed: no input | `og.png/route.ts`, `api/health/route.ts` |
| `/dev/*` demo pages | closed: 404 unless `DEMO_ROUTES=1`, which production does not set | `dev/components/page.tsx:7`; prod `GET /dev/components` -> 404 |

### Cookies and the organiser token

- Poll id: 60 random bits (`create-poll-action.ts:26`). At a million live polls a guess hits one in 2^40 tries; a hit gives what the link gives, nothing more.
- Tokens: 32 random bytes, stored as SHA-256, compared by hash (`token-cookie.ts`); guessing one is out of reach.
- Participant cookie named by the poll id, organiser cookie `<id>-org`, both `HttpOnly`, `SameSite=Lax`, path `/`, one year, `Secure` on a request that arrived over https (finding 3).
- The organiser token reaches only the page of a device that already holds it (decision `organiser-token-payload`), and that page is dynamic (`ƒ /e/[id]` in the build's route table), which Next answers with `cache-control: private, no-cache, no-store` (prod `GET /e/abcdefghij`, the same route's gone page), so no shared cache keeps it.
- `Referer`: the organiser link never renders a page; it redirects to `/e/<id>` before anything loads, so no request carries the token as a referrer. `Referrer-Policy: same-origin` now also keeps the poll id off other sites.

### Abuse without an account

| Attempt | Verdict | Evidence |
| --- | --- | --- |
| Guess poll ids or organiser tokens | closed | see "Cookies" |
| Take over another person's name | accepted | finding 5 |
| Flood answers or polls | accepted, owner's edge | finding 4 |
| Oversize input | closed | zod limits per field; 1 MB action body limit |
| SQL through Drizzle | closed: every query is the query builder with bound values; the one `sql` template holds a column reference and a bound date | `create-poll-action.ts:35` |
| XSS through titles and names: page | closed: React escapes text; the only `dangerouslySetInnerHTML` is the landing's JSON-LD built from constants, with `<` escaped | `web-application-json-ld.tsx:7` |
| XSS: Open Graph image | closed: Satori renders text into a PNG | `link-preview-image.tsx:50` |
| XSS and header injection: `.ics` | fixed | finding 1 |
| Open redirect on the organiser route | closed | see "Route handlers" |
| Clickjacking the organiser's buttons | fixed | finding 2 |

### Headers

Every response now carries `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: same-origin` and `X-Content-Type-Options: nosniff`, and no `x-powered-by` (`next.config.ts`; `e2e/security-headers.spec.ts` checks the create page, a poll page, the read endpoint, the `.ics` and the organiser link). HSTS and a script-src CSP stay out (findings 7 and 8).

### Dependencies and the image

- `npm audit --omit=dev`: `found 0 vulnerabilities`, exit 0 (2026-09-28, `package-lock.json` at `ad30473`).
- No secret is baked in: the app reads only `DATABASE_PATH`, `SITE_URL` and `DEMO_ROUTES`, none secret; `.dockerignore` drops `.env*`, and `.next/standalone` holds no `.env` file.
- Root user: accepted, finding 9.
