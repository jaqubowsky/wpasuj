import { describe, expect, it } from "vitest";
import { hourLabel, longRunLabel, runParts, setTimeShown } from "./time-label";

const run = { date: "2030-10-19", firstHour: 19, lastHour: 22 };

it("names the best time in full", () => {
  expect(longRunLabel(run)).toBe("Sobota 19.10, 19–22");
});

it("splits the best time into its day and its hours, so the hours stay on one line", () => {
  expect(runParts(run)).toEqual({ day: "Sobota 19.10", hours: "19–22" });
});

it("names one hour of one date", () => {
  expect(hourLabel({ date: "2030-11-03", hour: 9 })).toBe("Niedziela 3.11, 9:00");
});

it("names a run past midnight by the clock under the evening's date", () => {
  expect(longRunLabel({ date: "2030-10-18", firstHour: 23, lastHour: 26 })).toBe("Piątek 18.10, 23–2");
  expect(longRunLabel({ date: "2030-10-18", firstHour: 22, lastHour: 24 })).toBe("Piątek 18.10, 22–24");
});

it("names an hour or a run that starts after midnight by its calendar date", () => {
  expect(hourLabel({ date: "2030-10-18", hour: 25 })).toBe("Sobota 19.10, 1:00");
  expect(longRunLabel({ date: "2030-10-18", firstHour: 25, lastHour: 27 })).toBe("Sobota 19.10, 1–3");
});

describe("setTimeShown", () => {
  it("names the day and the hours", () => {
    expect(setTimeShown({ date: "2030-10-19", firstHour: 19, lastHour: 21 })).toEqual({
      weekday: "Sobota",
      day: "19 października",
      hours: "19:00–21:00",
    });
  });

  it("names the calendar date of a time that starts after midnight", () => {
    expect(setTimeShown({ date: "2030-10-18", firstHour: 25, lastHour: 27 })).toEqual({
      weekday: "Sobota",
      day: "19 października",
      hours: "1:00–3:00",
    });
  });

  it("keeps the evening's date for a time that crosses midnight", () => {
    expect(setTimeShown({ date: "2030-10-18", firstHour: 23, lastHour: 25 })).toEqual({
      weekday: "Piątek",
      day: "18 października",
      hours: "23:00–1:00",
    });
  });
});
