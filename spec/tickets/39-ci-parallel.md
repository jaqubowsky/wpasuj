# 39: CI in parallel jobs

Status: claimed
Blocked by: 23-landing-seo-perf.md

## Parent

`AGENTS.md` "Scripts" and "Testing"; owner request: CI takes 15-20 minutes and a late failure or a killed runner repeats all of it.

## Outcome

A pull request that changes only Markdown runs no CI. Any other pull request's CI reports a lint, type, knip or unit failure within about 4 minutes, runs the three Playwright projects at the same time on one shared production build, and a failed project can be re-run alone. The total wall-clock time for a green run is about half of today's (check job 17 min on main 2102169).

## Scope

- `.github/workflows/ci.yml`: a `quick` job (npm ci, lint, typecheck, knip, test); a `build` job uploading the standalone build as an artifact; an `e2e` matrix over `phone-chromium`, `phone-webkit`, `desktop-chromium`, each downloading the build and installing only its browser, each uploading its screenshots (one `screenshots-<project>` artifact each, or merged into one `screenshots` artifact); the `docker` and `perf` jobs unchanged apart from reusing the build where it is free
- `paths-ignore: ['**/*.md']` on `pull_request` and `push` (owner request: most plan PRs change only `spec/*.md`); first check through the GitHub API that main's branch protection requires no check that would then wait forever, and report what it printed
- Playwright browser cache keyed on the Playwright version
- `playwright.config.ts`: whatever the matrix needs (a server command that runs the downloaded build); keep `retries: 1` on CI
- `AGENTS.md` "Scripts": one line on the job layout and where screenshots land

## Out of scope

- Dropping any test or project; changing thresholds

## Acceptance criteria

- [ ] On a PR, a deliberate lint error fails the `quick` job in under 5 minutes (run link in the PR body, then reverted)
- [ ] A green run on the PR head: wall-clock time from first job start to last job end, next to main's 17 min, in the PR body
- [ ] The three e2e projects run as separate jobs on one build; screenshots of all three are downloadable
- [ ] A pull request changing only a `.md` file starts no CI run (the run list for its branch is empty, link in the PR body)
- [ ] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green
