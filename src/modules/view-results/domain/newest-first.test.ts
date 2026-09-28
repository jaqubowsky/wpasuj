import { expect, it } from "vitest";
import { newestFirst } from "./newest-first";

it("lists whoever saved last first", () => {
  const people = [
    { name: "Ola", savedAt: 1 },
    { name: "Kasia", savedAt: 3 },
    { name: "Bartek", savedAt: 2 },
  ];

  expect(newestFirst(people).map((person) => person.name)).toEqual(["Kasia", "Bartek", "Ola"]);
});
