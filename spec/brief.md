# Wpasuj: product requirements

Wpasuj (working name; the owner confirms it after a trademark check, so it lives in one constant) finds a time for a group of friends to meet. Someone drops one link into the group chat, everyone taps the hours they are free on the days offered, and the app shows the time that works for most of them. Build it in `jaqubowsky/wpasuj`, end to end, merged into `main` and verified in a browser.

## The problem it solves

- A group of friends cannot find a time to go out; the thread of "maybe Thursday?" messages never converges.
- A question in the group chat ("anyone up for something tonight?") gets ignored, while a direct message gets an answer. Answering has to cost less than scrolling past: open the link, tap, done.
- Friends will not learn a tool. Anything that looks like a form, a setup step or a feature list loses them.

The bar, in this order: **simple** (a first-time participant answers with a name and a few taps, with nothing to learn), **good-looking** (it reads as a product a small design-led team made, not a generated template), **nothing that scares people off** (no settings, no accounts, no feature they have to understand first).

When a detail below and your taste disagree, this document wins; where it is silent, choose the simpler option and write the choice down.

## Who uses it

- **Organiser**: one friend who wants to get people out. Creates the poll in under 30 seconds, sends the link to the group, later sees who answered and the best time, and announces it.
- **Participant**: opens the link from a chat app on a phone, often inside Messenger's or Instagram's in-app browser, types a name once, taps hours, leaves.

The phone at 390px is the primary device; the desktop at 1440px must look deliberate too, but nothing is designed for it first.

## Terms

- **Slot**: one whole hour on one date, named by its start ("19" is 19:00 to 20:00).
- **Range**: a first hour (0 to 23) and a number of hours (1 to 24), so a range may run past midnight: 22:00 to 4:00 is 6 hours, and its slots 0 to 3 belong to the evening's date. A run of slots 19, 20 and 21 is written "19–22"; one past midnight "23–2".
- **Respondent**: a participant who has saved at least once, including one who can't make any slot. Shares and counts ("5 z 6 może") use respondents as the denominator.
- **Run**: one or more consecutive slots on one date where the same set of respondents is free.

## Flows

### Create (`/`)

The home page is the create form; there is no separate landing page on the app's own route (the marketing site is a later phase of `~/.sandboxes/wpasuj/plan.md`; nothing from that plan beyond this document is built now). One screen, four things:

1. **Co robimy?** One line of text that wraps on screen as the section headline, line breaks folded into spaces, required, 1 to 60 characters, placeholder "Co robimy?" (ADR 0035).
2. **Kiedy?** Chips "Dziś", "Jutro", "Ten weekend", "Przyszły tydzień" above a two-week strip of dates starting this week, with "Pokaż cały miesiąc" expanding it to a month calendar. A tap on a date toggles it; 1 to 10 dates, none in the past.
   - "Dziś" and "Jutro" are those dates. "Ten weekend" is this week's Friday to Sunday, without past days. "Przyszły tydzień" is next Monday to Sunday.
   - A chip adds its dates; tapping a lit chip removes them. A chip is lit while all its dates are selected. A tap that would go past 10 dates changes nothing and says "Maksymalnie 10 dni".
   - "Today" and "past" use the organiser's device date.
3. **O której?** "Od" and "Do", always visible, 17:00 to 23:00 by default, any whole-hour range of 1 to 24 hours (WPA-44). On the phone each field opens a bottom sheet with two hour columns; on desktop 24 hour tiles in rows of eight, ordered 6 to 5, the hour number only. A first click marks its tile in `ink` as the start and the summary turns `ink` and reads "Od 2:00 kliknij ostatnią godzinę →" (ADR 0035); a second click makes the clicked tile the last hour, counting on past 5 into the next morning when it comes earlier in that order, so 2 then 8 is 2:00 → 9:00 · 7 godzin. The ends are `ink`, the hours between `heat-2`. A summary under both reads "22:00 → 4:00 · 6 godzin". No presets, no "rano" or "następnego dnia" labels: the order carries it.
4. **Twoje imię**, prefilled with the last name used on this device. It becomes the organiser's answer name and is shown as "{imię} pyta".

A sticky bottom button "Utwórz i wyślij na grupę". On the phone it opens the native share sheet (`navigator.share`) with "Kiedy możecie? {title} {link}"; where sharing is unavailable it copies the link and says "Link skopiowany". The organiser then lands on the poll page on "Moje".

The organiser's time zone (from `Intl.DateTimeFormat().resolvedOptions().timeZone`, sent with the form) is the poll's zone for everyone; it is named once in small text when a viewer's zone differs. Everything else is fixed: one-hour slots, no description, no settings.

### Answer (`/e/:id`, "Moje" tab)

1. The page shows the title, "{imię organizatora} pyta", and "{n} osoba już odpowiedziała" / "{n} osoby już odpowiedziały" / "{n} osób już odpowiedziało", chosen with `Intl.PluralRules('pl')` (or "Bądź pierwszy" at zero).
2. "Jak masz na imię?" A name, 1 to 30 characters after trimming, collapsing spaces and NFC normalisation, unique within the poll compared with `toLocaleLowerCase('pl')`. The last name used on this device is prefilled.
3. The grid "Kiedy możesz?" with one hint line above it: "Kliknij godziny, kiedy możesz. Możesz przeciągnąć." with a fine pointer, "Kliknij godziny, kiedy możesz. Przytrzymaj, żeby przeciągnąć." on touch (ADR 0036).
   - Columns are dates, rows are slots. A tap on a cell toggles it; that is the primary input and works alone.
   - Dragging across cells paints the rectangle between the first and the current cell, adding when the first cell was empty and removing when it was filled.
   - A tap on a date header toggles that whole date; a tap on an hour label toggles that slot on every date. Both look like buttons.
   - On touch a swipe that starts on a cell scrolls the page (and the dates sideways); press and hold a cell for 300 ms, then drag, to paint, and the page stays still until the finger lifts. A finger that moves more than 8 px before the hold scrolls and paints nothing. Mouse and pen paint at once (ADR 0036). The sticky hour column scrolls the page vertically (`touch-action: pan-y`); the date header scrolls the dates sideways (`pan-x`) with snap per date. Up to four dates fill the width; more scroll sideways.
4. Changes show at once. The "Moje" grid is local state, seeded once from the server, and polling never writes into it. 500 ms after a stroke ends the client sends the full set of my slots, which the server replaces; one save is in flight at a time and the newest pending set goes next.
5. A status beside the name, icon plus word: "Zapisuję", "Zapisane", or "Nie zapisano" with "Spróbuj ponownie", which stays until a save succeeds; "Zapisane" fades out after each save (ADR 0035). No toasts, no save button. After the first save a line under the grid says "Gotowe. Zmieniasz zdanie? Po prostu kliknij."
6. "Nie mogę w żadnym terminie" is a light ledge button under the grid (ADR 0035); it saves an empty set. A respondent with zero slots is shown as "nie może".
7. The participant row is created on the first save. Editing the name renames the row.
8. **Identity**: the server sets an httpOnly, SameSite=Lax cookie per poll, named by the poll id with path `/`, holding the participant token, so reopening the link resumes editing. A name that already exists in the poll, typed without its token, asks "To ty, Ola?" with "Tak, to ja" and "Nie, zmienię imię". "Tak" moves the row to this device (issues a new token and cookie). Friends are trusted; there is no password.

The page opens on "Moje" when this device has not answered and on "Wszyscy" when it has. The page never switches tabs by itself.

### Results ("Wszyscy" tab)

- **The best time**, as the page's headline block: "Najlepiej: sobota 18.10, 19–22", "5 z 6 może" and "Nie może: Ola". Runs are ranked by the size of their free set, then length, then earliest start. The best time is the top run; no other runs are listed (the owner removed "Też dobre", as the approved boards draw it). A run with nobody free is never shown. With no respondents the block reads "Nikt jeszcze nie odpowiedział. Wyślij link na grupę."
- The heatmap: each cell coloured by the share of respondents free, five buckets, with the count in the cell, and nothing else: no border marks the hours everyone can make or the best time, which the best-time card names.
- A tap on a cell shows who can and who can't, in a sheet from the bottom on the phone and a side panel on desktop.
- **Kto odpowiedział**: each respondent with when they last saved ("20 min temu"), or "nie może"; newest first.
- Other people's changes appear within 10 seconds while the tab is visible, and at once when it regains focus.

### Organiser's extras

The organiser is whoever holds the organiser cookie, set on create. The results tab shows, nothing else: "Przypomnij" and the "Więcej" menu in one row under the title, and "Ustal ten termin" inside the best-time card:

- **Przypomnij**: a message that names who already answered, because a request addressed to named people gets more replies than one to everyone: "Już są: Bartek, Ola i Michał. Reszta, kiedy możecie? {title} {link}" ("Już jest: Ola." for one). With nobody answered: "Kiedy możecie? {title} {link}". Share sheet on the phone, copy elsewhere.
- **Ustal termin**: on the best time. The page then leads with "Ustalone: sobota 18.10, 19:00" for everyone, with "Dodaj do kalendarza", a menu of Kalendarz Google and Outlook (their prefilled web editors) and Kalendarz Apple (an `.ics` served inline, DTSTART and DTEND in UTC), each carrying the poll link; answering closes. "Zmień" clears the final time and reopens answering.
- **Zrób własną ankietę**: a quiet link at the bottom of every poll page, for everyone, because every participant who sees a poll is the next organiser. Besides it, a participant whose answer is saved, from the first save on and again on return, sees one line under their answer, "Też coś planujesz? Zrób własną ankietę →", linking to `/`: no card, no animation, never on the organiser's device (owner, 2026-10-01, WPA-116). While that line is visible, the footer link is hidden, so a participant sees one invitation at a time; on Wszyscy, before the first save and for the organiser the footer link shows (owner, 2026-10-01, WPA-123).
- **Więcej** menu: "Kopiuj link", "Link organizatora" (a URL that sets the organiser cookie on another device, with one line saying to keep it private), and "Usuń ankietę", confirmed inline.

The organiser also answers like anyone else.

### Errors and gone polls

Every failure has Polish copy that says what happened and what to do. A deleted or expired poll shows "Tej ankiety już nie ma" with a link to create one.

## Stack (decided)

- Next.js, current stable, App Router, TypeScript strict. Mutations through server actions. Route handlers only for the Open Graph image, the `.ics` file, the organiser link (sets the organiser cookie, then redirects to the poll), the poll's read endpoint that live refresh polls, and `GET /api/health`, which answers 200 once the database opens and gates each deploy.
- SQLite through Drizzle ORM with `better-sqlite3`, one database file on a mounted volume, migrations in `drizzle/` applied on start. `output: 'standalone'` and a `Dockerfile` that runs it; production is one Railway service with a volume at `/data` (`~/.sandboxes/wpasuj/plan.md`), so nothing may assume a serverless or edge runtime, and the database path comes from `DATABASE_PATH`.
- Server state (the poll, its answers, who answered) is read by server components on first load and kept fresh on the client through TanStack Query polling the read endpoint; client state (the stroke being painted, my slots, the name being typed) stays in component state and hooks, never in the query cache.
- Styling: Tailwind v4 utilities on the tokens below, declared once in `tokens.css` as the `@theme` with the default theme reset, so no class outside our tokens exists. No UI kit and no default look (no Tailwind default palette or spacing, no shadcn defaults, no Material). Fonts self-hosted through `next/font/local` from `src/shared/fonts/` (latin and `latin-ext`), so no build fetches them; the Open Graph image loads the same fonts from the committed TTF files there.
- zod at every boundary (form data, action input, URL params, the read endpoint's response); TypeScript types derive from the schemas and the Drizzle tables, never written twice.
- Vitest with Testing Library for units and components; Playwright for end to end, with the phone flows in both Chromium and WebKit.
- GitHub Actions on every pull request: lint, typecheck, unit, build, end to end.

## Code rules

- **File and folder names in kebab-case**: `availability-grid.tsx`, `use-paint-stroke.ts`, `best-time.ts`. Next.js file conventions keep their names: `app/e/[id]/page.tsx`, `opengraph-image.tsx`, `route.ts`.
- **Modules by what people do, not by table**:
  - `src/modules/create-poll`: the create form, presets, the poll's schema and its writes (create, set final time, delete), expired-poll cleanup.
  - `src/modules/answer-poll`: name, identity, painting, autosave.
  - `src/modules/view-results`: best time, heatmap, who answered, reminder text, the read endpoint, the Open Graph image and the `.ics` file.
  - Each module has `index.ts` for server code (starting with `import 'server-only'`) and `client.ts` for client components and hooks, and holds its own components, hooks, actions, schemas and tests. What changes together lives together.
  - Inside a module, three layers: `domain/` (pure functions and their tests; imports nothing from React, `server/` or `ui/`), `server/` (schemas, queries, actions: the only I/O), `ui/` (components, hooks). `index.ts` and `client.ts` stay the only public entries. ESLint `no-restricted-imports` keeps the direction: `domain/` never imports React, `server/` or `ui/`.
  - `src/shared` holds technical code only: the database client, `day-hour-grid` (layout, sticky column, snap, touch zones and keyboard, taking a cell render prop), share sheet and clipboard, date formatting. Never a business rule.
- **A module asks, it does not reach**: when one module needs something another owns (results need the poll's title and dates; the organiser's buttons need `setFinal` and `deletePoll`), it declares the need as a narrow function type in its own vocabulary, and the page that composes the modules supplies it. A module imports no other module.
- **Copy domain code, share technical code**: a rule used in two modules (the heat buckets in the grid and in the Open Graph image) is copied, not extracted, unless the two can never need different answers.
- **Domain logic in pure functions**: best time, runs, buckets, ranges, date presets and name rules take plain data and return plain data, with no React, no database, no `Date.now()` inside (the clock is an argument). They are tested directly.
- **UI logic in custom hooks** (`use-*.ts`): painting, autosave, the organiser check. Components render props and call hooks; a component with logic in its body is split.
- **Server actions stay thin and return their failures**: parse with zod, call the domain, persist, and return `{ ok: true, … } | { ok: false, reason: 'invalid' | 'name-taken' | 'not-yours' | 'not-organiser' | 'closed' | 'full' | 'gone' }`, which the caller switches on exhaustively. An action throws only on a bug. No business rule lives in an action or a component.
- **Red, then green**: every behaviour starts as a failing test that is run and seen failing for the right reason, then the smallest code that turns it green, then a refactor with the tests green. Tests name behaviour the user or the domain cares about. Action tests run against a real SQLite file per test with `cookies()` stubbed; only the clock, cookies and true externals are stubbed.
- **Minimal changes**: a diff touches only what its ticket needs. No speculative options, no unused exports, no helper with one caller that reads worse than inline code (hooks and domain functions are exempt). Names carry the meaning, so code has no comments.
- **Deletable modules**: deleting a module's folder breaks only the page that composes it and leaves no dead route or orphaned import.
- **One source per concept**: tokens in `tokens.css`, types from schemas, copy strings next to the component that shows them, and the product name and wordmark in one constant, since the name may still change.

## Data

- `polls`: id (10-character URL-safe random), title, organiser name, dates (JSON array of ISO dates), last date (the latest of dates, indexed), first hour, hour count, time zone, organiser token hash, final date, final first hour and final last hour (nullable), created at.
- `participants`: id, poll id, name, normalised name (unique per poll), token hash, created at, updated at.
- `slots`: participant id, date, hour; the triple is the key.
- Tokens are 32 random bytes, base64url, stored as SHA-256 hashes and looked up by hash.
- Limits: 10 dates, 30 participants (`full` beyond), a first hour 0 to 23 and 1 to 24 hours. The server deletes polls 60 days past their last date on start and once a day (ADR 0039).
- `polls.created_by_participant`: true when the creating device already held a participant cookie from another poll, so the share of participants who become organisers can be counted without analytics.

## Ergonomics (from UX research)

- Every tappable thing is at least 44×44 px, grid cells 48 px; neighbours keep a gap of at least 6 px, and the hit area is the visible tile (Apple HIG, WCAG 2.5.5, Material, NN/g).
- The main action of each screen sits at the bottom, in thumb reach, as a sticky bar above the home indicator (`viewport-fit=cover`, `env(safe-area-inset-bottom)`); layouts use `100dvh`, never `100vh`.
- Every text input renders at 16 px or more, so iOS does not zoom on focus; pinch zoom stays enabled. The name field has `autocomplete="given-name"`, `enterkeyhint="done"`, and takes focus on load only when empty.
- Every drag has a tap alternative (WCAG 2.5.7). The grid is an ARIA grid with `aria-multiselectable`: arrows move, Space toggles, Shift+arrows extend.
- A tap shows feedback within 100 ms (press scale and fill); saving never blocks the next tap.
- A number never relies on colour alone: heat cells carry their count, save states carry an icon and a word.
- Empty states say what to do next; buttons name their action ("Utwórz i wyślij na grupę", "Ustal ten termin"), never "OK".

## Visual design

**Direction**: warm and tactile, minimal. Cream paper, near-black ink and one coral accent that means "free"; the heat of a slot is the only other colour. Soft, generous shapes and a characterful display face make it feel like a plan with friends; restraint everywhere else keeps it from looking like a party app or a SaaS form. Chosen from research of Crab Fit, Rallly, When2meet, Timeful, Partiful, Luma and Apple Invites: the no-account link and the live heatmap are the category's proven core, When2meet's drag read as a scroll on phones is its worst failure, and Partiful's constant motion is what users tire of.

**Design sources**: copy exactly `design/system/`, `design/v2/` and `design/landing-canvas/` from `~/.sandboxes/wpasuj/` into the repository under `spec/design/` before the first ticket, since containers cannot reach claude.ai; nothing else there is a source:
- `system/`: the Wpasuj design system (`tokens.json`, `README.md` as the brand book, `patterns.md`, one folder per component with `preview.html` and `README.md`, `components/bundle.css`). The same system is live at https://claude.ai/artifact/B3K2X7DdNDSZkKBSgdkbEn. Build the app's components from it: Text, Button, Chip, Segment, Input, Stepper, Cell, Card, Avatar, Status; the screens compose them as `patterns.md` says.
- `v2/`: static screen mockups (`create-phone.html`, `answer-phone.html`, `results-phone.html`, `results-desktop.html`, `og.html`) with screenshots under `v2/shots/`. They fix layout only; sizes, gaps, borders and colours come from this document and `tokens.json`, and their data is invented. The PNGs under `shots/` predate the 6px gap, 44px chips and `edge` borders in the HTML; the HTML wins.
- `landing-canvas/Main.dc.html`: the marketing home page, designed in Claude Design at https://claude.ai/artifact/R1i1BZPFRXe91JjJBup4yb; built in phase 3 of `~/.sandboxes/wpasuj/plan.md`, not in this MVP.

Where a mockup and this document differ, this document wins; screens without a mockup (desktop create and answer, the bottom sheet, "Ustalone", "To ty?", errors, the empty state) are composed from the design system's parts.

**Type**: Bricolage Grotesque for display (titles, the best time, day numbers, the wordmark), weights 700 and 800, tight tracking (−0.01 to −0.03em); Onest for everything else, weights 400, 500 and 600, tabular figures wherever a number can change.

Sizes come from one scale in `tokens.css`, Tailwind's names with a paired line height: `xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28, `xl` 20/28, `2xl` 24/32, `3xl` 30/36, `4xl` 40/44, `5xl` 48/52, `6xl` 60/62, `7xl` 72/72, and on the landing `8xl` 96/96 and `9xl` 128/128 (ADR 0034). A role picks a step, and a desktop size is a responsive variant (`text-3xl lg:text-4xl`), never its own token.

| Role | Font | Step | Weight |
|---|---|---|---|
| Title | Bricolage | `3xl` phone, `4xl` desktop | 700; the poll poster's `4xl` phone, `8xl` desktop, 800, and the create form's title `5xl` phone, `8xl` desktop, 800 (ADR 0035) |
| Best time | Bricolage | `3xl` | 700 |
| Day number | Bricolage | `xl` | 700 |
| Section heading | Bricolage | `lg` | 700 |
| Body, chips | Onest | `base` | 400, chips 500 |
| Buttons | Onest | `base` | 600 |
| Label, meta, hour labels | Onest | `sm` | 500 |

Display tracking is `tracking-tight` (−0.01em), `tracking-tighter` (−0.02em) or `tracking-tightest` (−0.03em).

Sentence case everywhere; no all-caps labels, no letter-spaced eyebrows.

**Design system**: https://claude.ai/artifact/B3K2X7DdNDSZkKBSgdkbEn holds the tokens, the brand book and live previews of every component (Text, Button, Chip, Segment, Input, Stepper, Cell, Card, Avatar, Status) and a Patterns section for the compositions (day-hour grid, best time, poll header, create form, bottom sheet). It is the source of truth for look and tokens; its export is already in `~/.sandboxes/wpasuj/design/system/` and is copied as above. Previews render only with `components/bundle.css` plus a `:root` built from `tokens.json`.

**Colour tokens** (light theme only; every text pair checked against WCAG AA):

| Token | Value | Use |
|---|---|---|
| `paper` | `#FBF7F1` | page background |
| `surface` | `#FFFFFF` | cards, free cells, inputs |
| `track` | `#F2ECE3` | segmented control track |
| `ink` | `#1E1B18` | text, primary buttons, the best-time card, selected chips, focus ring |
| `muted` | `#72695F` | secondary text (5.0:1 on paper) |
| `line` | `#EDE6DC` | decorative hairlines only |
| `edge` | `#958A7E` | 1px border that marks a control: free cells, unselected chips, inputs (3.4:1) |
| `accent` | `#F0603F` | your own slots, selected dates; never text |
| `accent-ink` | `#B8401F` | accent as text |
| `on-dark-muted` | `#CFC7BC` | labels on the ink card |
| `heat-1` … `heat-5` | `#FDEDE6`, `#FAD3C3`, `#F6AE93`, `#F18463`, `#CC4420` | share free: ≤20%, ≤40%, ≤60%, ≤80%, >80% |
| `tint-coral`, `tint-lilac`, `tint-mint`, `tint-butter`, `tint-sky` | `#FAD3C3`, `#E6E1F8`, `#DDEFE3`, `#FBEBC4`, `#DCEBF7` | avatar grounds |

Counts on heat cells are `ink`, white only on `heat-5`. Avatars take their tint from the normalised name.

**Grid**: separate rounded tiles (10px radius) with a 6px gap, at least 48px tall and 56px wide on the phone. Free is `surface` with an `edge` border; mine is `accent`; add preview is `accent` at 35%; remove preview is `line`; heat 1 to 5 carry the count and no other mark; focus is a 2px `ink` ring. The date header is the weekday small and muted over the day number large ("pt" over "17").

**Shape and space**: one 4px grid (`--spacing: 4px`), so `p-7` is 28px and 44, 48 and 52 are `11`, `12` and `13`. Radius 10 on cells, 14 on buttons and inputs, 20 on cards, full pill on chips. No borders on cards and no shadows, except the selected segment's 1px lift and the bottom sheet's one soft shadow; the landing (ADR 0034) and the app pages (ADR 0035) add posters, a board shadow and ledges under buttons. Buttons 52px tall on the phone, the main action full width; the primary is `ink` with white text. The best time sits in an `ink` card with the count in `heat-3`.

**Motion**: the app has some play in it, used where it carries meaning and never on load (the poll pages' one-shot motions are in ADR 0035):
- A tapped cell fills in 120 ms with a 0.96 press scale.
- A heat cell whose count rises bumps to 1.08 scale for 180 ms.
- A new respondent's avatar pops in with a slight overshoot (320 ms, `cubic-bezier(.3,1.5,.5,1)`).
- The best-time card pulses once and throws a tile burst when the best time changes (ADR 0035).
- The "Moje" and "Wszyscy" switch uses a View Transition where the browser has one.
- The bottom sheet slides up in 200 ms ease-out.
- Only `transform` and `opacity` animate; no confetti; `prefers-reduced-motion` removes all of it.

**Copy**: Polish, informal second person, the way a friend writes in a chat: short, no exclamation marks, no corporate words ("użytkownik", "zarządzaj", "konfiguruj").

**Out, by name**: gradients, glassmorphism, purple or indigo, emoji as icons or decoration, illustrations, a hero on the app's own pages (the poll poster header is not one, ADR 0035), cards with drop shadows (except ADR 0034 and 0035), onboarding tours, tooltips explaining the grid, toasts, confetti, skeleton shimmer, icon-only buttons, and Inter, Poppins, Montserrat, DM Sans, Plus Jakarta Sans, Satoshi or General Sans. Icons, where a label alone is not enough, are Lucide at 18px with a 1.5 stroke, beside text.

### Link preview

A 1200×630 PNG under 1 MB, rendered by `next/og` with flexbox layout only, in one column: "{imię} pyta, kiedy możesz", the title in Bricolage 800 at display size, the dates and the hours in words, and a bottom row with the respondents beside the wordmark. With no respondents the row invites "Zaznacz, kiedy możesz"; from one on it shows up to six initials in their avatar tints, "+N" for the rest and "N osób już odpowiedziało". Chat apps render the preview when the link is sent, so the first paste nearly always shows the invitation and a later reminder the real count. `og:image` is absolute, from `metadataBase` built on `SITE_URL`. Title and description state the question itself: "Kiedy możesz? {title}".

## Out of scope

Accounts and sign-in, notifications of any kind, calendar integrations beyond the prefilled links and the `.ics` file, time zones beyond the organiser's, per-person invite links, recurring polls, comments or chat, a description field, a per-name filter in results, dark theme, English, analytics inside the app, the marketing site.

## Acceptance

- A first-time participant on a 390px phone (Chromium and WebKit) answers a fresh poll with a name and one drag, sees "Zapisane" without pressing any button, and the same with taps only.
- Three participants in separate browser contexts answer; the best time, the heatmap counts, the per-cell names and "Kto odpowiedział" agree with a hand count, including a poll where the free set changes while the count stays the same.
- The organiser creates a poll with "Ten weekend", the default range and a title, reminds (the message names who answered), sets the time, and a participant gets the calendar links and the `.ics` with the right UTC times.
- A second browser context typing an existing name gets "To ty, Ola?" and takes the row over; the organiser link restores organiser controls in a fresh context.
- `GET` of the Open Graph image returns a 1200×630 PNG under 1 MB, and the page's `og:image` is an absolute URL to it.
- Playwright saves every screen and state at 390 and 1440 as a CI artifact of the pull request that introduces it; the pull request body names each screen and the mockup or design-system parts it was compared with.
- CI green on `main`; unit tests cover runs and best time, buckets, date presets, ranges and name rules; action tests cover success and every failure reason; one end-to-end test runs create, share, three answers, remind, set the time and get the calendar links and the `.ics`.

## Environment

The repository is empty; the first push creates `main`, which has no branch protection. This session holds a token scoped to this repository in `GH_TOKEN`; a Touch ID, password or 1Password prompt during the run is a harness fault. Deploys and repository settings stay with the user. Finish with a report in Polish: what shipped with its pull requests, every decision you took, and every point where the harness got in your way or needed the user.

Scratch line for WPA-124 criterion 1; this pull request is never merged.
