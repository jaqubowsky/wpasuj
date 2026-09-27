# 33: Architecture gates in lint, hooks and CI

Status: ready-for-agent
Blocked by: 26-tailwind-base.md

## Parent

`spec/brief.md` ("Code rules"), `AGENTS.md` ("Module layout"), host decision 49 in `spec/decisions.md`.

## Outcome

A change that breaks the module layout or leaves dead code fails before it reaches review: on commit for the files it touches, on push for the whole tree, and in CI for every pull request. Agents get the verdict from the tool, not from the host's acceptance.

## Scope

- X axis, inside a module (extends ticket 13's rule): `domain/` imports only `domain/` (type-only from `server/` stays until ticket 32 judges it); `server/` never imports `ui/`
- Y axis, between slices: a module never imports another module (no module-to-module edge); `src/app` imports a module only through `index.ts` or `client.ts`, never a deep path; `src/shared` imports neither `src/modules` nor `src/app`. Plain `no-restricted-imports` in `eslint.config.mjs`, one block generated per module folder; no new plugin unless that fails a named case
- `knip` for unused files, exports and dependencies, config in `knip.json` (Next.js and Playwright entry points), `npm run knip`; every finding it reports on the current tree removed or ignored with a reason
- Hooks through `husky` and `lint-staged`: pre-commit runs `eslint` on staged files; pre-push runs `typecheck`, `knip` and `test`. `e2e` stays in CI only
- CI: a `npm run knip` step in the `check` job
- `AGENTS.md` Scripts: `npm run knip` and the hooks, one line each

## Out of scope

- Deletability measurement (delete a module folder, count errors): ticket 32
- Behaviour or visual changes: none

## Acceptance criteria

- [ ] Four deliberate violations (module importing another module, `app` deep-importing a module's `ui/`, `shared` importing a module, `domain` importing React) each fail `npm run lint`; the output is in the pull request body, the probes not committed
- [ ] An unused export added on purpose fails `npm run knip`; output in the pull request body
- [ ] A commit with a lint error is refused by the pre-commit hook; a push with a failing unit test is refused by the pre-push hook; both outputs in the pull request body
- [ ] CI runs `knip` and is green; `lint`, `typecheck`, `test`, `build` and `e2e` green with the same counts as the base
