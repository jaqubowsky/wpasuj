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
11. Avatar picks its tint from a key the caller passes, the participant's normalised name, as the brief says (corrected by the host at the acceptance of ticket 01; ticket 09)
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
23. Above the Segment sits the active tab's lead, below it that tab's body (`src/app/e/[id]/poll-tabs.tsx`). "Moje": lead = the name with its Status and "To ty?" when it applies, body = "Kiedy możesz?", the hint, the grid and the lines under it. "Wszyscy": lead = the best time and "Też dobre", body = the heatmap and "Kto odpowiedział" (ticket 05). The answer state lives in `AnswerProvider`, which both "Moje" parts read
24. Segment keeps every panel mounted and hides the unselected ones, so switching to "Wszyscy" and back never reseeds "Moje" from the server
25. `not-yours` means this device's cookie names a row another device took over with "Tak, to ja"; the save action clears that cookie, and the client sends once more as a newcomer, which reaches "To ty, {imię}?"
26. After "Tak, to ja" the grid holds the row's saved slots plus the ones painted on this device, and that union is saved
27. The Status reads "Zapisuję" from the stroke on, through the 500 ms quiet time, so "Zapisane" never stands beside a change that has not been sent; after a failure it keeps "Nie zapisano" with "Spróbuj ponownie" through new strokes until a save succeeds
28. "Tak, to ja" on a device that already holds another row of the same poll deletes that row, so one person is one respondent; its slots are already in the grid that decision 26 saves
29. Copy the brief leaves open: a zero-slot answer reads "Nie możesz w żadnym terminie. Zmieniasz zdanie? Po prostu kliknij."; a missing name "Wpisz swoje imię, żeby zapisać"; `closed` "Termin jest już ustalony, odpowiedzi są zamknięte. Zobacz go w zakładce Wszyscy."; `full` "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz."; `gone` "Tej ankiety już nie ma." with the "Zrób nową ankietę" link of decision 18
30. The date strip on create sits on a `surface` card (20px radius, 12px padding) that reaches 12px into the page gutter, because seven 44px tiles with 6px gaps (344px) do not fit a padded card inside the 350px column at 390; the tiles keep the brief's target and gap
31. When the link can be neither shared nor copied, the create page shows "Nie udało się skopiować linku. Skopiuj go z paska adresu." for 4 s, longer than the 1.5 s of "Link skopiowany" (decision 16) because the line asks for an action, then moves to the poll, whose address bar holds the link
32. The poll page's zone line compares IANA zone names, so a viewer in `Europe/Berlin` on a `Europe/Warsaw` poll reads it too; the brief says "when a viewer's zone differs"
