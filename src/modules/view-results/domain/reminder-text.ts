const namesList = new Intl.ListFormat("pl", { type: "conjunction" });

export function reminderText(names: string[], { title, link }: { title: string; link: string }) {
  const invite = `${title} ${link}`;
  if (names.length === 0) return `Kiedy możecie? ${invite}`;
  const already = names.length === 1 ? "Już jest" : "Już są";
  return `${already}: ${namesList.format(names)}. Reszta, kiedy możecie? ${invite}`;
}
