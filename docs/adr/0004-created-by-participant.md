# ADR 0004: What created_by_participant means

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** host
- **Replaces:** `created-by-participant` (former decision entries)

## Context

The brief tracks whether a poll was created by someone who had already answered another poll, and leaves open how the server knows.

## Decision

`created_by_participant` is true when the create request carries any cookie that is a valid participant token of another poll.

## Consequences

A change to cookie names or token checks changes this metric silently; its tests sit beside the create action.
