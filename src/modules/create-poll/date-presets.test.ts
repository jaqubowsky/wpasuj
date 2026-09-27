import { describe, expect, it } from "vitest";
import { isLit, presetDates, stripDates, toggleDate, togglePreset } from "./date-presets";

const thursday = "2026-10-15";
const saturday = "2026-10-17";
const sunday = "2026-10-18";

describe("presets", () => {
  it("Dziś is today", () => {
    expect(presetDates("today", thursday)).toEqual(["2026-10-15"]);
  });

  it("Jutro is tomorrow, across a month end", () => {
    expect(presetDates("tomorrow", "2026-10-31")).toEqual(["2026-11-01"]);
  });

  it("Ten weekend is this week's Friday to Sunday", () => {
    expect(presetDates("weekend", thursday)).toEqual(["2026-10-16", "2026-10-17", "2026-10-18"]);
  });

  it("Ten weekend on a Friday is Friday to Sunday", () => {
    expect(presetDates("weekend", "2026-10-16")).toEqual(["2026-10-16", "2026-10-17", "2026-10-18"]);
  });

  it("Ten weekend on a Monday is the coming Friday to Sunday", () => {
    expect(presetDates("weekend", "2026-10-12")).toEqual(["2026-10-16", "2026-10-17", "2026-10-18"]);
  });

  it("Ten weekend leaves out the days already past", () => {
    expect(presetDates("weekend", saturday)).toEqual(["2026-10-17", "2026-10-18"]);
    expect(presetDates("weekend", sunday)).toEqual(["2026-10-18"]);
  });

  it("Przyszły tydzień is next Monday to Sunday", () => {
    expect(presetDates("next-week", sunday)).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });

  it("Przyszły tydzień on a Monday starts a week later", () => {
    expect(presetDates("next-week", "2026-10-12")[0]).toBe("2026-10-19");
  });
});

describe("strip", () => {
  it("shows two weeks from this week's Monday", () => {
    const dates = stripDates(thursday, 2);

    expect(dates).toHaveLength(14);
    expect(dates[0]).toBe("2026-10-12");
    expect(dates[13]).toBe("2026-10-25");
  });

  it("shows six weeks when the month is open", () => {
    expect(stripDates(sunday, 6)).toHaveLength(42);
  });
});

describe("chips", () => {
  it("a chip adds its dates, sorted", () => {
    expect(togglePreset(["2026-10-20"], "weekend", thursday)).toEqual({
      dates: ["2026-10-16", "2026-10-17", "2026-10-18", "2026-10-20"],
    });
  });

  it("a chip is lit while all its dates are selected", () => {
    const weekend = ["2026-10-16", "2026-10-17", "2026-10-18"];

    expect(isLit(weekend, "weekend", thursday)).toBe(true);
    expect(isLit(weekend.slice(1), "weekend", thursday)).toBe(false);
    expect(isLit(weekend, "today", thursday)).toBe(false);
  });

  it("tapping a lit chip removes its dates", () => {
    expect(togglePreset(["2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"], "weekend", thursday)).toEqual({
      dates: ["2026-10-15"],
    });
  });

  it("a chip that would go past 10 dates changes nothing and says so", () => {
    const eight = ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"];

    expect(togglePreset(eight, "weekend", thursday)).toEqual({ dates: eight, limitReached: true });
  });
});

describe("dates", () => {
  it("a tap toggles a date", () => {
    expect(toggleDate(["2026-10-16"], "2026-10-15")).toEqual({ dates: ["2026-10-15", "2026-10-16"] });
    expect(toggleDate(["2026-10-15", "2026-10-16"], "2026-10-15")).toEqual({ dates: ["2026-10-16"] });
  });

  it("an 11th date changes nothing and says so", () => {
    const ten = stripDates(thursday, 2).slice(3, 13);

    expect(toggleDate(ten, "2026-10-25")).toEqual({ dates: ten, limitReached: true });
  });

  it("removing a date from ten still works", () => {
    const ten = stripDates(thursday, 2).slice(3, 13);

    expect(toggleDate(ten, ten[0]).dates).toHaveLength(9);
  });
});
