# 34: Design token scale for type and spacing

Status: done
Blocked by: 25-create-and-cant-feedback.md, 30-tailwind-landing.md, every ticket 14 to 29

## Parent

`spec/brief.md` ("Type", "Stack (decided)" Styling), `AGENTS.md` ("Styling"), host decision 53. Research: `~/.sandboxes/wpasuj/host-acceptance/research-34.md`.

## Outcome

The theme is a small scale, not one token per place of use: the whole app and landing use `text-xs` … `text-7xl`, spacing on one 4px grid (`p-7` is 28px, `m-0` works), a handful of tracking and leading steps, and lint refuses any bracketed size, spacing or tracking. A designer reading `tokens.css` sees the system in one screen.

## Scope

- Type scale in `tokens.css`, each with its paired line height, Tailwind's names: `xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28, `xl` 20/28, `2xl` 24/32, `3xl` 30/36, `4xl` 40/44, `5xl` 48/52, `6xl` 60/62, `7xl` 72/72 (owner, at sign-off: the landing hero and final call on desktop). Phone and desktop sizes through responsive variants (`text-3xl lg:text-4xl`), no `-desktop` tokens. Remove every role-named `--text-*` token (decisions 50 superseded)
- Spacing: one `--spacing: 4px`; remove `--spacing-1` … `--spacing-10`, `--spacing-cell-gap`, `--spacing-target`, `--spacing-cell`, `--spacing-button` (44, 48, 52 are `11`, `12`, `13`; 6 is `1.5`); `--container-*` tokens for the page widths now bracketed (720, 1280)
- `--tracking-*` for the display tracking now bracketed (−0.01 to −0.035em), `--leading-*` only if a size needs another line height
- Every caller rounded onto the scale; the mapping table (old value → new step) in the pull request body, including the brief's type table rewritten as scale steps in `spec/brief.md` "Type"
- Lint through `@shadcn/lint` (0.2.0, ESLint plugin, Tailwind v4, no shadcn components needed; owner request): `no-arbitrary-values`, `no-raw-colors`, `no-inline-styles` (the Open Graph image is exempt: Satori takes only inline styles), `no-restyle` with `settings.shadcn.componentImports` pointing at `@/shared/ui/*` so callers do not restyle shared components through `className`, `require-static-classes`. One tool per rule: where it overlaps `eslint-plugin-better-tailwindcss` (`no-unknown-classes`, the bracket rules), keep the one that reads the theme correctly, proven by a probe, and remove the other. Allowed brackets stay only for selectors (`data-[…]`, `has-[…]`)
- `cn()` in `src/shared/ui/cn.ts` (`clsx` plus `tailwind-merge`, as shadcn/ui ships it; owner request): every conditional or combined class list goes through it instead of template strings and `.join(" ")` (6 today, e.g. `landing.tsx`, `story.tsx`); `settings.shadcn` class functions and `better-tailwindcss` read `cn` so its arguments are linted; `tailwind-merge` extended with the theme's scale only if the defaults mis-merge a probe
- `AGENTS.md` Styling rewritten around the scale

## Out of scope

- Colours, radii, shadows, motion: already a small named set
- Layout or copy changes beyond the rounding

## Acceptance criteria

- [x] `tokens.css` holds only the scale above plus colours, radii, shadows, motion; grep finds no role-named `--text-*` and no `--spacing-<name>` Evidence: `src/app/tokens.css` has colours, `--spacing`, `--container-*`, radii, shadows, fonts, `--text-xs` … `--text-6xl`, `--tracking-*`, `--leading-none`, weights, breakpoint, motion; no `--text-<role>` or `--spacing-<name>`.
- [x] `grep -rE "(text|p|m|gap|h|w|size|tracking|leading)[a-z]*-\[[0-9.-]+(px|em|rem)\]" src` finds nothing; a probe with `mt-[6px]` and `text-[15px]` fails lint (output in the pull request body) Evidence: the grep prints nothing; the probe output is in the pull request body.
- [x] Every screen at 390 and 1440 beside its base screenshot, each difference over 0.5% listed with the rounding that caused it; the owner signs off the table Evidence: the per-screen table and rounding table in the pull request body, side-by-side images in the task's `browser/t34-rounding/`. The owner's sign-off is given on the pull request.
- [x] Probes fail lint, output in the pull request body: `mt-[6px]`, `text-[15px]`, `bg-[#f00]`, `style={{ color: "red" }}` outside the Open Graph image, `className="p-8"` on a shared `Button`, a class built by string concatenation, a template-string `className` Evidence: probe output in the pull request body, all seven fail.
- [x] `lint`, `typecheck`, `test`, `knip`, `build` and `e2e` green with the same counts as the base Evidence: all green; test 59 files/374 (base 58/371 plus `cn.test.ts`), e2e 137 passed/25 skipped as on base `3c0a096`; WebKit runs in CI.

## Notes

The rounding moves some text by 1–2px (13 → 12 or 14, 15 → 14 or 16, 19 → 18 or 20, 22 → 20 or 24) and 3px gaps to 4px; that visible drift is the point of the ticket, which is why the owner signs off the table rather than the 0.5% rule.
