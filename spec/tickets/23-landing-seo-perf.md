# 23: Landing SEO and performance gate

Status: done
Blocked by: 30-tailwind-landing.md

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

- [x] Tests read the metadata, sitemap, robots and JSON-LD (`e2e/seo.spec.ts`)
- [x] The CI job runs on the pull request, passes, and prints the numbers (`perf` job, PR #39 run 36384940495: "LCP 1552 ms on h1#hero-heading, TBT 101 ms, CLS 0.000 with the story scrolled through (benchmark index 4155, CPU 4x)")
- [ ] The LCP element in the report is the create form: not met, the report names `h1#hero-heading` at 390 and 1440; the form holds only small text blocks, so it can outgrow the h1 only if the h1 shrinks, a class change outside this ticket (host decision)

## Comments

- The perf gate scales the CPU slowdown by Lighthouse's benchmark index and its mid-tier-mobile multiplier table (4x from 1500, 2x from 1000, else 1x). A fixed 4x gave TBT 414 ms on one runner and 101 ms on another; the TBT is almost all page hydration, and full zod in the create form's client bundle (392 KB raw) is its largest part
- At 390 the scene 6 best card covers the 19–22 rows, including the best cells; the fix is the phone frame height or the card's position, both classes
