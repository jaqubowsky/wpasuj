import styles from "./avatar.module.css";

const tints = ["coral", "lilac", "mint", "butter", "sky"] as const;

function tintOf(name: string) {
  const sum = Array.from(name).reduce((total, character) => total + character.codePointAt(0)!, 0);
  return tints[sum % tints.length];
}

type AvatarProps = {
  name: string;
  pop?: boolean;
};

export function Avatar({ name, pop }: AvatarProps) {
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase("pl");

  return (
    <span className={styles.avatar} role="img" aria-label={name} data-tint={tintOf(name)} data-pop={pop || undefined}>
      {initial}
    </span>
  );
}
