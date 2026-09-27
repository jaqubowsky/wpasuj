import { expect, it } from "vitest";
import { fitsPoll } from "./poll-rules";

const poll = { dates: ["2026-10-16", "2026-10-17"], firstHour: 17, lastHour: 23 };

it("a final time fits when its date is offered and its hours sit inside the poll's range", () => {
  expect(fitsPoll(poll, { date: "2026-10-17", firstHour: 17, lastHour: 23 })).toBe(true);
  expect(fitsPoll(poll, { date: "2026-10-18", firstHour: 19, lastHour: 22 })).toBe(false);
  expect(fitsPoll(poll, { date: "2026-10-17", firstHour: 16, lastHour: 22 })).toBe(false);
  expect(fitsPoll(poll, { date: "2026-10-17", firstHour: 19, lastHour: 24 })).toBe(false);
});
