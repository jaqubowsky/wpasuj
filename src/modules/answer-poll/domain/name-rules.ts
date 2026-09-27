export const maxNameLength = 30;

export function normaliseName(name: string) {
  return name.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function nameKey(name: string) {
  return normaliseName(name).toLocaleLowerCase("pl");
}
