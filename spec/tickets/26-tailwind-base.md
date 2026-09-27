# 26: Tailwind base and app shell

Status: done
Blocked by: 13-module-layers.md

## Parent

`spec/brief.md`, "Stack (decided)" (Styling) and "Code rules"; host decision in `spec/decisions.md` (Tailwind migration)

## Outcome

The app builds with Tailwind v4 on our tokens only: no default palette, spacing or font leaks in, and the app shell under `src/app/` looks exactly as before.

## Scope

- Tailwind v4 through `@tailwindcss/postcss`; `tokens.css` becomes the `@theme` with the default theme reset (`--*: initial`), so every utility maps to a token and `tokens.css` stays the one source
- A lint rule or check that fails on a class outside the theme (for example `eslint-plugin-tailwindcss` or `prettier-plugin-tailwindcss` ordering plus a theme check)
- `src/app/` CSS Modules (6 files, 195 lines) moved to utilities, as the pattern the module tickets copy; the pattern written into `AGENTS.md`

## Out of scope

- `src/shared/` and each module: tickets 27 to 30
- Any visual change: none

## Acceptance criteria

- [x] A class such as `bg-red-500` or `p-7` outside the theme fails the build or lint; the failing output is in the pull request body — `better-tailwindcss/no-unknown-classes` in `npm run lint` rejects `bg-red-500`, `p-7` and `md:pt-5` added to `app-header.tsx` (exit 1); the PR body
- [x] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body — all 64 e2e screenshots (32 screens and states, tokens reach every one) differ by 0.000% from `4acd789`; the PR body
- [x] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base — `src/app` holds only `tokens.css`, `globals.css`, `e/[id]/poll-page.css`; all five exit 0, Vitest 46 files, 313 tests and e2e 98 passed, 8 skipped on `4acd789` and after (phone-webkit in CI)

## Comments

- Tokens moved to Tailwind namespaces (`--color-*`, `--spacing-*`), so every `var()` in the module CSS outside Scope was renamed with them; the only change in those files.
- The `:has()` results grid in `e/[id]/poll-page.css` stays plain CSS: it places elements `view-results` renders, which `className` cannot reach.
- Open for the host before 27 to 30: arbitrary values (`bg-[#f00]`, `text-[16px]/[20px]`) pass lint; banning arbitrary colours, and type tokens for the brief's type table, are host decisions.
