import { describe, expect, it } from "vitest";
import { paintPollAt } from "./paint-poll";

describe("paintPollAt", () => {
  it("starts with nothing painted and no finger", () => {
    expect(paintPollAt(0)).toEqual({ painted: [], finger: undefined });
  });

  it("has painted the first day's four evening hours halfway, the finger on the last one", () => {
    expect(paintPollAt(0.5)).toEqual({
      painted: [
        { column: 0, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: 2 },
        { column: 0, row: 3 },
      ],
      finger: { column: 0, row: 3 },
    });
  });

  it("ends with all seven cells painted and the finger lifted", () => {
    expect(paintPollAt(1)).toEqual({
      painted: [
        { column: 0, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: 2 },
        { column: 0, row: 3 },
        { column: 1, row: 2 },
        { column: 1, row: 3 },
        { column: 1, row: 4 },
      ],
      finger: undefined,
    });
  });

  it("finishes painting before the step ends, the finger resting on the last cell", () => {
    expect(paintPollAt(0.9)).toEqual({ painted: paintPollAt(1).painted, finger: { column: 1, row: 4 } });
  });
});
