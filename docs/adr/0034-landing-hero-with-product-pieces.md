# ADR 0034: The landing is a hero with moving product pieces

- **Status:** Accepted
- **Date:** 2026-09-29
- **Owner:** owner (WPA-85)
- **Replaces:** the first two points of ADR 0018's decision (the story pin and the lazy sections); its perf budget stays

## Context

The owner found the landing's first screen weak: the headline sat low against the tall create form, and a product story followed a form the reader could already use. From the options drawn for WPA-85 the owner picked a fourth, D: a centred headline with pieces of the product around it, then the create form, the questions and the footer. D breaks `spec/brief.md` in two places. "Create (`/`)" says the home page is the create form, and "Visual design" rules out "a hero on the app's own pages" and "cards with drop shadows" by name and keeps motion "never on load". Its headline is larger than the scale's largest step, `text-7xl` (72px).

## Decision

- `/` opens on a hero: the headline "Kiedy się widzimy?", the pitch and "Utwórz ankietę", which scrolls to the create form below and focuses its first field. The story, the live demo, the reasons and the final call are gone
- Around the hero, and at the edges of the form and the questions on desktop, sit decorative pieces of the product (chat bubbles, heat tiles, the best-time card, respondents, the link card). They are hidden from assistive technology and carry the one soft shadow `shadow-menu`
- The pieces drift while the page is open, and the hero's pieces follow the pointer. Both run only under `prefers-reduced-motion: no-preference`; with reduced motion every piece holds still
- The type scale gains `text-8xl` (128/120) for the hero headline on desktop, and the durations gain `--duration-drift`
- The rest of the brief holds on the landing and everywhere else: tokens, fonts, copy, and no shadows, hero or idle motion on the poll pages

## Consequences

- A change that brings back a form-first landing, or moves the pieces, shadows or idle motion onto the poll pages, undoes or overreaches this decision and needs the owner
- ADR 0018's budget (median of 5 cold runs on a throttled phone, LCP 2.5 s, TBT 250 ms, CLS 0.1) still gates the landing through `npm run perf`; the pieces animate only `transform` and `translate`, so they add no layout shift
- `text-8xl` is a step of the scale like the others; the brief's type line lists it
