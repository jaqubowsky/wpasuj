import { describe, expect, it } from "vitest";
import { bestPoll, bestTimeAt, settledAt } from "./best-scene";

describe("bestPoll", () => {
  it("counts who can make each hour, days 17 to 19 by hours 17 to 22", () => {
    expect(bestPoll.days).toEqual([17, 18, 19]);
    expect(bestPoll.rows.map((row) => row.hour)).toEqual([17, 18, 19, 20, 21, 22]);
    expect(bestPoll.rows.map((row) => row.cells.map((cell) => cell.count))).toEqual([
      [2, 1, 5],
      [4, 3, 4],
      [5, 5, 2],
      [4, 5, 0],
      [2, 5, 0],
      [1, 3, 0],
    ]);
  });

  it("picks Saturday 19 to 22, which five of six can make, and marks its three cells", () => {
    expect(bestPoll.best).toEqual({ label: "Sobota 18.10, 19–22", share: "5 z 6 może", cannot: "Nie może: Ola" });
    expect(bestPoll.rows.map((row) => row.cells.map((cell) => cell.best))).toEqual([
      [false, false, false],
      [false, false, false],
      [false, true, false],
      [false, true, false],
      [false, true, false],
      [false, false, false],
    ]);
  });
});

describe("bestTimeAt", () => {
  it("keeps the card below the phone as the step starts", () => {
    expect(bestTimeAt(0)).toEqual({ risen: false, settled: false });
  });

  it("has the card risen by the middle of the step, not yet settled", () => {
    expect(bestTimeAt(0.5)).toEqual({ risen: true, settled: false });
  });

  it("ends with the card up, still offering to settle the time", () => {
    expect(bestTimeAt(1)).toEqual({ risen: true, settled: false });
  });
});

describe("settledAt", () => {
  it("starts where the best-time step ended", () => {
    expect(settledAt(0)).toEqual(bestTimeAt(1));
  });

  it("has settled the time by the middle of the step", () => {
    expect(settledAt(0.5)).toEqual({ risen: true, settled: true });
  });

  it("ends settled", () => {
    expect(settledAt(1)).toEqual({ risen: true, settled: true });
  });
});
