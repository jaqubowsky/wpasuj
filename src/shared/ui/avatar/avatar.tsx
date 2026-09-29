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
  stack?: "coral" | "ink" | "paper";
};

export function Avatar({ name, tintKey, pop, you, mark, stack }: AvatarProps) {
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase("pl");

  return (
    <span
      className="relative box-border inline-grid size-8 flex-none place-items-center rounded-cell bg-track font-sans text-sm leading-none font-semibold text-ink normal-nums data-pop:animate-[avatar-pop_var(--duration-pop)_var(--ease-pop)_both] data-stack:-ml-2 data-stack:size-10 data-stack:text-base data-stack:first:ml-0 data-you:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-ink)] data-[mark=cannot]:text-muted data-[stack=coral]:shadow-[0_0_0_3px_var(--color-accent)] data-[stack=ink]:shadow-[0_0_0_3px_var(--color-ink)] data-[stack=paper]:shadow-[0_0_0_3px_var(--color-paper)] data-[tint=butter]:bg-tint-butter data-[tint=coral]:bg-tint-coral data-[tint=lilac]:bg-tint-lilac data-[tint=mint]:bg-tint-mint data-[tint=sky]:bg-tint-sky"
      role="img"
      aria-label={name}
      data-tint={mark === "cannot" ? undefined : tintOf(tintKey)}
      data-pop={pop || undefined}
      data-you={you || undefined}
      data-mark={mark}
      data-stack={stack}
    >
      {initial}
      {mark && (
        <span
          className="absolute -right-0.5 -bottom-0.5 z-1 box-border grid size-3.5 place-items-center rounded-pill border-2 border-solid border-surface bg-ink text-surface"
          aria-hidden="true"
        >
          <svg className="size-2" viewBox="0 0 24 24">
            {badges[mark]}
          </svg>
        </span>
      )}
    </span>
  );
}
