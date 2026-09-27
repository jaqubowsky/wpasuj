import { describe, expect, it } from "vitest";
import { heatCellOf, heatOf } from "./heat";

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

describe("heatCellOf", () => {
  const respondents = [
    { name: "Ola", slots: [{ date: "2030-10-19", hour: 18 }, { date: "2030-10-19", hour: 19 }] },
    { name: "Bartek", slots: [{ date: "2030-10-19", hour: 18 }] },
    { name: "Kasia", slots: [{ date: "2030-10-19", hour: 18 }] },
  ];
  const best = { date: "2030-10-19", firstHour: 18, lastHour: 19, free: ["Ola", "Bartek", "Kasia"] };

  it("counts who is free, marks everyone and the best time", () => {
    expect(heatCellOf(respondents, { date: "2030-10-19", hour: 18 }, best)).toEqual({ count: 3, heat: 5, everyone: true, best: true });
  });

  it("gives an hour some can make its heat without the marks", () => {
    expect(heatCellOf(respondents, { date: "2030-10-19", hour: 19 }, best)).toEqual({ count: 1, heat: 2, everyone: false, best: false });
  });

  it("leaves an hour nobody can make empty", () => {
    expect(heatCellOf(respondents, { date: "2030-10-20", hour: 18 })).toEqual({ count: 0, heat: 0, everyone: false, best: false });
  });
});
