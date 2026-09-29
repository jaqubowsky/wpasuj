import { describe, expect, it } from "vitest";
import { bestSlot, countsWith, heatOf, noneMine, toggleMine, tryDays, tryHours } from "./try-poll";

describe("the try-it poll", () => {
  it("offers four days and five evening hours", () => {
    expect(tryDays.map((day) => day.short)).toEqual(["pt", "sb", "nd", "pn"]);
    expect(tryHours).toEqual(["18:00", "19:00", "20:00", "21:00", "22:00"]);
  });

  it("names Saturday at 20:00 best before you tap, with 4 of 6 free", () => {
    expect(bestSlot(noneMine)).toEqual({ label: "Sobota, 20:00", count: 4 });
  });

  it("moves the best time to the slot your tap makes the fullest", () => {
    expect(bestSlot(toggleMine(noneMine, 3, 1))).toEqual({ label: "Sobota, 21:00", count: 5 });
  });

  it("keeps the earlier slot on a tie, reading hour by hour", () => {
    expect(bestSlot(toggleMine(noneMine, 2, 2))).toEqual({ label: "Sobota, 20:00", count: 4 });
  });

  it("takes your hour back on a second tap", () => {
    expect(toggleMine(toggleMine(noneMine, 3, 1), 3, 1)).toEqual(noneMine);
  });

  it("adds your hours to the five who answered", () => {
    expect(countsWith(toggleMine(noneMine, 0, 3))[0]).toEqual([1, 2, 1, 1]);
  });

  it("heats a slot by the share of the six people free", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(heatOf)).toEqual([0, 1, 2, 3, 4, 5, 5]);
  });
});
