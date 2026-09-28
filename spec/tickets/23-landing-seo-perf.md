# 23: Landing SEO and performance gate

Status: done
Blocked by: 30-tailwind-landing.md

## Parent

As ticket 14; `~/.sandboxes/wpasuj/plan.md` phase 3, "The rest".

## Outcome

`/` has its title, description, Open Graph card, `sitemap.ts`, `robots.ts` and `WebApplication` JSON-LD, and CI fails when a throttled phone run of `/` misses LCP 2.5 s, TBT as the lab stand-in for INP 250 ms (decision 79), or CLS 0.1, story included, each as the median of 5 runs.

## Scope

- Metadata on `/`, `src/app/sitemap.ts`, `src/app/robots.ts`, JSON-LD from the landing module
- A Lighthouse CI job (or Playwright with a performance trace) on the production build in `.github/workflows/ci.yml`

## Out of scope

- Occasion pages (later)

## Acceptance criteria

- [x] Tests read the metadata, sitemap, robots and JSON-LD (`e2e/seo.spec.ts`)
- [x] The CI job runs on the pull request, passes, and prints the numbers (`perf` job, PR #39 run 36391858412: 5 runs printed, "LCP 1564 ms, TBT 154 ms, CLS 0.042, medians of 5 runs with the story scrolled through (benchmark index 2615, CPU 4x)")
- [x] The LCP element in the report is the create form: the report names `h1#hero-heading` (PR #39 run 36391858412, every run "on h1#hero-heading"), which the host accepted as the LCP element in place of the form

## Comments

- The perf gate scales the CPU slowdown by Lighthouse's benchmark index and its mid-tier-mobile multiplier table (4x from 1500, 2x from 1000, else 1x). TBT is almost all page hydration and varies by runner (101 ms and 208 ms at 4x on two runs); the create form's schema moved to zod/mini (owner decision), which takes the 392 KB full zod chunk out of the landing's first load
- At 390 the scene 6 best card covers the 19–22 rows, including the best cells; the fix is the phone frame height or the card's position, both classes
