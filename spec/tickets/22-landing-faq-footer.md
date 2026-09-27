# 22: FAQ and footer

Status: done
Blocked by: 30-tailwind-landing.md

## Parent

As ticket 14. Reference renders: `section-reasons-faq.png`, `section-end.png`.

## Outcome

"Pytania" with the canvas's four questions as native `details`, and the footer line "Wpasuj, darmowe ankiety terminów dla znajomych". The footer links to no page that does not exist yet: privacy, terms and "Zgłoś problem" come with phase 2.

## Scope

- `src/modules/landing/ui/faq/`, `ui/footer/`, server HTML only

## Out of scope

- Legal pages (phase 2)

## Acceptance criteria

- [x] e2e: each question opens with a tap and with the keyboard (`e2e/landing.spec.ts`, "each question opens with a tap", "each question opens with the keyboard"; the footer's line and its lack of links in "the footer names the product and links nowhere")
- [x] Screenshots at 390 and 1440 beside the references; differences listed in the PR body (`e2e/screenshots/landing-faq-*.png`, `landing-footer-*.png`)
