# ADR 0044: Optional privacy-limited Umami

- **Status:** Proposed
- **Date:** 2026-10-03
- **Owner:** owner, WPA-130
- **Amends:** ADR 0032, external analytics restriction only

## Context

The owner requested self-hosted Umami on Railway and authorized public pageviews and the bounded product funnel as an exception to the brief's analytics restriction. Railway usage events remain unchanged. Umami's default pageviews and named events include URL, title and referrer. These can expose poll IDs and organiser tokens even without custom event properties.

## Decision

- Use the official browser script, no SDK dependency. Require an HTTPS script on a separate origin and a website UUID. NEXT_PUBLIC_UMAMI_SCRIPT_URL and NEXT_PUBLIC_UMAMI_WEBSITE_ID are build-time public values. Missing or invalid configuration disables the integration
- Disable all automatic tracker initialization with data-auto-track=false. Do not enable click, performance, identity or session-data tracking. Respect Do Not Track
- Send object payloads, never a default pageview, named-event shorthand or a spread of default properties. Pageviews include only website, an allowlisted public path and optional approved attribution. Events use fixed route labels / or /e/[id]. Landing events may include only approved UTM labels as data. No poll data or tracker defaults are supplied. Successful creation, answer saving and final-time setting require an action acknowledgement
- Public paths are /, /regulamin, /polityka-prywatnosci and the WPA-118 guide /jak-ustalic-termin. Poll entry is the explicit poll_entered event on /e/[id], never an automatic pageview. Organiser-token, development and unknown paths are not tracked
- Approved events are create_started, create_submitted, create_validation_failed, poll_created, invite_share_clicked, invite_copied, poll_entered, availability_started, answer_first_saved, answer_changed_saved, answer_save_failed, results_opened, time_set, calendar_clicked, settled_share_clicked and own_poll_clicked. Share and calendar clicks describe clicks, not delivery or export
- First versus changed answers comes from the actual save transaction. Unchanged retries emit no success. Claimed rows remain existing answers; a claim's merge is not a saveAnswer acknowledgement and is not counted as an answer save. No database schema or persistent identity is added
- Public pageviews, create_started, availability_started and poll_entered are once per pathname visit in browser memory. Remounts, rerenders and refetches on the same pathname do not reset it; a pathname transition or reload starts a new visit. No memory survives a reload
- Default approved UTM values are linkedin, social and launch for source, medium and campaign. NEXT_PUBLIC_UMAMI_ATTRIBUTION overrides supplied lists and optionally lists approved values for the five standard UTM keys and approved referrer hostnames. The owner must use non-personal campaign labels. Unapproved values, other query keys, fragments, raw referrers, referrer credentials, paths, ports and queries are omitted. Internal referrers are omitted. Approved external hosts become https://host/ for source reporting
- During same-document navigation, including poll-to-public navigation, retain the approved original document referrer as a sanitized external hostname on public pageviews. This records original acquisition, not the preceding internal page. Never send raw paths, queries, internal referrers or poll identifiers; do not persist attribution across documents or visitors
- The script request has no referrer and uses anonymous cross-origin loading. The collector uses the official tracker's credentials=omit default. The app's existing same-origin Referrer-Policy prevents HTTP referrers on cross-origin collection. Same-origin analytics is not supported
- Requests remain optional and fire-and-forget. No buffer, retry or wait blocks creation. Loading failures, synchronous API errors and rejected tracking promises do not prevent navigation
- Analytics are separate from Railway logs and database records. No poll ID, token, cookie, name, title or answer is supplied. The collector still receives transport IP and User-Agent and can derive anonymous sessions using upstream behavior. Do not promise a deployment location or retention period that has not been configured

## Consequences

Approved source and campaign reporting remains available without accepting arbitrary query text. The approved LinkedIn launch works without attribution configuration; other labels and source hosts require explicit approval. Poll events have no campaign properties, so activity from separate visitors cannot be attributed to the organiser's campaign or joined into a per-poll funnel. Blockers, Do Not Track and slow script loading can undercount, including successful creates. Changing configuration requires a rebuild, including when using Docker build arguments. The owner must review this proposal and the intercepted browser evidence before deployment.

## Sources

- WPA-130: https://linear.app/wpasuj/issue/WPA-130
- https://umami.is/docs/tracker-configuration
- https://umami.is/docs/tracker-functions
- Official source v3.4.0: https://github.com/umami-software/umami/blob/ec0ff50388c264ed8ce46f00967e92f7e71476ae/src/tracker/index.ts
- Official collector: https://github.com/umami-software/umami/blob/ec0ff50388c264ed8ce46f00967e92f7e71476ae/src/app/api/send/route.ts
