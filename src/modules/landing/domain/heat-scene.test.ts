import { describe, expect, it } from "vitest";
import { heatScene } from "./heat-scene";

const counts = (time: number) => heatScene(time).rows.map((row) => row.cells.map((cell) => cell.count));
const heats = (time: number) => heatScene(time).rows.map((row) => row.cells.map((cell) => cell.heat));
const joined = (time: number) => heatScene(time).people.filter((person) => person.joined).map((person) => person.name);

describe("heatScene", () => {
  it("starts with Kuba alone, each of his hours in the coolest bucket of six", () => {
    expect(joined(0)).toEqual(["Kuba"]);
    expect(counts(0)).toEqual([
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ]);
    expect(heats(0)).toEqual(counts(0));
  });

  it("has four friends in by the middle of the step", () => {
    expect(joined(0.5)).toEqual(["Kuba", "Ola", "Michał", "Zuza"]);
    expect(counts(0.5)).toEqual([
      [2, 1, 3],
      [3, 2, 3],
      [3, 3, 2],
      [2, 3, 0],
      [1, 3, 0],
      [0, 2, 0],
    ]);
  });

  it("ends with all six in and the shared hours in the warmest buckets", () => {
    expect(joined(1)).toEqual(["Kuba", "Ola", "Michał", "Zuza", "Bartek", "Kasia"]);
    expect(counts(1)).toEqual([
      [2, 1, 5],
      [4, 3, 4],
      [5, 5, 2],
      [4, 5, 0],
      [2, 5, 0],
      [1, 3, 0],
    ]);
    expect(heats(1)).toEqual(counts(1));
  });

  it("counts the people in as the pill on the poll does", () => {
    expect(heatScene(0).count).toBe("1 osoba");
    expect(heatScene(0.5).count).toBe("4 osoby");
    expect(heatScene(1).count).toBe("6 osób");
  });

  it("lays the cells out as Friday 17 to Sunday 19 by the hours 17 to 22", () => {
    const scene = heatScene(1);
    expect(scene.days).toEqual(["pt 17", "sb 18", "nd 19"]);
    expect(scene.rows.map((row) => row.hour)).toEqual([17, 18, 19, 20, 21, 22]);
  });
});
