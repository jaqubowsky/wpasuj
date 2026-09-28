const answered: Record<Intl.LDMLPluralRule, string> = {
  zero: "osób już odpowiedziało",
  one: "osoba już odpowiedziała",
  two: "osoby już odpowiedziały",
  few: "osoby już odpowiedziały",
  many: "osób już odpowiedziało",
  other: "osób już odpowiedziało",
};

const people: Record<Intl.LDMLPluralRule, string> = {
  zero: "osób",
  one: "osoba",
  two: "osoby",
  few: "osoby",
  many: "osób",
  other: "osób",
};

const plural = new Intl.PluralRules("pl");

export function answeredCount(count: number) {
  if (count === 0) return "Bądź pierwszy";

  return `${count} ${answered[plural.select(count)]}`;
}

export function peopleCount(count: number) {
  return `${count} ${people[plural.select(count)]}`;
}

export function deleteWarning(count: number) {
  const irreversible = "Tego nie da się cofnąć.";

  if (count === 0) return irreversible;
  if (count === 1) return `Zniknie też odpowiedź 1 osoby. ${irreversible}`;

  return `Znikną też odpowiedzi ${count} osób. ${irreversible}`;
}
