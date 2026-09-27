import { expect, it } from "vitest";
import { heatOf } from "./heat";

it.each([
  [0, 5, 0],
  [1, 5, 1],
  [2, 5, 2],
  [3, 5, 3],
  [4, 5, 4],
  [5, 5, 5],
  [1, 6, 1],
  [2, 6, 2],
  [3, 6, 3],
  [4, 6, 4],
  [5, 6, 5],
  [1, 3, 2],
  [2, 3, 4],
  [1, 1, 5],
])("gives %i free of %i respondents heat %i", (free, respondents, heat) => {
  expect(heatOf(free, respondents)).toBe(heat);
});

it("has no heat while nobody answered", () => {
  expect(heatOf(0, 0)).toBe(0);
});
