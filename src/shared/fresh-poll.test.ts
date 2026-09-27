import { beforeEach, expect, it } from "vitest";
import { forgetFreshPoll, isFreshPoll, markFreshPoll } from "./fresh-poll";

beforeEach(() => {
  sessionStorage.clear();
});

it("reports a poll created on this tab until it is forgotten", () => {
  markFreshPoll("abcdefghij");

  expect(isFreshPoll("abcdefghij")).toBe(true);
  expect(isFreshPoll("abcdefghij")).toBe(true);
  forgetFreshPoll("abcdefghij");
  expect(isFreshPoll("abcdefghij")).toBe(false);
});

it("keeps one poll's mark from another", () => {
  markFreshPoll("abcdefghij");

  expect(isFreshPoll("klmnopqrst")).toBe(false);
});
