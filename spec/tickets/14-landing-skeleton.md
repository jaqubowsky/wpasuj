# 14: Landing skeleton, hero and static sections

Status: done
Blocked by: None, can start immediately

## Parent

`~/.sandboxes/wpasuj/plan.md` phase 3; canvas `spec/design/landing-canvas/Main.dc.html` with reference renders at 1440×900 in `~/.sandboxes/wpasuj/host-acceptance/landing-canvas/`; `spec/brief.md` ("Visual design", "Ergonomics", "Code rules"); `spec/decisions.md`. The canvas is desktop only; the phone is composed from the design system.

## Outcome

`/` opens with the real create form as the hero beside the headline "Kiedy się widzimy? Ustalcie to w minutę." and its line (stacked on the phone); the form loads first and is the LCP element. Below: the three reasons ("0 kont i maili", "20 s na odpowiedź", "1 najlepszy termin") and the final call "To kiedy się widzicie?", whose button scrolls to and focuses the hero form (one form on the page). The header's "Utwórz ankietę" scrolls to the form too.

## Scope

- `src/modules/landing/` in the module layout (`domain/`, `server/`, `ui/`, `index.ts`, `client.ts`); `src/app/page.tsx` gets one mount point that hands the create form in as the hero slot (a module imports no other module)
- Empty slots for the story (15-20), demo (21), FAQ and footer (22); the story and the demo load lazily near the viewport (`next/dynamic`); static sections are server HTML with `content-visibility: auto`
- Reveals with `animation-timeline: view()` behind `@supports`, from a visible start; reduced motion shows everything still
- Copy as in the canvas; colours only from `tokens.css`

## Out of scope

- Story scenes, demo, FAQ, footer (15-22); SEO and the performance gate (23)

## Acceptance criteria

- [x] e2e at 390 and 1440: the create form is in the first viewport and creating a poll from it still works (`e2e/landing.spec.ts`, "the create form is in the first viewport and creates a poll")
- [x] e2e: no landing chunk is requested before the form is interactive (`e2e/landing.spec.ts`, "the story and the demo load after the form is interactive": chunks absent from the HTML are held until the form answers a tap, then load near the viewport)
- [x] e2e with `reducedMotion: 'reduce'`: no running animation, no transform (`e2e/landing.spec.ts`, "nothing animates and nothing is moved"; "reveals follow the scroll where motion is allowed" proves the check is not vacuous)
- [x] Screenshots at 390 and 1440 of hero, reasons and final call beside `section-reasons-faq.png` and `section-end.png`; differences listed in the PR body (`e2e/screenshots/landing-*.png`)
