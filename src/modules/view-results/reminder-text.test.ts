import { describe, expect, it } from "vitest";
import { reminderText } from "./reminder-text";

const poll = { title: "Planszówki", link: "https://wpasuj.pl/e/abcdefghij" };

describe("reminderText", () => {
  it("is the plain invite when nobody answered", () => {
    expect(reminderText([], poll)).toBe("Kiedy możecie? Planszówki https://wpasuj.pl/e/abcdefghij");
  });

  it("names the one who answered", () => {
    expect(reminderText(["Ola"], poll)).toBe("Już jest: Ola. Reszta, kiedy możecie? Planszówki https://wpasuj.pl/e/abcdefghij");
  });

  it("joins two names with i", () => {
    expect(reminderText(["Ola", "Michał"], poll)).toBe(
      "Już są: Ola i Michał. Reszta, kiedy możecie? Planszówki https://wpasuj.pl/e/abcdefghij",
    );
  });

  it("lists three or more with commas and i before the last", () => {
    expect(reminderText(["Bartek", "Ola", "Michał", "Kasia"], poll)).toBe(
      "Już są: Bartek, Ola, Michał i Kasia. Reszta, kiedy możecie? Planszówki https://wpasuj.pl/e/abcdefghij",
    );
  });
});
