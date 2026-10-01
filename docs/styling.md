# Styling

Tailwind v4 utilities written inline in `className`; `src/app/` is the reference (`app-header.tsx`, `e/[id]/not-found.tsx`). `AGENTS.md` "Gotchas" holds the traps; this file holds the scale and the reason behind each lint rule.

## The scale

`src/app/tokens.css` is the `@theme static` with the default theme reset: a small scale, not one token per place of use. It holds the only colours, radii, shadows, fonts, weights, breakpoint (`lg:` = 1024px), easings and durations, plus:

- type: `text-xs` … `text-9xl`, each with its paired line height (the table in `spec/brief.md`, "Type"). A desktop size is a responsive variant (`text-3xl lg:text-4xl`); `leading-none` (static in Tailwind) and a spacing step (`leading-3.5` is 14px) are the only other line heights
- spacing: one `--spacing: 4px`, so every spacing and size utility is a multiple of 4px: `p-7` is 28px, `h-13` is 52px, `gap-1.5` is 6px, `m-0` works. Any half step (`1.5`, `8.5`) is a 2px offset; a value off both rounds to the nearest 4px
- tracking: `tracking-tight` (−0.01em), `tracking-tighter` (−0.02em), `tracking-tightest` (−0.03em)
- container widths: `max-w-narrow` (720px), `max-w-wide` (1280px), and `@grid-fit:` / `@max-grid-fit:` (600px) for the day-hour grid's container query
- durations have no Tailwind namespace: `duration-(--duration-fill)`

## What lint refuses, and why

- `shadcn/no-arbitrary-values` refuses a bracketed size, spacing, type or tracking (`mt-[6px]`, `text-[15px]`, `[font-size:84px]`). Its `allow` list in `eslint.config.mjs` names the brackets that stay. Selector brackets (`data-[…]:`, `has-[…]:`, `@min-[600px]:`) are variants, not values, and stay free
- Colours come only from tokens: `shadcn/no-raw-colors` and `no-arbitrary-values` reject `bg-[#f00]`, `bg-[red]` and palette classes. A colour inside a shadow is `var(--color-…)`; `better-tailwindcss/no-restricted-classes` refuses a raw one
- `better-tailwindcss/no-unknown-classes` fails anything the theme cannot generate (`text-8xl`, `md:`, a removed token)
- No inline `style` except CSS custom properties (`style={{ "--date-count": n }}` read by `grid-cols-[repeat(var(--date-count),…)]`). The link-preview card, the landing card and the apple icon are exempt because Satori reads only inline styles
- Shared components in `src/shared/ui/` own their look: `shadcn/no-restyle` rejects `className` on them
- Class lists combine through `cn()` from `@/shared/ui/cn` (`clsx` plus `tailwind-merge` taught the theme's names); lint rejects a template string, `+` or `.join()` in `className`
- A `scale-` class needs `motion-safe:`: a press scale is `motion-safe:active:scale-97`

## Reuse and plain CSS

- The `dev/` demo pages keep their own copy of a look a product component (`PageFrame`) owns
- CSS that `className` cannot carry (rules on DOM another module renders, `:has()` layouts, `@keyframes` the ticket keeps out of the theme) goes in a plain `<name>.css` beside its component, selected by `data-*` attributes, with tokens through `var(--color-…)` and `calc(var(--spacing) * n)`: `src/shared/ui/sheet/sheet.css`. Plain CSS is global, so every attribute and keyframe name there carries the owner's prefix (`data-sheet`, `sheet-up`); a state on the component's own DOM is a `data-[…]:` utility instead
- Token names inside `var()`: `--color-<name>`, `--spacing` (a step is `calc(var(--spacing) * n)` in plain CSS, `--spacing(n)` inside a Tailwind bracket), `--text-<step>` with `--text-<step>--line-height`, `--tracking-*`, `--container-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--duration-*`, `--font-sans`, `--font-display`
