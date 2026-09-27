import { expect, it } from "vitest";
import { answeredCount } from "./answered-count";

it("invites the first answer when nobody answered", () => {
  expect(answeredCount(0)).toBe("Bądź pierwszy");
});

it.each([
  [1, "1 osoba już odpowiedziała"],
  [2, "2 osoby już odpowiedziały"],
  [4, "4 osoby już odpowiedziały"],
  [5, "5 osób już odpowiedziało"],
  [12, "12 osób już odpowiedziało"],
  [22, "22 osoby już odpowiedziały"],
  [25, "25 osób już odpowiedziało"],
])("counts %i with the Polish plural", (count, line) => {
  expect(answeredCount(count)).toBe(line);
});
