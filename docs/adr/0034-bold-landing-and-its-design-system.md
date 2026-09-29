# ADR 0034: The landing is the bold page, and its looks live in the design system

- **Status:** Accepted
- **Date:** 2026-09-29
- **Owner:** owner (WPA-85)
- **Replaces:** the first two points of ADR 0018's decision (the story pin and the lazy sections); its perf budget stays

## Context

The owner found the landing's first screen weak: the headline sat low against the tall create form, and a product story followed a form the reader could already use. After options A to D the owner picked the bold prototype (`landing-bold-prototype.html`, WPA-85 comment 2026-09-29, "sztosik kontynuujemy"). It breaks `spec/brief.md` in two places. "Create (`/`)" says the home page is the create form. "Visual design" rules out "a hero on the app's own pages" and "cards with drop shadows" by name, and keeps motion "never on load". Its headlines are larger than the scale's largest step, `text-7xl` (72px). WPA-86 will reuse the new looks across the app, so they cannot stay landing code.

## Decision

- `/` is eight sections in this order: a sticky nav whose logo scrolls to the top; a hero whose headline swaps one word once through a list and stops on "grillu", with poster cards at its edges; an `ink` quote whose message count runs to 47 before a link preview arrives; a live poll to tap, whose best-time card pulses when the time changes; a `coral` wall of posters in slow marquees that pause under the pointer; "Twoja kolej" with the existing create form beside a link preview that follows the typing; the questions, opening and closing with motion; an `ink` outro with a heat-tile wordmark. Wavy edges join the full-bleed sections, and a light grain covers the page
- Idle motion runs on load on the landing: poster drift, the pointer follow, the swapped word, the count and the marquees. `prefers-reduced-motion` removes all of it, and "Zatrzymaj ruch" stops it on demand and is remembered on the device (WCAG 2.2.2)
- Shadows on the landing: `shadow-poster` on posters, link cards and the try-it board, and `shadow-ledge` / `shadow-ledge-ink` under the loud buttons
- Every new look is a token or a shared component, so WPA-86 reuses rather than copies:
  - type steps `text-8xl` (96/96) for section headlines and `text-9xl` (128/128) for the hero and the quote, Tailwind's own names
  - durations `turn` (350ms), `swing` (500ms), `reveal`, `burst`, `drift`, `marquee` and `marquee-slow`, one per value, and easings `ease-spring` and `ease-sway`
  - in `src/shared/ui`: `PosterCard`, `LinkCard`, `WaveEdge`, `Grain`, `MotionToggle` with `useMotion`, `useTileBurst`, and the `loud` and `loud-light` button variants, each with its page in `spec/design/system/components/`
- Hero posters sit fully inside the screen at 390 and 1440, clear of the headline and the call, and grow to their content rather than clipping it
- Beyond the brief, the owner's pick also brings: `accent` as large display text (the swapped word, the quote marks), 3:1 and above; paper text on `coral` for the wall's large "wszystko", as the prototype draws it and the owner confirmed on PR #82; the best-time pulse animating its background, the questions animating their height and the wordmark tiles fading in their colours, where the brief animates only `transform` and `opacity`
- The link card for `/` (`/og.png`) carries the headline "Kiedy się widzimy?", the owner's answer on PR #82; the page's h1 adds the swapped word ("…na grillu?")
- The quote "„A może w piątek?”" is Onest 600 in a synthesized italic: the app loads no Onest italic, and the owner accepted the synthesized one on PR #82
- The design system's content rules hold on the posters: their titles are in sentence case, not the prototype's capitals. The prototype's toast after creating a poll is not built, because the brief rules toasts out and the form already moves to the new poll
- Everywhere else the brief holds: tokens, fonts, copy, and no shadows, hero or idle motion on the poll pages until WPA-86 decides otherwise

## Consequences

- A change that brings back a form-first landing, or that moves posters, grain, idle motion or the new shadows onto the poll pages, undoes or reaches past this decision and needs the owner
- ADR 0018's budget (median of 5 cold runs on a throttled phone, LCP 2.5 s, TBT 250 ms, CLS 0.1) still gates the landing through `npm run perf`; no moving part changes layout outside the question it opens, so they add no layout shift
- A new idle animation on any page reads `useMotion().moving`, or runs in CSS on an element marked `data-idle-motion`, which `data-motion="still"` pauses; one that does neither ignores the toggle. Only idle loops opt in: a sheet or a pop that plays once must not, or it freezes on its first frame
