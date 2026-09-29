export type Draft = { title: string; organiserName: string };

export function draftPreview({ title, organiserName }: Draft) {
  const name = organiserName.trim();

  return {
    asker: name ? `${name} pyta, kiedy możesz` : "Ty pytasz, kiedy możesz",
    title: title.trim() || "Wasz plan",
  };
}
