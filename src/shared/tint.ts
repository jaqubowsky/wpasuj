const tints = ["coral", "lilac", "mint", "butter", "sky"] as const;

export type Tint = (typeof tints)[number];

export function tintOf(key: string) {
  const sum = Array.from(key).reduce((total, character) => total + character.codePointAt(0)!, 0);
  return tints[sum % tints.length];
}
