# ADR 0036: On touch, a swipe on the grid scrolls and a hold starts painting

- **Status:** Accepted
- **Date:** 2026-09-29
- **Owner:** owner (WPA-92)
- **Replaces:** `spec/brief.md` Answer step 3, "Cells use `touch-action: none`, so a drag on them never scrolls"; ADR 0008 for the grid's cells on phone-webkit

## Context

On a 390 phone the answer grid fills most of the screen. With cells at `touch-action: none`, a swipe to scroll the page over the grid marked hours instead (owner report, 2026-09-29): the scroll trap the brief names as When2meet's worst failure.

## Decision

- Cells take `touch-action: manipulation`, so a swipe that starts on a cell scrolls the page, and the dates sideways when there are more than four
- A touch pointer starts a stroke only after a 300 ms hold within 8 px of where it went down; a finger that moves farther first is dropped and paints nothing. Once the hold engages, the first cell shows the stroke's existing preview look, and the grid cancels every `touchmove` until the finger lifts, so the page stays still while it paints
- A hold that lifts on its first cell toggles that cell, as a tap does, because a long press may not fire `click`
- Mouse and pen paint at once, as before. A tap, the keyboard, the date and hour headers and the results grid do not change
- The hint's second sentence follows the pointer through `pointer-coarse:`: "Przytrzymaj, żeby przeciągnąć." on touch, "Możesz przeciągnąć." with a fine pointer
- On phone-webkit, where Playwright cannot move a touch, the hold is proven with dispatched pointer and `touchmove` events: a move before the hold paints nothing and is not cancelled, a move after it paints and is cancelled. Native scrolling is proven on phone-chromium through CDP

## Consequences

- Setting cells back to `touch-action: none`, or starting a touch stroke on `pointerdown`, brings the scroll trap back and undoes this decision
- The `touchmove` listener must stay non-passive; a passive one cannot stop the page scrolling under a hold
- e2e paints on phone-chromium through `touchHoldDrag`; `touchDrag` is a swipe
