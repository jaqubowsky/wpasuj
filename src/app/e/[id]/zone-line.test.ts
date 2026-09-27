import { expect, it } from "vitest";
import { zoneLine } from "./zone-line";

it("names the poll's zone when the viewer is in another one", () => {
  expect(zoneLine("Europe/Warsaw", "Europe/London")).toBe("Godziny w strefie Europe/Warsaw");
});

it("says nothing when the viewer is in the poll's zone", () => {
  expect(zoneLine("Europe/Warsaw", "Europe/Warsaw")).toBeUndefined();
});
