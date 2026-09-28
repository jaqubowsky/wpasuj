const people: Record<Intl.LDMLPluralRule, string> = {
  zero: "osób",
  one: "osoba",
  two: "osoby",
  few: "osoby",
  many: "osób",
  other: "osób",
};

const plural = new Intl.PluralRules("pl");

export function peopleCount(count: number) {
  return `${count} ${people[plural.select(count)]}`;
}
