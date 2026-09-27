import { expect, it } from "vitest";
import { dayNumber, fullDate, monthOnFirstDay, shortWeekday, summaryOfDates } from "./format";

it("names a date by its short Polish weekday and day number", () => {
  expect(shortWeekday("2026-10-12")).toBe("pn");
  expect(shortWeekday("2026-10-15")).toBe("cz");
  expect(shortWeekday("2026-10-18")).toBe("nd");
  expect(dayNumber("2026-10-05")).toBe("5");
});

it("spells a date in full for screen readers", () => {
  expect(fullDate("2026-10-17")).toBe("sobota, 17 października");
});

it("lists dates with the month once per run of the same month", () => {
  expect(summaryOfDates(["2026-10-16", "2026-10-17", "2026-10-18"])).toBe("pt 16, sb 17, nd 18 października");
  expect(summaryOfDates(["2026-10-31", "2026-11-01"])).toBe("sb 31 października, nd 1 listopada");
});

it("names the month only on its first day", () => {
  expect(monthOnFirstDay("2026-11-01")).toBe("lis");
  expect(monthOnFirstDay("2026-11-02")).toBeUndefined();
});
