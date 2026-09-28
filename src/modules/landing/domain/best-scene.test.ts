import { describe, expect, it } from "vitest";
import { bestPoll, bestTimeAt, invitation } from "./best-scene";

describe("bestPoll", () => {
  it("counts who can make each hour, Friday 17 to Sunday 19 by hours 17 to 22", () => {
    expect(bestPoll.days).toEqual(["pt 17", "sb 18", "nd 19"]);
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

  it("has all six friends in", () => {
    expect(bestPoll.people).toEqual(["Kuba", "Ola", "Michał", "Zuza", "Bartek", "Kasia"]);
    expect(bestPoll.count).toBe("6 osób");
  });

  it("picks Saturday 19 to 22, which five of six can make, and gives its cells only their count and heat", () => {
    expect(bestPoll.best).toBe("Sobota 18.10, 19–22");
    expect(bestPoll.rows[2].cells[1]).toEqual({ count: 5, heat: 5 });
  });
});

describe("bestTimeAt", () => {
  it("keeps the card hidden as the step starts", () => {
    expect(bestTimeAt(0)).toBe(false);
  });

  it("has the card up by the middle of the step and keeps it there", () => {
    expect(bestTimeAt(0.5)).toBe(true);
    expect(bestTimeAt(1)).toBe(true);
  });
});

describe("invitation", () => {
  it("sets Saturday 18 October, 19:00 to 22:00, with the five who can come", () => {
    expect(invitation).toEqual({
      weekday: "Sobota",
      day: "18 października",
      hours: "19:00–22:00",
      coming: ["Kuba", "Michał", "Zuza", "Bartek", "Kasia"],
    });
  });
});
