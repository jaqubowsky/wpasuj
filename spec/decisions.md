# Decisions

Points `spec/brief.md` leaves open, taken by the host. A container that meets another open point takes the simpler option and adds a line here in its pull request.

1. Drizzle tables live in `src/shared/db/schema.ts`, one file and one migration history, because a module imports no other module and `participants.poll_id` references `polls.id`. Modules own their zod schemas, queries and writes; the table file is the database's technical shape
2. Design-system components (Text, Button, Chip, Segment, Input, Stepper, Cell, Card, Avatar, Status) live in `src/shared/ui/<component>/`: they carry look, no business rule
3. The product name and wordmark are one constant, `src/shared/brand.ts`
4. The poll page `src/app/e/[id]/page.tsx` composes the modules; ticket 03 gives it the header and the "Moje" / "Wszyscy" segment with two empty panels, and tickets 04 and 05 each fill one panel
5. Cookies: participant cookie named by the poll id (`<id>`), organiser cookie `<id>-org`, both httpOnly, SameSite=Lax, path `/`, one year
6. The server checks "none in the past" against the date today in the poll's time zone, the same date the organiser's device shows
7. `created_by_participant` is true when the create request carries any cookie that is a valid participant token of another poll
8. `participants.id` is an autoincrement integer; `slots.participant_id` references it
9. `npm run start` runs `.next/standalone/server.js`; `npm run build` copies `.next/static` and `drizzle/` into the standalone folder, so the Dockerfile copies one directory
10. Cell is one component: a toggle button (`pressed`, `state`) on the answer grid, or a heat cell (`heat`, `everyone`, `best`) on results
11. Avatar picks its tint from the name as given; callers pass the name they show
12. The `text` Button has no edge ring, as its README describes; the preview's ring comes only from the `.wp-button` cascade
13. Demo routes under `src/app/dev/` answer 404 unless `DEMO_ROUTES=1`, which `.env.development` and the Playwright web server set, because e2e runs the production build
14. On phone-webkit the grid's touch zones are proven by computed `touch-action` and snap; the real touch drag and swipes run on phone-chromium through CDP, because Playwright cannot move a touch in WebKit
15. "Pokaż cały miesiąc" opens six weeks from this week's Monday, with no month paging; the first day of each month carries the month's short name
16. Where the link is copied instead of shared, the create page shows "Link skopiowany" for 1.5 s before it moves to the poll; a clipboard the browser refuses still moves to the poll
17. A poll is gone once all its dates are more than 60 days before today in its zone; the create action's cleanup takes today in `Etc/GMT+12`, where the date changes last, so it never deletes a poll its own zone still shows
18. The gone page says "Tej ankiety już nie ma", one line on why (deleted, or its dates long past) and links to `/` with "Zrób nową ankietę"
19. The last name used on a device lives in `localStorage` under `last-name` (`src/shared/last-name.ts`), read by create and answer alike
20. Segment tabs are 44px tall, the brief's minimum target, where the design system draws 40px
21. Selected dates carry their text in `ink` on `accent` (5.3:1), not white (3.3:1), because the brief requires WCAG AA for every text pair; the mockup's white loses
22. Button has no link form; the gone page's "Zrób nową ankietę" link keeps its own styles in `not-found.module.css`
