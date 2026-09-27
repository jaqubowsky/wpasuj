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
