# ADR 0020: Creating a poll does not share

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** owner; host (flag location)
- **Replaces:** `create-no-share` (former decision entries)

## Context

WebKit drops the user activation after the awaited create action, so `navigator.share` there failed on iOS.

## Decision

The create button reads "Tworzę ankietę…" with a spinner from the tap; the form moves to the poll with a one-shot `sessionStorage` flag (`src/shared/fresh-poll.ts`, not a URL), read during render and forgotten after commit, because a render the router discards must not eat it. The flag lives in `shared` as `last-name` does: a device-local value written by create and read by the poll page (review of PR #34). Sharing starts from its own tap on the poll page (WPA-34).

## Consequences

Calling `navigator.share` after the create action fails on iOS again; forgetting the flag during render loses it on a discarded render.
