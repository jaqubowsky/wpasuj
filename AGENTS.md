# Wpasuj

A no-account availability poll for a group of friends: one link in the group chat, everyone taps the hours they are free, the app shows the time that works for most of them. Product requirements: `spec/brief.md` (the owner's; it wins over taste and over mockups).

## Stack

- Next.js (current stable, App Router), TypeScript strict, server actions for mutations
- SQLite through Drizzle ORM and `better-sqlite3`, file at `DATABASE_PATH`, migrations in `drizzle/` applied on start
- TanStack Query for polling server state; Tailwind v4 utilities on the `@theme` in `src/app/tokens.css` (default theme reset); fonts through `next/font/local` from `src/shared/fonts/` (latin and `latin-ext`), so no build fetches them
- `output: 'standalone'`, a `Dockerfile`; production runs on Railway at https://wpasuj.pl: one service with a volume at `/data`, `SITE_URL` set on the service (ADR 0014), and `LINEAR_API_KEY` for user reports (ADR 0037; a missing key only makes "Zgłoś problem" answer with the e-mail fallback, `/api/health` does not read it)
- `GET /api/health` answers 200 once the database takes a write and `SITE_URL` is an http(s) URL, 503 when either fails (with the SQLite error code for the write); a database that cannot open still throws, a 500; `railway.json` builds the `Dockerfile` and gates each deploy on that route
- Every server error is one JSON line on stderr from `onRequestError` in `src/instrumentation.ts`: `{"level":"error","message","path","digest","routeType"}`, `path` without its query and with the organiser token as `[token]`; Railway's Log Explorer finds them with `@level:error`
- Usage events are one JSON line each on stdout through `writeLogLine` (`src/shared/log-line.ts`, which `onRequestError` also uses), written after the action's store call succeeds, with no title, name or token (ADR 0032): `{"level":"info","message":"poll_created","pollId","createdByParticipant"}` from `createPoll`, `answer_saved` (a first or changed answer) from `saveAnswer`, `time_set` from `setFinal`, `report_filed` (with the Linear `issue` identifier) from `reportProblem`, and `{"level":"error","message":"report_failed","cause","status"}` when a report cannot reach Linear (`cause` is `no-key`, `network` or `linear`; `status`, the HTTP status, only with `linear`). In Railway's Log Explorer, the phrase search `"poll_created"` counts new polls and adding `@createdByParticipant:true` counts those created from a device that had answered another poll (Railway's documented syntax: a quoted phrase searches `message`, `@<key>:<value>` any other key)

## System

```text
 organiser and participants,            group chat app
 phone or desktop browser, no account   (unfurls the poll link)
      |  pages, server actions,              |  GET /e/[id]/opengraph-image/[version]
      |  GET /api/polls/[id] every 8 s       |
      v                                      v
 +------------------------------------------------------+
 | Next.js standalone server, one Docker image          |
 | one Railway service at https://wpasuj.pl             |
 +------------------------------------------------------+
      |  better-sqlite3, migrations on start
      v
 SQLite file /data/wpasuj.db on the Railway volume
```

- The organiser creates a poll at `/` and keeps an organiser cookie for it; `/e/[id]/organizator/[token]` grants that cookie on another device. Participants answer at `/e/[id]` under a per-poll cookie; the organiser sets the final time there, exported at `/e/[id]/termin.ics`
- Mutations are server actions; the only client-side server state is the results query (TanStack Query in `view-results`), refetched every 8 s from `/api/polls/[id]`
- One process owns the database file and deletes expired polls from it on start and every 24 h (ADR 0039), so nothing may assume a serverless or edge runtime

## Scripts

Declared in `package.json` by WPA-10; a change passes all of them:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run knip` (unused files, exports and dependencies; config in `knip.json`)
- `npm run duplicates` (jscpd over `src/` without tests; fails on a clone missing from `.jscpd-baseline.json`)
- `npm test` (Vitest, units, components and actions)
- `npm run build`
- `npm run e2e` (Playwright: phone 390 in Chromium and WebKit, desktop 1440 in Chromium)

CI (`.github/workflows/ci.yml`, skipped when a change touches only `*.md`): `quick` runs lint, typecheck, knip and test; `build` uploads the standalone build; an `e2e` matrix runs each Playwright project in its own job on that build and uploads `screenshots-<project>` and `memory-<project>` (memory sampled every 5 s); `perf` reuses the build; `docker` builds and runs the image, answers a poll against it, restarts it and reads the answer back from the volume, and fetches the poll's card.

Two more workflows run on every pull request, Markdown-only ones included. `codeql.yml` (also weekly on `main`) analyses `javascript-typescript` and `actions` with the `security-extended` suite, uploads the results to code scanning, and fails its job on any open high or critical alert on the pull request's ref: the host's wait reads workflow runs, not the CodeQL check run code scanning adds. A false positive is dismissed in the Security tab with a reason, which clears it on every branch. `gitleaks.yml` scans the pull request's commits (`base..head`) with gitleaks from a Docker image pinned by digest. Secret scanning and push protection are repository settings the owner keeps on.

`quick` starts with `actionlint` (syntax, expressions, shellcheck of `run:`) and `zizmor` (template injection, `permissions`, unpinned `uses:`, Dependabot cooldown) over `.github/`, each from a Docker image pinned by digest, and fails on any finding; locally, the same `docker run` lines from `ci.yml`, with `--offline` for zizmor without a GitHub token. Actions are pinned to a commit SHA with a `# vX.Y.Z` comment that Dependabot updates; the actionlint, zizmor and gitleaks images are bumped by hand.

Dependabot (`.github/dependabot.yml`) opens one grouped pull request a week per ecosystem, npm and GitHub Actions, with the minor and patch updates; majors, `@types/node` majors excepted (ignored, the runtime stays on Node 24), and every pre-1.0 package come as their own pull requests so their changelog is read first, and a new `0.x` dependency joins the group's `exclude-patterns`. Every version update, majors included, waits until its release is 7 days old (`cooldown`). CI on that pull request is the merge check. Security updates come as soon as GitHub has them, once the repository setting is on.

Hooks (husky, installed by `npm ci`): pre-commit runs `prettier --write` (Tailwind class order through its plugin; config in `.prettierrc.json`, whole repository with `npm run format`) and then `eslint --fix` (blank lines between statements come from `@stylistic/padding-line-between-statements`, which `npm run lint` also checks in CI; it runs second because Prettier's line wrapping can create statements that need one) on staged files through `lint-staged`, fixing them in place; pre-push runs `typecheck`, `knip`, `duplicates` and `test`. Prettier and jscpd run only in hooks, never in CI. A clone copied on purpose (domain code between modules) goes into the baseline with `npm run duplicates -- --update-baseline`; technical code is shared instead. `e2e` runs in CI only.

## Testing

- Red, then green: every behaviour starts as a failing test that is run and seen failing for the right reason. Rules are in `spec/brief.md`, "Code rules"
- Units and components sit beside the code they test as `*.test.ts(x)`; run one with `npx vitest run <path>`
- Action tests use a real SQLite file per test with `cookies()` stubbed; only the clock, cookies and true externals are stubbed
- End to end in `e2e/`; run one with `npx playwright test <path>`
- Screenshots: each pull request that adds or changes a screen or state saves it at 390 and 1440 through Playwright into `e2e/screenshots/` (not committed), uploaded by CI as one `screenshots-<project>` artifact per Playwright project. The pull request body lists each screen and the mockup (`spec/design/v2/`) or design-system parts (`spec/design/system/`) it was compared with

## Module layout

Each module in `src/modules/` has `domain/` (pure functions and tests, no imports from React, `server/` or `ui/`), `server/` (schemas, queries, actions, the only I/O) and `ui/` (components, hooks), with `index.ts` (server) and, when it has client code, `client.ts` (client) as the only public entries. ESLint `no-restricted-imports` enforces the direction. Rule source: `spec/brief.md`, "Code rules".

- A server action reads parse, guard, store, result: `parse(schema, input)` and each guard (`organisersPoll`, `livePoll`, `openPoll`) return a `Result` from `src/shared/result.ts`, and the action goes on with `if (!found.ok) return found;` per step, ending in `ok(…)` or `fail("<reason>")`. A reason is a string literal; the UI maps it in a `switch` whose `default` returns the value `satisfies never`, so a new reason fails `typecheck` there
- One `<name>-store.ts` per module that reads the database holds every `getDb()` call and every `drizzle-orm` import, the module's live-poll lookup included where it has one (a copy per module, no shared repository). ESLint `no-restricted-imports` refuses `drizzle-orm` and `@/shared/db/client` everywhere else except `src/shared/db/`, `src/shared/testing/`, tests and `src/app/api/health/`
- No tool checks most of "Code rules", among them no business rule in an action, a component or `src/shared`, UI logic in hooks and no helper with one caller. Hold them yourself; ADR 0017 lists what is gated and what only review holds

## Styling

Tailwind v4 utilities written inline in `className`; `src/app/` is the reference (`app-header.tsx`, `e/[id]/not-found.tsx`).

- `src/app/tokens.css` is the `@theme static` with the default theme reset: a small scale, not one token per place of use. It holds the only colours, radii, shadows, fonts, weights, breakpoint (`lg:` = 1024px), easings and durations, plus:
  - type: `text-xs` … `text-9xl`, each with its paired line height (the table in `spec/brief.md`, "Type"). A desktop size is a responsive variant (`text-3xl lg:text-4xl`); `leading-none` (static in Tailwind) and a spacing step (`leading-3.5` is 14px) are the only other line heights
  - spacing: one `--spacing: 4px`, so every spacing and size utility is a multiple of 4px: `p-7` is 28px, `h-13` is 52px, `gap-1.5` is 6px, `m-0` works. Any half step (`1.5`, `8.5`) is a 2px offset; a value off both rounds to the nearest 4px
  - tracking: `tracking-tight` (−0.01em), `tracking-tighter` (−0.02em), `tracking-tightest` (−0.03em)
  - container widths: `max-w-narrow` (720px), `max-w-wide` (1280px), and `@grid-fit:` / `@max-grid-fit:` (600px) for the day-hour grid's container query
- `npm run lint` refuses any bracketed size, spacing, type or tracking (`mt-[6px]`, `text-[15px]`, `[font-size:84px]`) through `shadcn/no-arbitrary-values`; its `allow` list in `eslint.config.mjs` names the brackets that stay (radii, shadows and motion, which are out of the scale; grid templates; a few composite values built from `--spacing()`), and a new one goes there only on a host decision. Selector brackets (`data-[…]:`, `has-[…]:`, `@min-[600px]:`) are variants, not values, and stay free
- Colours come only from tokens: `shadcn/no-raw-colors` and `no-arbitrary-values` reject `bg-[#f00]`, `bg-[red]` and palette classes; a colour inside a shadow is `var(--color-…)`, and `better-tailwindcss/no-restricted-classes` refuses a raw one
- `better-tailwindcss/no-unknown-classes` fails anything the theme cannot generate (`text-8xl`, `md:`, a removed token). It does not see a `(--name)` shorthand whose variable is gone, so grep `tokens.css` before writing one
- No inline `style` except CSS custom properties (`style={{ "--date-count": n }}` read by `grid-cols-[repeat(var(--date-count),…)]`); the link-preview card, the landing card and the apple icon are exempt because Satori reads only inline styles
- Shared components in `src/shared/ui/` own their look: `shadcn/no-restyle` rejects `className` on them
- Class lists combine through `cn()` from `@/shared/ui/cn` (`clsx` plus `tailwind-merge` taught the theme's names); lint rejects a template string, `+` or `.join()` in `className`
- A length the scale has no step for is a design question for the host, not a bracket
- Durations have no Tailwind namespace: `duration-(--duration-fill)`. A press scale is `motion-safe:active:scale-97`, and lint rejects a `scale-` class without `motion-safe:`: `scale-*` sets the `scale` property, which the reduced-motion rule in `globals.css` (`transform: none`) does not reach
- No preflight is loaded, so browser defaults (heading margins, `box-sizing: content-box`) hold; add `m-0` or `box-border` where the box would change, and drop a declaration the element already inherits (`font-family` from `body`)
- Utilities are unlayered, so against a plain `<name>.css` rule they win or lose by specificity
- A look reused across product screens is a component (`PageFrame`), never an exported class string; the `dev/` demo pages keep their own copy
- CSS that `className` cannot carry (rules on DOM another module renders, `:has()` layouts, `@keyframes` the ticket keeps out of the theme) goes in a plain `<name>.css` beside its component, selected by `data-*` attributes, tokens through `var(--color-…)` and `calc(var(--spacing) * n)`: `shared/ui/sheet/sheet.css`. Plain CSS is global, so every attribute and keyframe name there carries the owner's prefix (`data-sheet`, `sheet-up`); a state on the component's own DOM is a `data-[…]:` utility instead
- Token names inside `var()`: `--color-<name>`, `--spacing` (a step is `calc(var(--spacing) * n)` in plain CSS, `--spacing(n)` inside a Tailwind bracket), `--text-<step>` with `--text-<step>--line-height`, `--tracking-*`, `--container-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--duration-*`, `--font-sans`, `--font-display`

## Work

- Work lives in the Linear team the project overlay names: one issue per ticket, one pull request per issue against `main`. The host plans there and decides what the brief leaves open
- A decision a later change could undo unknowingly is an ADR in `docs/adr/` (`NNNN-<slug>.md`, the next number, the format of the ADRs there), proposed in the pull request that needs it; a decision that shapes only one issue's work goes into that issue
- Done means a pull request with CI green for the host to merge; containers never merge
- CodeRabbit is advisory, never a gate: its free plan is rate-limited, it skips Dependabot's pull requests and reviews a later push only on `@coderabbitai review`. When its review arrives before `ready-for-host`, a container answers each comment with a fix or a reply giving the reason; it never waits for one
