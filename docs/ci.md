# CI, hooks and Dependabot

What runs on a pull request and on a commit, and how each tool is updated. ADR 0017 lists which rules each gate holds and which only review holds.

## `ci.yml`

Runs on every pull request and every push to `main`.

- `changes` diffs the event's base against `HEAD` without `*.md`. When nothing else changed, every other job reports success without its work, so the required checks never wait on a skipped workflow. A new job needs `changes` and the same gate (ADR 0042)
- `quick` runs `actionlint` and `zizmor` over `.github/`, then `npm audit signatures`, lint, semgrep, typecheck, knip and test
- `coverage`, on pull requests only, runs `npm test` again and fails when under 80% of the changed `src/` lines that coverage counts are covered (`diff-cover`, ADR 0041). It annotates each uncovered line and writes the report to the job summary
- `build` uploads the standalone build
- `e2e` is a matrix that runs each Playwright project in its own job on that build and uploads `screenshots-<project>` and `memory-<project>` (memory sampled every 5 s by `.github/scripts/memory-monitor.sh`)
- `perf` reuses the build
- `docker` builds and runs the image, answers a poll against it, restarts it, reads the answer back from the volume, and fetches the poll's card

## Other workflows

Each runs on every pull request.

- `dependency-review.yml`: GitHub's `dependency-review-action` fails on a high or critical advisory in a dependency the pull request adds or changes, runtime and development alike, since a dev dependency runs in CI
- `codeql.yml`, also weekly on `main`, analyses `javascript-typescript` and `actions` with the `security-extended` suite, uploads the results to code scanning, and fails its job on any open high or critical alert on the pull request's ref. The host's wait reads workflow runs, not the CodeQL check run code scanning adds. A false positive is dismissed in the Security tab with a reason, which clears it on every branch
- `gitleaks.yml` scans the pull request's commits (`base..head`) with gitleaks

Secret scanning and push protection are repository settings the owner keeps on.

## Workflow checks and pinning

- `actionlint` checks syntax, expressions and shellcheck of `run:`; `zizmor` checks template injection, `permissions`, unpinned `uses:` and the Dependabot cooldown. Both fail on any finding. Run them locally with the same `docker run` lines from `ci.yml`, adding `--offline` to zizmor without a GitHub token
- Actions are pinned to a commit SHA with a `# vX.Y.Z` comment that Dependabot updates
- The actionlint, zizmor, gitleaks and semgrep images are pinned by digest and, with `diff-cover`, bumped by hand: Dependabot does not see them

## Dependabot

`.github/dependabot.yml` opens one grouped pull request a week per ecosystem, npm and GitHub Actions, with the minor and patch updates.

- A major comes as its own pull request so its changelog is read first, except the ignored ones:
  - `@types/node`: the runtime stays on Node 24
  - `eslint`: until `eslint-plugin-react` and `eslint-plugin-jsx-a11y` support ESLint 10
  - `typescript`: until a `typescript-eslint` release includes TypeScript 7 in its peer range and Next.js type checking supports TypeScript 7's JavaScript API
- Every pre-1.0 package comes as its own pull request too; a new `0.x` dependency joins the group's `exclude-patterns`
- Every version update, majors included, waits until its release is 7 days old (`cooldown`)
- CI on that pull request is the merge check
- Security updates come as soon as GitHub has them, once the repository setting is on

## Hooks

husky. `AGENTS.md` "Gotchas" says where they run and in which order, and how to install them under `ignore-scripts`; "Code rules" says how a clone joins the baseline.

- pre-commit runs `lint-staged` on staged files: `prettier --write` (Tailwind class order through its plugin, config in `.prettierrc.json`), then `eslint --fix`, fixing them in place. The padding rule is `@stylistic/padding-line-between-statements`, which `npm run lint` also checks in CI
- pre-push runs `typecheck`, `knip`, `duplicates` and `test`
- `npm run format` runs Prettier over the whole repository
- `npm run duplicates` fails on a clone missing from `.jscpd-baseline.json`
