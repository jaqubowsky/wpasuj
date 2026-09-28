# ADR 0018: Landing loading and its performance gate

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** host; owner (`landing-perf-gate`)
- **Replaces:** `landing-story-pin`, `landing-perf-gate` (former decision entries)

## Context

The landing's story and demo are heavy, and the landing's perf gate runs on shared GitHub runners.

## Decision

- The story pins from 1280px: the canvas columns (200 + 380 + 2×56 + 2×48) leave the caption 492px only from there; below it, and with reduced motion, it is the still sequence
- A lazy section's anchor id sits on its server-rendered `NearViewport` wrapper (`jak-to-dziala`). Until its chunk loads, the story slot holds 8 screens of height and the demo slot one screen; the demo starts loading 2 screens before it reaches the viewport (WPA-33)
- The perf gate reads the median of 5 cold runs on a throttled phone and fails past LCP 2.5 s, TBT 250 ms or CLS 0.1: the Next/React baseline alone is about 170 ms of TBT on GitHub runners, so 200 ms failed on noise (medians 205 ms)

## Consequences

- A placeholder height that differs from the loaded section shifts the layout and fails CLS
- Tightening TBT below 250 ms makes the gate fail on runner noise
