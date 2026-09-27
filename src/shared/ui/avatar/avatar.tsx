import "./avatar.css";

const tints = ["coral", "lilac", "mint", "butter", "sky"] as const;

function tintOf(key: string) {
  const sum = Array.from(key).reduce((total, character) => total + character.codePointAt(0)!, 0);
  return tints[sum % tints.length];
}

type AvatarProps = {
  name: string;
  tintKey: string;
  pop?: boolean;
};

export function Avatar({ name, tintKey, pop }: AvatarProps) {
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase("pl");

  return (
    <span
      className="box-border inline-grid size-8 place-items-center rounded-pill font-sans text-label leading-none font-semibold normal-nums text-ink data-pop:animate-[avatar-pop_var(--duration-pop)_var(--ease-pop)_both] data-[tint=butter]:bg-tint-butter data-[tint=coral]:bg-tint-coral data-[tint=lilac]:bg-tint-lilac data-[tint=mint]:bg-tint-mint data-[tint=sky]:bg-tint-sky"
      role="img"
      aria-label={name}
      data-tint={tintOf(tintKey)}
      data-pop={pop || undefined}
    >
      {initial}
    </span>
  );
}
