# 38: Production readiness

Status: claimed
Blocked by: none

## Parent

`spec/brief.md` "Stack" (one Railway service, volume at `/data`, migrations on start, `DATABASE_PATH`); decisions 39 and 61.

## Outcome

The Docker image that CI builds is the one production runs, and CI proves it serves the real app: styles and scripts load, the migrations in `drizzle/` apply on an empty volume, and a poll can be created and answered against the database file on a mounted volume. The service tells Railway when it is healthy. The deploy itself stays the owner's.

## Scope

- `Dockerfile`: the standalone server plus `.next/static`, `public/` (if any) and `drizzle/` in the runtime image; the database on `/data`
- `src/shared/db/client.ts`: `journal_mode = WAL` and a `busy_timeout`, beside `foreign_keys`
- A health route (for example `/api/health`) that answers 200 once the database opens, and `railway.json` pointing Railway at the Dockerfile and that route
- CI `docker` job: run the image with a volume at `/data` and `SITE_URL` set; fetch a page and one of its `/_next/static` assets (200, CSS content type); create a poll and answer it through the running container (a short Playwright or curl step); restart the container and read the poll back from the same volume
- `AGENTS.md` "Stack": one line on the health route and `railway.json`

## Out of scope

- Deploying, the Railway project, DNS for wpasuj.pl, backups: the owner's (the final report names the steps)
- Multiple instances, another database

## Acceptance criteria

- [ ] CI `docker` job fails on the current `main` image for a missing static asset or missing migrations (shown in the PR body with the failing run), then passes on this branch
- [ ] In CI the container serves a `/_next/static/**.css` asset with 200, creates and answers a poll, and after a restart the poll is still there
- [ ] `PRAGMA journal_mode` reads `wal` (unit test on a real file)
- [ ] The health route returns 200 in the running container; `railway.json` names it
- [ ] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green
