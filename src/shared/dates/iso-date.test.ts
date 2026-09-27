import { expect, it } from "vitest";
import { addDays, todayIn } from "./iso-date";

it("adds days across a month end", () => {
  expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
});

it("today is the date the clock shows in the given zone", () => {
  const lateEveningInWarsaw = new Date("2026-10-17T22:30:00Z");

  expect(todayIn("Europe/Warsaw", lateEveningInWarsaw)).toBe("2026-10-18");
  expect(todayIn("America/New_York", lateEveningInWarsaw)).toBe("2026-10-17");
});
