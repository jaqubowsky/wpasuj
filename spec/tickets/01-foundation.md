# 01: Foundation, CI and the design system in code

Status: done
Blocked by: None, can start immediately

## Parent

`spec/brief.md` ("Stack", "Code rules", "Data", "Visual design"), `spec/decisions.md`.

## Outcome

`npm run dev` serves a home page in Wpasuj's look (cream paper, Bricolage and Onest, the wordmark), and every later ticket inherits a working gate: lint, typecheck, unit, build and end to end run locally and on every pull request in GitHub Actions, with Playwright screenshots uploaded as the `screenshots` artifact. The database file at `DATABASE_PATH` gets its migrations on start, and the Docker image runs the standalone build.

## Scope

- Next.js app in `src/app`, TypeScript strict, ESLint, the scripts named in `AGENTS.md`, kebab-case file names
- `src/shared/db`: `better-sqlite3` client, `schema.ts` with `polls`, `participants`, `slots` exactly as "Data" says, the first migration in `drizzle/`, applied on start
- `src/app/tokens.css` from `spec/design/system/tokens.json`; fonts through `next/font` with `latin-ext`; Bricolage Grotesque and Onest TTFs committed for the OG image later
- `src/shared/ui/`: Text, Button, Chip, Segment, Input, Stepper, Cell, Card, Avatar, Status, built from `spec/design/system/components/*` and `bundle.css`, each with a component test
- `src/shared/brand.ts`: product name and wordmark
- Vitest with Testing Library; Playwright projects phone-chromium and phone-webkit at 390, desktop-chromium at 1440; a screenshot helper
- `.github/workflows/ci.yml` on pull requests and on push to `main`
- `Dockerfile` (standalone output, `DATABASE_PATH=/data/wpasuj.db`)

## Out of scope

- Any poll feature (02 to 08)
- Railway config and deploy (phase 2 of plan.md)

## Acceptance criteria

- [x] `npm run lint`, `typecheck`, `test`, `build`, `e2e` all exit 0 locally: lint, typecheck, test (33), build and e2e on phone-chromium and desktop-chromium exit 0 in the container; phone-webkit cannot run there (no WebKit, download blocked) and passes in CI below
- [x] The pull request's CI runs all five and passes; the `screenshots` artifact holds the home page at 390 and 1440: PR #1, run 36311580404, job `check` success, 6 e2e passed; artifact `screenshots` holds `home-phone-chromium`, `home-phone-webkit`, `home-desktop-chromium`
- [x] A test starts the app on an empty `DATABASE_PATH` and finds the three tables: `e2e/database.spec.ts`
- [x] `docker build` succeeds and the container answers on port 3000: run 36311580404, job `docker` success (build, run, `curl --fail` on port 3000)
- [x] A test page or Vitest render shows every `src/shared/ui` component matching its `preview.html` states: Vitest renders every preview state in `src/shared/ui/*/*.test.tsx`; a throwaway page compared side by side with the previews at 390 in Chromium, screenshots attached to the task, not committed

## Comments

- Cell has no count bump yet (1.08, `duration-bump`); the heatmap ticket (05) adds it with the rising count
- Segment tabs have no arrow-key model yet; ticket 03 adds it with the panels
- `next dev` run by an agent appends a Next.js block to `AGENTS.md`; it was left out of this pull request for the host to decide
