export function newestFirst<Person extends { savedAt: number }>(people: Person[]) {
  return people.toSorted((a, b) => b.savedAt - a.savedAt);
}
