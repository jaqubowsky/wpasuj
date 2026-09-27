import { expect, it } from "vitest";
import { hourLabel, longRunLabel } from "./time-label";

const run = { date: "2030-10-19", firstHour: 19, lastHour: 22 };

it("names the best time in full", () => {
  expect(longRunLabel(run)).toBe("Sobota 19.10, 19–22");
});

it("names one hour of one date", () => {
  expect(hourLabel({ date: "2030-11-03", hour: 9 })).toBe("Niedziela 3.11, 9:00");
});
