# Optional Umami integration

Set these public values before `npm run build`. Next.js embeds NEXT_PUBLIC values in the browser bundle. Setting them only when starting an existing image does not enable tracking.

```dotenv
NEXT_PUBLIC_UMAMI_SCRIPT_URL=<owner's HTTPS script URL>
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<website UUID from Umami>
```

Both values are required. Leave them unset to send no analytics requests. Invalid URLs, credentials, queries, fragments, non-HTTPS URLs and invalid UUIDs disable tracking. Use a separate origin, not a same-origin proxy. The server must serve the script with CORS allowing anonymous cross-origin loading, and accept the tracker requests at its collection endpoint, normally `/api/send`. The verified official tracker is Umami v3.4.0; verify script changes against the privacy tests before upgrading.

## Source and campaign reporting

The default approved launch values are utm_source=linkedin, utm_medium=social and utm_campaign=launch. The launch link is `https://wpasuj.pl/?utm_source=linkedin&utm_medium=social&utm_campaign=launch`. No external referrer host is approved by default. NEXT_PUBLIC_UMAMI_ATTRIBUTION overrides each supplied list, leaving other defaults intact, for example:

```json
{
  "utm_source": ["newsletter"],
  "utm_medium": ["email"],
  "utm_campaign": ["launch"],
  "referrerHosts": ["google.com", "www.google.com"]
}
```

The other supported campaign keys are utm_content and utm_term. Labels must be lowercase letters, digits, underscores or hyphens, start with a letter or digit, and contain at most 64 characters. Use public campaign labels only, never a person's name, poll ID or token. Hostnames must be exact, without scheme, path or port. An empty list disables that key, so `{"utm_source":[],"utm_medium":[],"utm_campaign":[]}` disables the default launch attribution. Invalid attribution JSON disables the entire integration. A configured host becomes `https://host/`; all raw referrer paths and queries disappear. Internal referrers never leave the browser. On same-document navigation, including poll-to-public navigation, public pageviews retain the approved original document referrer as a sanitized hostname. This reports original acquisition, not the previous internal page. No attribution is persisted across documents or visitors.

## Funnel observations

Every event has website, a fixed url label and name. Poll events use `/e/[id]`, never the real poll address. Landing events use `/` and include a data object only when the current landing query contains approved UTM values. No other event properties are sent. Public pageviews carry approved UTM keys in the sanitized URL and an approved external source hostname as referrer.

| Event                    | Observation                                                     |
| ------------------------ | --------------------------------------------------------------- |
| create_started           | First input or click in the create form per visit               |
| create_submitted         | Submission attempt, including invalid input                     |
| create_validation_failed | Client validation failure or the action's invalid refusal       |
| poll_created             | Successful creation acknowledged by the server                  |
| invite_share_clicked     | Invitation or reminder share click, not a delivered message     |
| invite_copied            | Clipboard accepted an invitation, reminder or public poll link  |
| poll_entered             | Explicit entry to a poll page, not an automatic pageview        |
| availability_started     | First availability interaction per visit                        |
| answer_first_saved       | The save transaction inserted an answer                         |
| answer_changed_saved     | The save transaction changed an existing answer's name or hours |
| answer_save_failed       | The queued save threw or ended in a refusal                     |
| results_opened           | Explicit switch from Moje to Wszyscy                            |
| time_set                 | Server acknowledged setting the final time                      |
| calendar_clicked         | Opening the calendar picker, not proof of an export             |
| settled_share_clicked    | Settled-time share click, regardless of sharing outcome         |
| own_poll_clicked         | Click on the invitation to create a personal poll               |

A visit starts when the root observes a different pathname. Rerenders, refetches and root remounts on the same pathname retain visit deduplication. Leaving and returning starts another visit, even through an untracked path. Reloading starts a new browser runtime and visit. This memory is not persisted or sent. Public pageviews, create_started, availability_started and poll_entered are at most once per visit. Other events count explicit observations.

First versus changed comes only from the actual server transaction, not the name field, cookie presence or client state. A normalized identical retry acknowledges unchanged and sends no success event. A claimed row is an existing answer; ownership transfer alone is not a first answer. A claim can merge hours in its own transaction, which is not a saveAnswer acknowledgement and is not counted as an answer save. A later save is classified against the resulting row. Railway logging remains unchanged.

In Umami, filter public pageviews by source and campaign to count launch visits. Filter create events by the approved data properties utm_source, utm_medium and utm_campaign to inspect landing interaction and creation from that link. Poll events intentionally have no campaign properties. They describe aggregate activity, not the participants acquired by an organiser's LinkedIn visit. There is no persistent campaign-to-poll linkage, participant identifier or way to join different visitors into one poll's funnel. Event totals are not unique people or delivered invitations.

## Container builds

The Dockerfile accepts these public build arguments:

```sh
docker build \
  --build-arg NEXT_PUBLIC_UMAMI_SCRIPT_URL="$NEXT_PUBLIC_UMAMI_SCRIPT_URL" \
  --build-arg NEXT_PUBLIC_UMAMI_WEBSITE_ID="$NEXT_PUBLIC_UMAMI_WEBSITE_ID" \
  --build-arg NEXT_PUBLIC_UMAMI_ATTRIBUTION="$NEXT_PUBLIC_UMAMI_ATTRIBUTION" \
  -t wpasuj .
```

The owner supplies build values in the deployment environment and rebuilds after any change. Provisioning and deployment are not part of WPA-130. See [ADR 0044](adr/0044-privacy-limited-umami.md) for payload restrictions and [operations](operations.md) for the unchanged Railway logs.

## Validate without production events

Intercept the script and every collector request in a browser test. Never point an unintercepted test at the production collector. Verify public visits, a successful create, failed creates, poll and organiser routes, blocked script and blocked collector, and a build with no configuration. Inspect body and headers, including URL, referrer, cookies and authorization. The script must have data-auto-track=false; do not paste the standard automatic snippet alongside this integration.

The events above are browser observations, not authoritative counts. No queued replay or retries occur, so blockers, Do Not Track and slow script loading can undercount. The collector still receives an IP address and browser headers at the transport layer. The owner controls the Umami service, its access and retention; no retention promise is made here.
