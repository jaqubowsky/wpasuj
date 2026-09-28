import { describe, expect, it } from "vitest";
import { demoPoll } from "./demo-poll";

describe("demoPoll", () => {
  it("shows Saturday 19–21 as the best time before the visitor taps", () => {
    const poll = demoPoll([]);

    expect(poll.best).toEqual({ label: "Sobota 18.10, 19–21", share: "4 z 5", cannot: ["Ty"] });
    expect(poll.others).toEqual([
      { label: "pt 17.10, 20–21", share: "4 z 5" },
      { label: "pt 17.10, 19–20", share: "3 z 5" },
    ]);
  });

  it("counts four friends and the visitor in each cell", () => {
    const poll = demoPoll([{ date: "2025-10-18", hour: 19 }]);

    expect(poll.cellAt({ date: "2025-10-17", hour: 20 })).toEqual({ count: 4, heat: 4 });
    expect(poll.cellAt({ date: "2025-10-18", hour: 19 })).toEqual({ count: 5, heat: 5 });
    expect(poll.cellAt({ date: "2025-10-19", hour: 21 })).toEqual({ count: 0, heat: 0 });
  });

  it("moves the best time to the hour the visitor adds", () => {
    const poll = demoPoll([{ date: "2025-10-18", hour: 19 }]);

    expect(poll.best).toEqual({ label: "Sobota 18.10, 19–20", share: "5 z 5", cannot: [] });
    expect(poll.others).toEqual([
      { label: "pt 17.10, 20–21", share: "4 z 5" },
      { label: "sb 18.10, 20–21", share: "4 z 5" },
    ]);
  });

  it("follows a Friday stroke from 19 to 21", () => {
    const poll = demoPoll([
      { date: "2025-10-17", hour: 19 },
      { date: "2025-10-17", hour: 20 },
    ]);

    expect(poll.best).toEqual({ label: "Piątek 17.10, 20–21", share: "5 z 5", cannot: [] });
    expect(poll.others).toEqual([
      { label: "sb 18.10, 19–21", share: "4 z 5" },
      { label: "pt 17.10, 19–20", share: "4 z 5" },
    ]);
  });
});
