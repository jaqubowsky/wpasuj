# ADR 0019: Tailwind's scale, not role tokens

- **Status:** Accepted
- **Date:** 2026-09-27
- **Owner:** owner
- **Replaces:** `tailwind-scale` (former decision entries)

## Context

Role-named type tokens (one per place of use) grew with every screen.

## Decision

Type uses Tailwind's scale `text-xs` … `text-7xl` with paired line heights; spacing is one `--spacing: 4px` grid; tracking and container widths are tokens; lint refuses bracketed sizes. No semantic alias layer: the app has one theme and ~10 steps, so an alias earns its place only when two callers must move together. `@shadcn/lint` (pinned, 0.2.0) fails arbitrary values, raw colours, inline styles, restyling shared components and dynamic classes; one tool per rule where it overlaps better-tailwindcss. Class lists combine through `cn()` (`clsx` + `tailwind-merge`), never template strings (WPA-41).

## Consequences

A new role token or bracketed size goes against an owner decision; `AGENTS.md`, "Styling", carries the working rules.
