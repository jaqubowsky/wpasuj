import { expect, it } from "vitest";
import { answeredCount, deleteWarning, peopleCount } from "./people-count";

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

it.each([
  [1, "1 osoba"],
  [4, "4 osoby"],
  [5, "5 osób"],
  [22, "22 osoby"],
])("names %i people on the counter", (count, label) => {
  expect(peopleCount(count)).toBe(label);
});

it.each([
  [0, "Tego nie da się cofnąć."],
  [1, "Zniknie też odpowiedź 1 osoby. Tego nie da się cofnąć."],
  [5, "Znikną też odpowiedzi 5 osób. Tego nie da się cofnąć."],
])("warns how many answers %i deletes", (count, line) => {
  expect(deleteWarning(count)).toBe(line);
});
