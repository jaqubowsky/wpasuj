import { describe, expect, it } from "vitest";
import { linkPreview, miniGrid } from "./link-preview";

const poll = {
  organiserName: "Kuba",
  title: "Planszówki u Michała",
  dates: ["2030-10-18", "2030-10-19", "2030-10-20"],
  firstHour: 17,
  hourCount: 6,
};

describe("linkPreview", () => {
  it("asks the question in the organiser's name", () => {
    expect(linkPreview(poll).asker).toBe("Kuba pyta, kiedy możesz");
  });

  it("names the dates and the evening", () => {
    expect(linkPreview(poll).when).toBe("pt 18, sb 19, nd 20 października, wieczorem");
  });

  it("names the whole day", () => {
    expect(linkPreview({ ...poll, firstHour: 10, hourCount: 13 }).when).toBe("pt 18, sb 19, nd 20 października, cały dzień");
  });

  it("names a custom range by its hours", () => {
    expect(linkPreview({ ...poll, dates: ["2030-10-18"], firstHour: 8, hourCount: 4 }).when).toBe("pt 18 października, 8–12");
  });

  it("names a night past midnight by the clock", () => {
    expect(linkPreview({ ...poll, dates: ["2030-10-18"], firstHour: 22, hourCount: 6 }).when).toBe("pt 18 października, 22–4");
  });
});

describe("miniGrid", () => {
  const box = { width: 360, height: 502 };

  it("draws three evening dates as the mockup's tiles", () => {
    expect(miniGrid(3, 6, box)).toEqual({ tileWidth: 113, tileHeight: 58, gap: 10, radius: 14 });
  });

  it("fits ten whole days inside the box", () => {
    const { tileWidth, tileHeight, gap } = miniGrid(10, 24, box);

    expect(10 * tileWidth + 9 * gap).toBeLessThanOrEqual(box.width);
    expect(24 * tileHeight + 23 * gap).toBeLessThanOrEqual(box.height);
    expect(tileHeight).toBeGreaterThan(0);
  });
});
