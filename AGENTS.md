# Wpasuj

A no-account availability poll for a group of friends: one link in the group chat, everyone taps the hours they are free, the app shows the time that works for most of them. `spec/brief.md` holds the owner's product requirements and wins over taste and over mockups.

## Commands

A change passes every script below. One unit test: `npx vitest run <path>`; one end-to-end spec: `npx playwright test <path>`.

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run knip`
- `npm run duplicates`
- `npm run semgrep` (Docker)
- `npm test`
- `npm run build`
- `npm run e2e`, in CI only

## Gotchas

- One long-lived process owns the SQLite file and runs the expired-poll cleanup timer (ADR 0039): nothing may assume a serverless or edge runtime, or a second process
- No Tailwind preflight is loaded, so browser defaults (heading margins, `box-sizing: content-box`) hold: add `m-0` or `box-border` where the box would change, and drop a declaration the element already inherits
- Utilities are unlayered: against a plain `<name>.css` rule they win or lose by specificity
- Lint misses a `(--name)` shorthand whose variable is gone: grep `src/app/tokens.css` before writing one
- `scale-*` sets the CSS `scale` property, which the reduced-motion rule (`transform: none`) does not reach; that is why a scale sits behind `motion-safe:`
- `npm audit signatures` (CI `quick`) aborts on the first provenance attestation the registry answers 404 for: move the lockfile to a version whose attestation resolves (`npm update <name>`)
- Prettier and jscpd run only in git hooks, never in CI. Where npm runs with `ignore-scripts`, run `npx husky` once after install. pre-commit runs Prettier, then `eslint --fix`, because Prettier's wrapping can create statements that need a padding line

## Code rules

The full list is `spec/brief.md`, "Code rules"; ADR 0017 says which a tool gates.

- A module in `src/modules/` has `domain/` (pure functions, nothing from React, `server/` or `ui/`), `server/` (schemas, queries, actions, the only I/O) and `ui/` (components, hooks); `index.ts` (server) and `client.ts` (client) are its only public entries
- A server action reads parse, guard, store, result: `parse(schema, input)` and each guard (`organisersPoll`, `livePoll`, `openPoll`) return a `Result` from `src/shared/result.ts`, the action goes on with `if (!found.ok) return found;` per step and ends in `ok(…)` or `fail("<reason>")`. The UI maps a reason in a `switch` whose `default` returns it `satisfies never`
- One `<name>-store.ts` per module that reads the database holds every `getDb()` call and `drizzle-orm` import, its live-poll lookup included: a copy per module, no shared repository
- Review alone holds the rest: no business rule in an action, a component or `src/shared`; UI logic in hooks; no helper with one caller; copy domain code, share technical code. A clone copied on purpose joins `.jscpd-baseline.json` through `npm run duplicates -- --update-baseline`

## Styling

Tailwind v4 utilities inline in `className`, only on the theme in `src/app/tokens.css`. Lint holds the scale, the tokens and how classes combine; these it leaves to you:

- A length the scale has no step for, or a new bracket in lint's `allow` list, is a design question for the host
- A look reused across product screens is a component (`PageFrame`), never an exported class string
- CSS `className` cannot carry goes in a plain `<name>.css` beside its component

## Testing

- Red, then green: every behaviour starts as a failing test that is run and seen failing for the right reason
- Units and components sit beside their code as `*.test.ts(x)`; end to end lives in `e2e/`
- Action tests use a real SQLite file per test with `cookies()` stubbed; only the clock, cookies and true externals are stubbed
- A pull request that adds or changes a screen or state saves it at 390 and 1440 with `saveScreenshot` from `e2e/screenshot.ts` (output gitignored); its body lists each screen beside the mockup (`spec/design/v2/`) or design-system parts (`spec/design/system/`) it was compared with

## Work

- Work lives in the Linear team the project overlay names: one issue per ticket, one pull request per issue against `main`. The host plans there and decides what the brief leaves open
- A decision a later change could undo unknowingly is an ADR in `docs/adr/` (`NNNN-<slug>.md`, the next number, the format of the ADRs there), proposed in the pull request that needs it; a decision that shapes only one issue's work goes into that issue
- Done means a pull request with CI green for the host to merge; containers never merge
- CodeRabbit is advisory, never a gate: its free plan is rate-limited, it skips Dependabot's pull requests and reviews a later push only on `@coderabbitai review`. When its review arrives before `ready-for-host`, a container answers each comment with a fix or a reply giving the reason; it never waits for one

## Pointers

- Changing CI, a workflow, a hook, a gate or Dependabot: `docs/ci.md`
- Logs, usage events, health check, deploy, Railway, routes and cookies: `docs/operations.md`
- Tokens, the scale, why a styling lint rule exists, plain CSS beside a component: `docs/styling.md`
- Reversing or questioning a decision: `docs/adr/`
- Building or changing a screen: `spec/design/v2/` (mockups), `spec/design/system/` (parts)
