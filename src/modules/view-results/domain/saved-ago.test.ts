import { expect, it } from "vitest";
import { savedAgo } from "./saved-ago";

const now = Date.parse("2030-10-19T18:00:00Z");
const minute = 60_000;

it.each([
  [0, "przed chwilą"],
  [59_000, "przed chwilą"],
  [minute, "1 min temu"],
  [20 * minute, "20 min temu"],
  [59 * minute, "59 min temu"],
  [60 * minute, "1 godz. temu"],
  [5 * 60 * minute, "5 godz. temu"],
  [24 * 60 * minute, "wczoraj"],
  [3 * 24 * 60 * minute, "3 dni temu"],
])("says a save %i ms ago was %s", (ago, line) => {
  expect(savedAgo(now - ago, now)).toBe(line);
});
