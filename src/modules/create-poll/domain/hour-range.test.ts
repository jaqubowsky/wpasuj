import { describe, expect, it } from "vitest";
import { endBounds, hourRanges, startBounds, withEnd, withStart } from "./hour-range";

describe("part of day", () => {
  it("Wieczór is 17 to 23 and Cały dzień 10 to 23", () => {
    expect(hourRanges.evening).toEqual({ firstHour: 17, lastHour: 23 });
    expect(hourRanges["all-day"]).toEqual({ firstHour: 10, lastHour: 23 });
  });
});

describe("Własne", () => {
  it("starts from 0 to 23 and ends from start+1 to 24", () => {
    expect(startBounds).toEqual({ min: 0, max: 23 });
    expect(endBounds({ firstHour: 9, lastHour: 12 })).toEqual({ min: 10, max: 24 });
  });

  it("a start that reaches the end pushes the end one hour later", () => {
    expect(withStart({ firstHour: 17, lastHour: 18 }, 18)).toEqual({ firstHour: 18, lastHour: 19 });
  });

  it("a start before the end keeps the end", () => {
    expect(withStart({ firstHour: 17, lastHour: 23 }, 16)).toEqual({ firstHour: 16, lastHour: 23 });
  });

  it("the start stays within 0 to 23 and the end within start+1 to 24", () => {
    expect(withStart({ firstHour: 0, lastHour: 5 }, -1)).toEqual({ firstHour: 0, lastHour: 5 });
    expect(withStart({ firstHour: 23, lastHour: 24 }, 24)).toEqual({ firstHour: 23, lastHour: 24 });
    expect(withEnd({ firstHour: 17, lastHour: 18 }, 17)).toEqual({ firstHour: 17, lastHour: 18 });
    expect(withEnd({ firstHour: 17, lastHour: 24 }, 25)).toEqual({ firstHour: 17, lastHour: 24 });
  });
});
