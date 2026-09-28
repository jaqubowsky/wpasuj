# ADR 0015: The link preview card

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container; owner (`link-preview-card`, `link-preview-set-card`)
- **Replaces:** `link-preview-copy`, `link-preview-ranges`, `link-preview-card` (former decision entries)

## Context

Chat apps render a poll's Open Graph card when the link is sent. The brief said "no answer count", and `next/og` cannot read `tokens.css`.

## Decision

- The card is option A of the WPA-51 drawings: one column with "{imię} pyta, kiedy możesz", the title (84px, 64px past 34 characters, two lines at most), the dates with each weekday kept beside its day, the hours in words ("wieczorem, 17:00–23:00", "cały dzień, 10:00–23:00", or the range), and a bottom row with the respondents and the wordmark
- With no respondents the row invites "Zaznacz, kiedy możesz" and shows no avatars; from one on it shows up to six initials in their avatar tints, "+N" and "N osób już odpowiedziało". The first paste nearly always shows zero, a reminder sent later shows the real count; this replaces the brief's "no answer count"
- Three or more days in a row read as a range ("pt 17 – nd 19 października"); two days or scattered days are listed one by one; the create form's date summary keeps listing every day
- A poll with a set time previews as option A of the WPA-52 drawings, the invitation screen's parts on a card that is all `ink`: a paper "✓ Ustalone" badge beside "Ustalone przez: {imię}", the title (56px, 44px past 34 characters, two lines at most), "Widzimy się", the weekday and day on one line and the hours in `heat-3`, as the invitation says them, and a bottom row with up to six initials of those free for the whole set time, "+N" and "Będzie N osób" beside the wordmark; with nobody coming the row shows only the wordmark
- The card's URL carries the poll's state as a path segment, `otwarta` or `ustalone-{date}-{first hour}-{last hour}`, so setting, changing or clearing the time gives `og:image` a new URL that a chat app has not cached
- The card copies the token hex values, because `next/og` cannot read `tokens.css`

## Consequences

- Removing the count undoes an owner decision that the brief now follows
- A token colour changed in `tokens.css` must be changed in the card by hand
- `spec/design/v2/og.html` no longer describes the card
- A link pasted before the time was set keeps its cached open card in that chat; only a link sent again shows the set time
- A new state the card shows needs its own segment, or chat apps keep the old picture
