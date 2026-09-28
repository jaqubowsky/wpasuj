const hoursWord: Record<Intl.LDMLPluralRule, string> = {
  zero: "godzin",
  one: "godzina",
  two: "godziny",
  few: "godziny",
  many: "godzin",
  other: "godzin",
};

const plural = new Intl.PluralRules("pl");

export function clashLine(hours: number) {
  if (hours === 0) return "Na innym telefonie, nie może w żadnym terminie";
  return `Na innym telefonie, ${hours} ${hoursWord[plural.select(hours)]}`;
}

export function mergeLine({ name, hours }: { name: string; hours: number }) {
  if (hours === 0) return `Odpowiedź jako ${name} zniknie.`;
  return `Twoje godziny jako ${name} dołączą do tych.`;
}
