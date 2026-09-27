const lines: Record<Intl.LDMLPluralRule, string> = {
  zero: "osób już odpowiedziało",
  one: "osoba już odpowiedziała",
  two: "osoby już odpowiedziały",
  few: "osoby już odpowiedziały",
  many: "osób już odpowiedziało",
  other: "osób już odpowiedziało",
};

const plural = new Intl.PluralRules("pl");

export function answeredCount(count: number) {
  if (count === 0) return "Bądź pierwszy";
  return `${count} ${lines[plural.select(count)]}`;
}
