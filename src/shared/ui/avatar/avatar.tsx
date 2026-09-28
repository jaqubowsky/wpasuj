import { tintOf } from "@/shared/tint";
import "./avatar.css";

const badges = {
  organiser: <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5z" fill="currentColor" />,
  cannot: <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
};

type AvatarProps = {
  name: string;
  tintKey: string;
  pop?: boolean;
  you?: boolean;
  mark?: keyof typeof badges;
  size?: "dot";
};

export function Avatar({ name, tintKey, pop, you, mark, size }: AvatarProps) {
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase("pl");

  return (
    <span
      className="relative box-border inline-grid size-8 flex-none place-items-center rounded-pill bg-track font-sans text-sm leading-none font-semibold normal-nums text-ink data-pop:animate-[avatar-pop_var(--duration-pop)_var(--ease-pop)_both] data-you:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-ink)] data-[mark=cannot]:text-muted data-[size=dot]:-ml-2 data-[size=dot]:size-5 data-[size=dot]:border-2 data-[size=dot]:border-solid data-[size=dot]:border-surface data-[size=dot]:first:ml-0 data-[tint=butter]:bg-tint-butter data-[tint=coral]:bg-tint-coral data-[tint=lilac]:bg-tint-lilac data-[tint=mint]:bg-tint-mint data-[tint=sky]:bg-tint-sky"
      role="img"
      aria-label={name}
      data-tint={mark === "cannot" ? undefined : tintOf(tintKey)}
      data-pop={pop || undefined}
      data-you={you || undefined}
      data-mark={mark}
      data-size={size}
    >
      {size !== "dot" && initial}
      {mark && (
        <span className="absolute -right-0.5 -bottom-0.5 box-border grid size-3.5 place-items-center rounded-pill border-2 border-solid border-surface bg-ink text-surface" aria-hidden="true">
          <svg className="size-2" viewBox="0 0 24 24">
            {badges[mark]}
          </svg>
        </span>
      )}
    </span>
  );
}
