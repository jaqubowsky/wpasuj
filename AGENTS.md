# Wpasuj

A no-account availability poll for a group of friends: one link in the group chat, everyone taps the hours they are free, the app shows the time that works for most of them. Product requirements: `spec/brief.md` (the owner's; it wins over taste and over mockups).

## Stack

- Next.js (current stable, App Router), TypeScript strict, server actions for mutations
- SQLite through Drizzle ORM and `better-sqlite3`, file at `DATABASE_PATH`, migrations in `drizzle/` applied on start
- TanStack Query for polling server state; Tailwind v4 utilities on the `@theme` in `src/app/tokens.css` (default theme reset); fonts through `next/font` (`latin-ext`)
- `output: 'standalone'`, a `Dockerfile`; production is one Railway service with a volume at `/data` (not deployed in this phase)

## Scripts

Declared in `package.json` by ticket 01; a change passes all of them:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run knip` (unused files, exports and dependencies; config in `knip.json`)
- `npm test` (Vitest, units, components and actions)
- `npm run build`
- `npm run e2e` (Playwright: phone 390 in Chromium and WebKit, desktop 1440 in Chromium)

Hooks (husky, installed by `npm ci`): pre-commit runs `eslint` on staged files through `lint-staged`; pre-push runs `typecheck`, `knip` and `test`. `e2e` runs in CI only.

## Testing

- Red, then green: every behaviour starts as a failing test that is run and seen failing for the right reason. Rules are in `spec/brief.md`, "Code rules"
- Units and components sit beside the code they test as `*.test.ts(x)`; run one with `npx vitest run <path>`
- Action tests use a real SQLite file per test with `cookies()` stubbed; only the clock, cookies and true externals are stubbed
- End to end in `e2e/`; run one with `npx playwright test <path>`
- Screenshots: each pull request that adds or changes a screen or state saves it at 390 and 1440 through Playwright into `e2e/screenshots/` (not committed), uploaded by CI as the `screenshots` artifact. The pull request body lists each screen and the mockup (`spec/design/v2/`) or design-system parts (`spec/design/system/`) it was compared with

## Module layout

Each module in `src/modules/` has `domain/` (pure functions and tests, no imports from React, `server/` or `ui/`), `server/` (schemas, queries, actions, the only I/O) and `ui/` (components, hooks), with `index.ts` (server) and `client.ts` (client) as the only public entries. ESLint `no-restricted-imports` enforces the direction. Rule source: `spec/brief.md`, "Code rules".

## Styling

Tailwind v4 utilities written inline in `className`; `src/app/` is the reference (`app-header.tsx`, `page-frame.tsx`, `e/[id]/not-found.tsx`).

- `src/app/tokens.css` is the `@theme static` with the default theme reset: the only colours, spacing, type sizes, radii, shadows, fonts, weights, breakpoint (`lg:` = 1024px) and easings that exist. `better-tailwindcss/no-unknown-classes` fails `npm run lint` on anything else (`p-7`, `bg-red-500`, `md:`). It reads `className` and `cn`/`clsx` calls, and Tailwind generates classes only from `src/**/*.tsx` (`@source` in `globals.css`), so class strings stay in `className` in `.tsx` files
- Type is `text-<role>` from the brief's type table, which sets size and line height: `text-title` (`lg:text-title-desktop`), `text-best-time` (`lg:text-best-time-desktop`), `text-day`, `text-section`, `text-body`, `text-button`, `text-label`; weight and tracking stay separate utilities (`font-semibold`). Lint rejects `text-[16px]`; a size outside the table needs a new `--text-*` token, which is a host decision
- Colours come only from tokens: lint rejects a colour in brackets (`bg-[#f00]`, `text-[rgb(…)]`, `bg-[red]`)
- A length the theme has no token for (`56px`, `340px`, `720px`) is an arbitrary value copied from the CSS it replaces: `h-[56px]`, `max-w-[720px]`. Where a token exists, the token is used
- Durations have no Tailwind namespace: `duration-(--duration-fill)`. A press scale is `motion-safe:active:scale-97`, and lint rejects a `scale-` class without `motion-safe:`: `scale-*` sets the `scale` property, which the reduced-motion rule in `globals.css` (`transform: none`) does not reach
- No preflight is loaded, so browser defaults (heading margins, `box-sizing: content-box`) hold as they did under CSS Modules; add `m-0` or `box-border` where the box would change, and drop a declaration the element already inherits (`font-family` from `body`)
- Utilities are unlayered, so while CSS Modules remain they win or lose by specificity, as the old CSS did
- A look reused across product screens is a component (`PageFrame`), never an exported class string; the `dev/` demo pages keep their own copy
- CSS that `className` cannot carry (rules on DOM another module renders, `:has()` layouts, `@keyframes` the ticket keeps out of the theme) goes in a plain `<name>.css` beside its component, selected by `data-*` attributes, tokens through `var(--color-…)`/`var(--spacing-…)`: `e/[id]/poll-page.css`. Plain CSS is global, so every attribute and keyframe name there carries the owner's prefix (`data-poll-*`); a state on the component's own DOM is a `data-[…]:` utility instead
- Token names inside `var()`: `--color-<name>`, `--spacing-<n>` (also `--spacing-target`, `--spacing-cell`, `--spacing-button`), `--text-<role>` with `--text-<role>--line-height`, `--radius-*`, `--shadow-*`, `--ease-*`, `--duration-*`, `--font-sans`, `--font-display`

## Tickets

A ticket is a file in `spec/tickets/`, in the shape of `spec/ticket.md`. It is claimed by setting `Status: claimed` before any work, and closed once its work is committed: every acceptance criterion ticked beside its evidence, `Status: done`.

## Work

- Work comes from `spec/board.md`; the host plans in `spec/` and decides what the brief leaves open, listed in `spec/decisions.md`
- One ticket per container, one pull request per ticket against `main`
- Done means a pull request with CI green for the host to merge; containers never merge
- The host merges only after its acceptance finds no open point: each ticked criterion checked against one piece of evidence, the changed files against Scope, the brief sections named in Parent, the last commit's screenshots against `spec/design/v2`, and an independent review of the diff against the brief. It writes the result to `acceptance.md` in the task directory; a pull request sent back closes every open point listed there
