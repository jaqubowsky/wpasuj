# 23: Landing SEO and performance gate

Status: ready-for-agent
Blocked by: 22-landing-faq-footer.md

## Parent

As ticket 14; `~/.sandboxes/wpasuj/plan.md` phase 3, "The rest".

## Outcome

`/` has its title, description, Open Graph card, `sitemap.ts`, `robots.ts` and `WebApplication` JSON-LD, and CI fails when a throttled phone run of `/` misses LCP 2.5 s, TBT as the lab stand-in for INP 200 ms, or CLS 0.1, story included.

## Scope

- Metadata on `/`, `src/app/sitemap.ts`, `src/app/robots.ts`, JSON-LD from the landing module
- A Lighthouse CI job (or Playwright with a performance trace) on the production build in `.github/workflows/ci.yml`

## Out of scope

- Occasion pages (later)

## Acceptance criteria

- [ ] Tests read the metadata, sitemap, robots and JSON-LD
- [ ] The CI job runs on the pull request, passes, and prints the numbers
- [ ] The LCP element in the report is the create form
