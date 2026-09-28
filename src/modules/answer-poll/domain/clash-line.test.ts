import { expect, it } from "vitest";
import { clashLine } from "./clash-line";

it.each([
  [1, "Na innym telefonie, 1 godzina"],
  [3, "Na innym telefonie, 3 godziny"],
  [7, "Na innym telefonie, 7 godzin"],
  [22, "Na innym telefonie, 22 godziny"],
  [0, "Na innym telefonie, nie może w żadnym terminie"],
])("says where the row answered and how many hours it holds: %i", (hours, line) => {
  expect(clashLine(hours)).toBe(line);
});
