# Wpasuj

A no-account availability poll for a group of friends: one link in the group chat, everyone taps the hours they are free, the app shows the time that works for most of them. Product requirements: `spec/brief.md` (the owner's; it wins over taste and over mockups).

## Stack

- Next.js (current stable, App Router), TypeScript strict, server actions for mutations
- SQLite through Drizzle ORM and `better-sqlite3`, file at `DATABASE_PATH`, migrations in `drizzle/` applied on start
- TanStack Query for polling server state; Tailwind v4 utilities on the `@theme` in `src/app/tokens.css` (default theme reset); fonts through `next/font/local` from `src/shared/fonts/` (latin and `latin-ext`), so no build fetches them
- `output: 'standalone'`, a `Dockerfile`; production is one Railway service with a volume at `/data` (not deployed in this phase)
- `GET /api/health` answers 200 once the database opens; `railway.json` builds the `Dockerfile` and gates each deploy on that route

## Scripts

Declared in `package.json` by ticket 01; a change passes all of them:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run knip` (unused files, exports and dependencies; config in `knip.json`)
- `npm test` (Vitest, units, components and actions)
- `npm run build`
- `npm run e2e` (Playwright: phone 390 in Chromium and WebKit, desktop 1440 in Chromium)

Hooks (husky, installed by `npm ci`): pre-commit runs `eslint` on staged files through `lint-staged`; pre-push runs `typecheck`, `knip` and `test`. `e2e` runs in CI only. In a fleet container npm runs with `ignore-scripts`, so run `npx husky` once after install (decision 52).

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

- `src/app/tokens.css` is the `@theme static` with the default theme reset: a small scale, not one token per place of use. It holds the only colours, radii, shadows, fonts, weights, breakpoint (`lg:` = 1024px), easings and durations, plus:
  - type: `text-xs` … `text-7xl`, each with its paired line height (the table in `spec/brief.md`, "Type"). A desktop size is a responsive variant (`text-3xl lg:text-4xl`); `leading-none` is the one extra line height
  - spacing: one `--spacing: 4px`, so every spacing and size utility is a multiple of 4px: `p-7` is 28px, `h-13` is 52px, `gap-1.5` is 6px, `m-0` works. Half steps (`0.5`, `1.5` … `4.5`) exist for 2px offsets; a value off both rounds to the nearest 4px
  - tracking: `tracking-tight` (−0.01em), `tracking-tighter` (−0.02em), `tracking-tightest` (−0.03em)
  - container widths: `max-w-narrow` (720px), `max-w-wide` (1280px), and `@grid-fit:` / `@max-grid-fit:` (600px) for the day-hour grid's container query
- `npm run lint` refuses any bracketed size, spacing, type or tracking (`mt-[6px]`, `text-[15px]`, `[font-size:84px]`) through `shadcn/no-arbitrary-values`; its `allow` list in `eslint.config.mjs` names the brackets that stay (radii, shadows and motion, which are out of the scale; grid templates; a few composite values built from `--spacing()`), and a new one goes there only on a host decision. Selector brackets (`data-[…]:`, `has-[…]:`, `@min-[600px]:`) are variants, not values, and stay free
- Colours come only from tokens: `shadcn/no-raw-colors` and `no-arbitrary-values` reject `bg-[#f00]`, `bg-[red]` and palette classes; a colour inside a shadow is `var(--color-…)`
- `better-tailwindcss/no-unknown-classes` fails anything the theme cannot generate (`text-8xl`, `md:`, a removed token). It does not see a `(--name)` shorthand whose variable is gone, so grep `tokens.css` before writing one
- No inline `style` except CSS custom properties (`style={{ "--date-count": n }}` read by `grid-cols-[repeat(var(--date-count),…)]`); the Open Graph image is exempt because Satori reads only inline styles
- Shared components in `src/shared/ui/` own their look: `shadcn/no-restyle` rejects `className` on them
- Class lists combine through `cn()` from `@/shared/ui/cn` (`clsx` plus `tailwind-merge` taught the theme's names); lint rejects a template string, `+` or `.join()` in `className`
- A length the scale has no step for is a design question for the host, not a bracket
- Durations have no Tailwind namespace: `duration-(--duration-fill)`. A press scale is `motion-safe:active:scale-97`, and lint rejects a `scale-` class without `motion-safe:`: `scale-*` sets the `scale` property, which the reduced-motion rule in `globals.css` (`transform: none`) does not reach
- No preflight is loaded, so browser defaults (heading margins, `box-sizing: content-box`) hold as they did under CSS Modules; add `m-0` or `box-border` where the box would change, and drop a declaration the element already inherits (`font-family` from `body`)
- Utilities are unlayered, so while CSS Modules remain they win or lose by specificity, as the old CSS did
- A look reused across product screens is a component (`PageFrame`), never an exported class string; the `dev/` demo pages keep their own copy
- CSS that `className` cannot carry (rules on DOM another module renders, `:has()` layouts, `@keyframes` the ticket keeps out of the theme) goes in a plain `<name>.css` beside its component, selected by `data-*` attributes, tokens through `var(--color-…)` and `calc(var(--spacing) * n)`: `e/[id]/poll-page.css`. Plain CSS is global, so every attribute and keyframe name there carries the owner's prefix (`data-poll-*`); a state on the component's own DOM is a `data-[…]:` utility instead
- Token names inside `var()`: `--color-<name>`, `--spacing` (a step is `calc(var(--spacing) * n)` in plain CSS, `--spacing(n)` inside a Tailwind bracket), `--text-<step>` with `--text-<step>--line-height`, `--tracking-*`, `--container-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--duration-*`, `--font-sans`, `--font-display`

## Tickets

A ticket is a file in `spec/tickets/`, in the shape of `spec/ticket.md`. It is claimed by setting `Status: claimed` before any work, and closed once its work is committed: every acceptance criterion ticked beside its evidence, `Status: done`.

## Work

- Work comes from `spec/board.md`; the host plans in `spec/` and decides what the brief leaves open, listed in `spec/decisions.md`
- One ticket per container, one pull request per ticket against `main`
- Done means a pull request with CI green for the host to merge; containers never merge
- The host merges only after its acceptance finds no open point: each ticked criterion checked against one piece of evidence, the changed files against Scope, the brief sections named in Parent, the last commit's screenshots against `spec/design/v2`, and an independent review of the diff against the brief. It writes the result to `acceptance.md` in the task directory; a pull request sent back closes every open point listed there
