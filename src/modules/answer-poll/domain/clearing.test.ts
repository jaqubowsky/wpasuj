import { expect, it } from "vitest";
import { clearingStepMs } from "./clearing";

it("clears one hour every 120 ms", () => {
  expect(clearingStepMs(3)).toBe(120);
});

it("fits a long answer into 600 ms", () => {
  expect(clearingStepMs(10)).toBe(60);
  expect(clearingStepMs(50) * 50).toBe(600);
});
