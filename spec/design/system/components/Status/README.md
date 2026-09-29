# Status

A short state line: an icon plus one word, for something happening in the background (saving your hours).

- The consumer provides the state: working ("Zapisuję"), done ("Zapisane") or failed ("Nie zapisano"); a failed state sits next to a small Button that retries ("Spróbuj ponownie") and stays until it succeeds.
- `meta` type in `muted`; failed in `accent-ink`. The 16px glyph uses the text colour.
- Done ("Zapisane") is bold `accent-ink` and fades out 1.6 s after each save (`data-faded`, opacity over `duration-turn`), but stays the text of the `role="status"`; the next save brings it back. Working and failed never fade (ADR 0035).
- Never a toast or modal; it sits where the thing it describes is.
