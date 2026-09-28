import { expect, it } from "vitest";
import { hourLabel, longRunLabel, shortRunLabel } from "./time-label";

const run = { date: "2030-10-19", firstHour: 19, lastHour: 22 };

it("names the best time in full", () => {
  expect(longRunLabel(run)).toBe("Sobota 19.10, 19–22");
});

it("names another good time briefly", () => {
  expect(shortRunLabel({ date: "2030-10-18", firstHour: 18, lastHour: 20 })).toBe("pt 18.10, 18–20");
});

it("names one hour of one date", () => {
  expect(hourLabel({ date: "2030-11-03", hour: 9 })).toBe("Niedziela 3.11, 9:00");
});

it("names a run past midnight by the clock under the evening's date", () => {
  expect(shortRunLabel({ date: "2030-10-18", firstHour: 23, lastHour: 26 })).toBe("pt 18.10, 23–2");
  expect(longRunLabel({ date: "2030-10-18", firstHour: 22, lastHour: 24 })).toBe("Piątek 18.10, 22–24");
  expect(hourLabel({ date: "2030-10-18", hour: 25 })).toBe("Piątek 18.10, 1:00");
});
