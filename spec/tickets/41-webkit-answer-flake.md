# 41: WebKit answer saves fail on CI

Status: claimed
Blocked by: 23-landing-seo-perf.md (its ac68b66 uploads `test-results/` with traces on an e2e failure)

## Parent

`spec/brief.md` "Answering" (a tap saves, a failed save says so); `AGENTS.md` "Testing".

## Outcome

`phone-webkit` e2e passes on CI on the first attempt, run after run, and the cause is named: a save that really fails on WebKit is fixed in the product, a test race is fixed in the test.

## Scope

- Known (ticket 23, run 36395365559): `answer-poll.spec.ts:86` on `phone-webkit` ends in "Nie zapisano" on both attempts; main fails `answer-poll` WebKit tests on the first attempt in runs 36391203725, 36390892554, 36386911369. The server log shows no action error, so `saveAnswer` rejects in the browser; once create failed the same way. No rate limit or `secure` cookie in `src/`. WebKit runs last in the job, and the check job was killed with exit 143 several times this week (unverified link: a starved runner)
- Evidence first: the failing test's trace from the `test-results` artifact, and a local WebKit run in the container; WebKit comes into the container image through the harness overlay's prepare command, not a download at run time
- The fix where the cause is, red then green

## Out of scope

- Raising retries, skipping or tagging the test; the CI job layout (ticket 39)

## Acceptance criteria

- [x] The cause, with the trace or log line that shows it, in the PR body: PR #47, "Cause" (run 36398271419 traces, React `initInput` hydration branch)
- [x] A test that fails for that cause before the fix and passes after it: `input.test.tsx` "keeps what was typed before the page hydrated" and `create-poll.spec.ts` "what the organiser types before the page hydrates still creates the poll", both red without the fix
- [x] Three consecutive CI runs on the PR head with `phone-webkit` passing on the first attempt (run links in the PR body): 1 of 3. Host decision: the runs are PR #47's run 36401661625, main's push run after the merge and PR #39's run after it merges main. Run 36401661625: every answer and create test passed on phone-webkit on the first attempt; `poll-page.spec.ts:156` failed once in fixture setup ("trace recording" timeout of 30000ms) and passed on retry
- [x] `lint`, `typecheck`, `test`, `knip`, `build`, `e2e` green: locally (e2e Chromium projects, 176 passed) and CI run 36401661625
