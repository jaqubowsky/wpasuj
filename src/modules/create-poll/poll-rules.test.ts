import { expect, it } from "vitest";
import { cleanupCutoff, fitsPoll, hasPastDate, isPastDate } from "./poll-rules";

const poll = { dates: ["2026-10-16", "2026-10-17"], firstHour: 17, lastHour: 23 };

it("a final time fits when its date is offered and its hours sit inside the poll's range", () => {
  expect(fitsPoll(poll, { date: "2026-10-17", firstHour: 17, lastHour: 23 })).toBe(true);
  expect(fitsPoll(poll, { date: "2026-10-18", firstHour: 19, lastHour: 22 })).toBe(false);
  expect(fitsPoll(poll, { date: "2026-10-17", firstHour: 16, lastHour: 22 })).toBe(false);
  expect(fitsPoll(poll, { date: "2026-10-17", firstHour: 19, lastHour: 24 })).toBe(false);
});

it("a date before today is past, today is not", () => {
  expect(isPastDate("2026-10-14", "2026-10-15")).toBe(true);
  expect(isPastDate("2026-10-15", "2026-10-15")).toBe(false);
  expect(hasPastDate(["2026-10-15", "2026-10-16"], "2026-10-15")).toBe(false);
  expect(hasPastDate(["2026-10-14", "2026-10-16"], "2026-10-15")).toBe(true);
});

it("cleanup keeps 60 days after the last date, counted where the date changes last", () => {
  const lateMorningInLondon = new Date("2026-12-01T11:00:00Z");

  expect(cleanupCutoff(lateMorningInLondon)).toBe("2026-10-01");
});
