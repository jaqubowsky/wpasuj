# 26: Tailwind base and app shell

Status: ready-for-agent
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

- [ ] A class such as `bg-red-500` or `p-7` outside the theme fails the build or lint; the failing output is in the pull request body
- [ ] Every screen and state this ticket touches, at 390 and 1440, matches its screenshot from the base commit within 0.5% of pixels; each screen's number is in the pull request body
- [ ] No `*.module.css` left in Scope; `npm run lint`, `typecheck`, `test`, `build` and `e2e` green with the same test counts as the base
