import { expect, it } from "vitest";
import { admitReport } from "./report-window";

const hour = 60 * 60_000;

it("admits a fifth report within the hour and refuses a sixth", () => {
  expect(admitReport([0, 1, 2, 3], 4).admitted).toBe(true);
  expect(admitReport([0, 1, 2, 3, 4], 5).admitted).toBe(false);
});

it("forgets a report once an hour has passed", () => {
  expect(admitReport([0, 1, 2, 3, 4], hour)).toEqual({ admitted: true, times: [1, 2, 3, 4, hour] });
});

it("does not count a refused report against the hour", () => {
  expect(admitReport([0, 1, 2, 3, 4], 5).times).toEqual([0, 1, 2, 3, 4]);
});
