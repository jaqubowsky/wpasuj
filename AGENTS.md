# Wpasuj

A no-account availability poll for a group of friends: one link in the group chat, everyone taps the hours they are free, the app shows the time that works for most of them. Product requirements: `spec/brief.md` (the owner's; it wins over taste and over mockups).

## Stack

- Next.js (current stable, App Router), TypeScript strict, server actions for mutations
- SQLite through Drizzle ORM and `better-sqlite3`, file at `DATABASE_PATH`, migrations in `drizzle/` applied on start
- TanStack Query for polling server state; CSS Modules on `src/app/tokens.css`; fonts through `next/font` (`latin-ext`)
- `output: 'standalone'`, a `Dockerfile`; production is one Railway service with a volume at `/data` (not deployed in this phase)

## Scripts

Declared in `package.json` by ticket 01; a change passes all of them:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test` (Vitest, units, components and actions)
- `npm run build`
- `npm run e2e` (Playwright: phone 390 in Chromium and WebKit, desktop 1440 in Chromium)

## Testing

- Red, then green: every behaviour starts as a failing test that is run and seen failing for the right reason. Rules are in `spec/brief.md`, "Code rules"
- Units and components sit beside the code they test as `*.test.ts(x)`; run one with `npx vitest run <path>`
- Action tests use a real SQLite file per test with `cookies()` stubbed; only the clock, cookies and true externals are stubbed
- End to end in `e2e/`; run one with `npx playwright test <path>`
- Screenshots: each pull request that adds or changes a screen or state saves it at 390 and 1440 through Playwright into `e2e/screenshots/` (not committed), uploaded by CI as the `screenshots` artifact. The pull request body lists each screen and the mockup (`spec/design/v2/`) or design-system parts (`spec/design/system/`) it was compared with

## Tickets

A ticket is a file in `spec/tickets/`, in the shape of `spec/ticket.md`. It is claimed by setting `Status: claimed` before any work, and closed once its work is committed: every acceptance criterion ticked beside its evidence, `Status: done`.

## Work

- Work comes from `spec/board.md`; the host plans in `spec/` and decides what the brief leaves open, listed in `spec/decisions.md`
- One ticket per container, one pull request per ticket against `main`
- Done means a pull request with CI green for the host to merge; containers never merge
- The host merges only after its acceptance finds no open point: each ticked criterion checked against one piece of evidence, the changed files against Scope, the brief sections named in Parent, the last commit's screenshots against `spec/design/v2`, and an independent review of the diff against the brief. It writes the result to `acceptance.md` in the task directory; a pull request sent back closes every open point listed there
