import { describe, expect, it } from "vitest";
import { defaultRange, endHours, hoursOf, rangeSummary, startHours, withEnd, withStart, withTiles } from "./hour-range";

describe("range", () => {
  it("starts as the evening, 17:00 to 23:00", () => {
    expect(defaultRange).toEqual({ firstHour: 17, hourCount: 6 });
  });

  it("22:00 to 4:00 is 6 hours", () => {
    expect(withEnd(withStart(defaultRange, 22), 28)).toEqual({ firstHour: 22, hourCount: 6 });
    expect(rangeSummary({ firstHour: 22, hourCount: 6 })).toBe("22:00 → 4:00 · 6 godzin");
  });

  it("0:00 to 24:00 is 24 hours", () => {
    expect(withEnd(withStart(defaultRange, 0), 24)).toEqual({ firstHour: 0, hourCount: 24 });
    expect(rangeSummary({ firstHour: 0, hourCount: 24 })).toBe("0:00 → 0:00 · 24 godziny");
  });

  it("names one hour and a few hours in Polish", () => {
    expect(rangeSummary({ firstHour: 20, hourCount: 1 })).toBe("20:00 → 21:00 · 1 godzina");
    expect(rangeSummary({ firstHour: 20, hourCount: 3 })).toBe("20:00 → 23:00 · 3 godziny");
  });

  it("a new start keeps the length", () => {
    expect(withStart({ firstHour: 17, hourCount: 6 }, 22)).toEqual({ firstHour: 22, hourCount: 6 });
  });

  it("counts hours past midnight on the evening's date", () => {
    expect(hoursOf({ firstHour: 22, hourCount: 6 })).toEqual([22, 23, 24, 25, 26, 27]);
  });
});

describe("Od and Do", () => {
  it("offers starts from 6:00 round to 5:00", () => {
    expect(startHours).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5]);
  });

  it("offers ends from one hour after the start round to the same hour next day", () => {
    const ends = endHours({ firstHour: 22, hourCount: 6 });

    expect(ends).toHaveLength(24);
    expect(ends.slice(0, 4)).toEqual([23, 24, 25, 26]);
    expect(ends.at(-1)).toBe(46);
  });
});

describe("hour tiles", () => {
  it("a first and a last tile make the range between them", () => {
    expect(withTiles(22, 3)).toEqual({ firstHour: 22, hourCount: 6 });
    expect(withTiles(16, 20)).toEqual({ firstHour: 16, hourCount: 5 });
  });

  it("a last tile earlier in the order runs on into the next morning", () => {
    expect(withTiles(2, 8)).toEqual({ firstHour: 2, hourCount: 7 });
  });

  it("the same tile twice is one hour", () => {
    expect(withTiles(5, 5)).toEqual({ firstHour: 5, hourCount: 1 });
  });
});
