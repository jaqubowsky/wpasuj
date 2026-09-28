# Architecture audit

WPA-6, base `ad30473` (main after WPA-47), 2026-09-28. Every finding names the rule it breaks, where, and how it ends: fixed in a commit of this branch, a ticket, or kept with the decision that keeps it. Security is WPA-5's and is not judged here.

Rules: `spec/brief.md` "Code rules" and "Stack (decided)", `AGENTS.md` "Module layout" and "Styling", `spec/decisions.md`.

## Summary

| Area | Result |
| --- | --- |
| Module boundaries and layers | clean; five patterns kept by decision `architecture-kept-patterns` |
| One source per concept | three fixed (date formatting, card heat colours, product name), one issue (WPA-32), the rest deliberate copies with their source |
| Dead code and dependencies | none: `knip` exits 0 with and without `--include-entry-exports` |
| Client versus server | the poll page shipped full `zod` with every locale: fixed, client modules 791 KB to 451 KB |
| Tests | behaviour-level, real SQLite per action test; the brief's single journey is WPA-8 |

## 1. Module boundaries and layers

| # | Check | Evidence | Result |
| --- | --- | --- | --- |
| B1 | A module imports no other module; `app` only through `index.ts`/`client.ts`; `shared` below both | `npm run lint` exit 0 with the rules at `eslint.config.mjs:12-29,98-114`; `grep -rn 'from "@/modules' src/shared` and `grep -rn '@/modules/[a-z-]*/\(domain\|server\|ui\)' src/app` print nothing | clean |
| B2 | `domain/` pure: no React, `next/*`, I/O, env, randomness, clock | `grep -rnE 'Date\.now\(\)\|new Date\(\)\|Math\.random\|process\.env\|from "react\|from "next' src/modules/*/domain --include=*.ts` (tests excluded) prints nothing; every `new Date(…)` there takes an argument | clean |
| B3 | `server/` the only I/O | the one I/O outside `server/` is `view-results/ui/use-results.ts:29`, the client polling the read endpoint, which the brief's Stack places in the client (TanStack Query) | clean |
| B4 | Type-only `domain` to `server` imports (WPA-22) | four: `answer-poll/domain/answer-rules.ts:2`, `create-poll/domain/hour-range.ts:3`, `view-results/domain/best-time.ts:1`, `view-results/domain/set-time.ts:1`. Moving a schema into `domain/` puts zod's runtime into the pure layer; the imports erase at build | kept, decision `domain-type-imports` |
| B5 | `index.ts` starts with `import 'server-only'`; public entries no wider than their consumers | line 1 of all four `index.ts`; every export of every `index.ts` and `client.ts` has a consumer in `src/app` (`npm run knip` and `knip --include-entry-exports`, `logs/audit/knip*.log` of the task) | clean |
| B6 | `index.ts`/`client.ts` the only entries: `ui/` reaches `../server/` inside its own module | `create-poll/ui/use-create-poll.ts:6-7`, `answer-poll/ui/use-answer.ts:4-5`, `view-results/ui/use-results.ts:3`: a client component needs the action's own reference, and the schema it parses | kept, decision `architecture-kept-patterns` |
| B7 | UI logic in hooks, not component bodies | the only candidates are pure calls: `bestTimes` in `view-results/ui/organiser-card.tsx:58`, `best-now.tsx:27-28`, `results-body.tsx:32`; `useState` in `ui/*.tsx` holds open/closed state, the typed title (`create-poll/ui/create-poll-form.tsx:16`, the Stack keeps typed text in component state) and the query client (`view-results/ui/results-provider.tsx:27`) | kept, decision `architecture-kept-patterns` |
| B8 | Actions thin: parse, call domain, persist, return a reason | `create-poll/server/create-poll-action.ts`, `organiser-actions.ts`, `answer-poll/server/answer-actions.ts`: every branch reads a domain function (`hasPastDate`, `isExpired`, `fitsPoll`, `refusalOf`, `takesOrganiserName`) | clean |
| B9 | Deletable modules | follows from B1: only `src/app` pages and routes import a module, through its entries | clean |

## 2. One source per concept

| # | Rule | Evidence | Result |
| --- | --- | --- | --- |
| S1 | Tokens only in `tokens.css` | Satori reads no CSS variables, so the card colours live once in `src/shared/og-card.ts:6-12` (values equal `tokens.css`); the landing card retyped the five heat colours at `landing/server/landing-card-image.tsx:6` | fixed in 3e16a9e (`heat` in `og-card.ts`) |
| S2 | Share technical code: date formatting | `landing/domain/time-label.ts:5-16` and `view-results/domain/time-label.ts:6-17` each built the long weekday and day-month formatters that `shared/dates/format.ts:4,6` already held | fixed in 224def7 (`longWeekday`, `dayAndMonth`, `dayAndMonthLong` in `shared/dates/format.ts`) |
| S3 | Product name in one constant | "Wpasuj" typed in `landing/ui/faq/faq.tsx:8` and `landing/ui/story/story-steps.ts:62` | fixed in d3de12d. `wpasuj.pl` in the story mock (`landing/ui/story/scenes/shared-link.tsx:39`) is decision `production-domain` |
| S4 | Copy strings next to the component that shows them | "Wiadomość skopiowana. Wklej ją na grupę." and "Nie udało się skopiować. Spróbuj jeszcze raz." in `view-results/ui/organiser-card.tsx:13,16` and `set-time.tsx:9-10`: each component shows its own; "Kiedy możesz?" is a grid label (`answer-poll/ui/answer-body.tsx:32`) and card text (`view-results/server/link-preview-image.tsx:68`) | kept: the rule places copy by component |
| S5 | Share technical code: the organiser cookie name | `` `${poll.id}-org` `` typed in `answer-poll/server/answer-queries.ts:18` beside `organiserCookie` in `create-poll/server/organiser-access.ts:8` | WPA-32 (cookie code is WPA-5's) |
| S6 | Copy domain code | `isExpired` and its 60 days in `create-poll/domain/poll-rules.ts:4,24` and `answer-poll/domain/answer-rules.ts:7,9`, equal today; `finalTimeSchema` in `create-poll/server/organiser-actions.ts:14` (what is written, with `lastHour > firstHour`) and `view-results/server/results-schema.ts:5` (what is read) | kept, decision `architecture-kept-patterns` and the brief's copy rule |
| S7 | The landing's copy of best time | `landing/domain/best-time.ts` against `view-results/domain/best-time.ts` and `heat.ts`: same bodies, no drift | kept, WPA-30 |
| S8 | Types from schemas and tables | `view-results/domain/link-preview.ts:4` `PreviewedPoll` names the five fields the card needs, in the module's words | kept, decision `architecture-kept-patterns` |
| S9 | Routes | `/e/${id}` in `create-poll/ui/use-create-poll.ts:40`, `view-results/ui/set-time.tsx:34`, `use-send-set-time.ts:10`, `use-invite-card.ts:15,48`, `use-organiser-card.ts:12`, `app/e/[id]/organizator/[token]/route.ts:7`: the route folder `app/e/[id]` is the source, a helper in `shared` would tie modules to the app's folders | kept |

## 3. Dead code and dependencies

- `npm run knip`: exit 0, no unused file, export, type or dependency
- `KNIP_DISABLE_RAW_TRANSFER=1 npx knip --include-entry-exports`: exit 0, so every export of the public entries has a consumer
- `ts-prune` not run: knip covers the same question and is the repo's gate

## 4. Client versus server

- 25 files carry `"use client"`; each holds state, a handler, context or a browser API (`grep -rln '"use client"' src`). Pages and layouts are server components; the client boundaries are leaves, not a whole page
- `/dev/*` build into the output and answer 404 unless `DEMO_ROUTES=1` (`app/dev/components/page.tsx:7`)
- The story and the demo load through `next/dynamic` near the viewport (`landing/ui/lazy-sections.tsx:14-21`, decision `landing-story-pin`)
- Client modules per route, from `next experimental-analyze` (compressed estimate, the route's whole client graph):

| Route | Before (`ad30473`) | After | What moved |
| --- | --- | --- | --- |
| `/` | 392 KB, 250 modules | 375 KB, 248 modules | `zod/mini` for the create form's inline validation stays; its share of `zod/v4/core` falls from 78 KB to 61 KB once no route pulls the classic API |
| `/e/[id]` | 791 KB, 352 modules | 451 KB, 275 modules | full `zod/v4` 402 KB with 222 KB of locales, pulled in by `view-results/server/results-schema.ts:1` and parsed on the client in `ui/use-results.ts:32`; the schema now uses `zod/mini` as `create-poll/server/poll-schema.ts` does, the same checks, fixed in 5b01af7; `zod` there is now 64 KB (`analyze-*-after.png` in the task logs) |

## 5. Tests

- Action tests run on a real SQLite file per test: `src/shared/testing/test-database.ts` (temp dir, migrations, removed after the test), used by all four action test files
- Stubs: `next/headers` cookies, `server-only`, `navigator.share` and the clipboard, `fetch`, the router, `Intl` time zone, jsdom gaps (`matchMedia`, `IntersectionObserver`), and `ViewTransition` in `vitest.setup.ts`. No domain function is mocked
- UI tests stub a server action at its import: `answer-poll/ui/answer-provider.test.tsx:9`, `use-answer.test.tsx:6`, `create-poll/ui/create-poll-form.test.tsx:11`. Kept, decision `architecture-kept-patterns`
- No snapshot, no class-name assertion, no call count of our own code outside that action seam
- Against the brief's Acceptance: runs, best time (including a free set that changes at the same count, `view-results/domain/best-time.test.ts:28`), buckets, date presets, ranges and name rules have unit tests; every failure reason of `saveAnswer`, `claimName`, `setFinal`, `clearFinal`, `deletePoll` and `createPoll` has an action test; the Open Graph card, the takeover and the organiser link have e2e tests. Gap: no single journey through create, three browser contexts, remind, set and `.ics` (e2e seeds the poll, `e2e/organiser.spec.ts:12-18`): WPA-8

## 6. Deleting a poll deletes its answers

Both ways a poll leaves the database delete its `polls` row: the organiser's "Usuń ankietę" (`src/modules/create-poll/server/organiser-actions.ts:56`) and the cleanup of polls 60 days past their last date inside `createPoll` (`src/modules/create-poll/server/create-poll-action.ts:34`). Its answers go with it through the schema:

- `participants.poll_id` references `polls.id` `ON DELETE cascade` and `slots.participant_id` references `participants.id` `ON DELETE cascade` (`src/shared/db/schema.ts:25,43`, `drizzle/0000_init.sql:9,35`)
- SQLite enforces foreign keys only per connection with the pragma on; the one connection opens with `foreign_keys = ON` (`src/shared/db/client.ts:10`)
- Test: `src/shared/db/client.test.ts` "deletes a poll's answers with the poll" deletes one of two polls through the app's client and finds only the other poll's participant and hour left. With the pragma switched off it fails, the deleted poll's participant still there; with it on it passes

Result: clean. The action tests do not assert it themselves: `organiser-actions.test.ts` and `create-poll-action.test.ts` are WPA-5's files, so the test sits on the database seam both paths share.

## Proof that the fixes change no behaviour

Same commands on base `ad30473` and on the branch:

- Unit tests: 444 on the base and 444 after the four fixes (commit d3de12d); 445 at the head, the one added being the cascade test of section 6
- e2e, phone and desktop Chromium: 191 passed, 31 skipped on both; phone WebKit runs in CI only
- Screenshots: every screen within 0.5% of the base except the full-page desktop shots of `/` (`create-empty`, `create-hours-start`, `create-month-open`), each about 0.7% in some runs and 0% in others on one build: the pinned story caught at a different step, the diff image holding only its caption
- `npm run lint`, `typecheck`, `knip`, `build`: exit 0 on both
