# 07: Link preview

Status: done
Blocked by: 05-view-results.md

## Parent

`spec/brief.md` ("Link preview"), mockup `spec/design/v2/og.html`.

## Outcome

Pasting a poll link into a chat app shows a card that asks the question: "{imię} pyta, kiedy możesz", the title in Bricolage 800, the dates and part of day, and a miniature of the offered grid. The page's title and description read "Kiedy możesz? {title}".

## Scope

- `src/app/e/[id]/opengraph-image.tsx` rendered by `next/og` with flexbox only, fonts from the committed TTFs; its data code in `src/modules/view-results`
- `metadataBase` from `SITE_URL`; `generateMetadata` on the poll page
- The card carries no answer count, so it needs no heat buckets

## Out of scope

- The home page's own card and the marketing site

## Acceptance criteria

- [x] A test `GET`s the image: PNG, 1200×630, under 1 MB (`e2e/link-preview.spec.ts`, "the card is a 1200×630 PNG under 1 MB")
- [x] A test reads the poll page's `og:image` and finds an absolute URL to that image built on `SITE_URL` (`e2e/link-preview.spec.ts`, "the poll page asks the question and points og:image at its card on SITE_URL")
- [x] The rendered PNG saved in the `screenshots` artifact beside `og.html` for comparison, with Polish letters (ą, ę, ł, ż) rendered (`link-preview.png` beside `link-preview-mockup.png`, title "Wędrówka: żubry i łąka")
