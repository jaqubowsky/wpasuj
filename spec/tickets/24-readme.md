# 24: Product README in Polish with screenshots

Status: ready-for-agent
Blocked by: 08-acceptance.md

## Parent

`spec/brief.md` ("Visual design", "Copy", "Out, by name"); host research brief below. The owner asked for a Polish README that reads like a product page, an exception to "committed text in English".

## Outcome

Opening the repository on GitHub shows Wpasuj as a product: the wordmark and one line of pitch, one hero screenshot of the flow, "Jak to działa" in four steps, a screenshot gallery of phone and desktop, what it does and does not do, the stack, and how to run it locally. The screenshots come from the app itself and can be regenerated with one command.

## Scope

- `README.md` in Polish, informal second person, the brief's copy rules (no exclamation marks, no corporate words); commands and code in English
- Order: centred wordmark (`<p align="center">`), pitch "Bez kont i bez maili. Wrzucasz link na grupę, każdy klika godziny, wiecie kiedy.", at most two badges (CI, license if one exists), hero image (`<img width="…">`), "Jak to działa" (1-4), gallery as a Markdown table (phone 390 beside desktop 1440: create, answer, results, Ustalone, link preview), "Co potrafi" and "Czego nie robi" (no accounts, no notifications), stack in one line, "Uruchom lokalnie" in a bash block with env vars in `<details>`, links to `spec/`
- `docs/readme/` for the images: PNG from Playwright, one width per device, light only (the app has no dark theme), each under 300 KB; `npm run readme:shots` regenerates them from seeded data with real-looking Polish names
- No emoji (brief: "emoji as icons or decoration" is out), no GIF unless under 2 MB; no `<video>` (GitHub strips it)
- Headings ASCII-safe in anchors, or the internal links checked on the rendered page

## Out of scope

- A docs site, a contributing guide

## Acceptance criteria

- [ ] `npm run readme:shots` regenerates every image in `docs/readme/` and CI runs it
- [ ] Every image in the README resolves and is under 300 KB
- [ ] The rendered README on the pull request's GitHub page shows the hero and the gallery (screenshot of the rendered page in the PR body)
- [ ] The copy passes the brief's rules: Polish, no exclamation marks, no emoji

## Notes

Research (sources: Rallly, Excalidraw, Documenso, Crab Fit READMEs; GitHub blog on `<picture>`; community discussions 19403 and 22728): GitHub keeps `align`, `width`, `<details>`, `<picture>`, tables and `> [!TIP]` alerts and strips `style`, `class`, CSS and `<video>`; the best product READMEs put an image or a one-line pitch in the first screen and keep badges to two or three.
