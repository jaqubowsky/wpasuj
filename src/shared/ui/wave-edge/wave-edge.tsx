const crests = Array.from({ length: 35 }, (_, index) => `T ${80 + index * 40} 14`).join(" ");
const path = `M0 28 L0 14 Q 20 0 40 14 ${crests} L1440 28 Z`;

export function WaveEdge({ tone, side }: { tone: "ink" | "coral"; side: "top" | "bottom" }) {
  return (
    <svg
      className="block h-7 w-full data-[side=bottom]:rotate-180 data-[tone=coral]:fill-accent data-[tone=ink]:fill-ink"
      viewBox="0 0 1440 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-tone={tone}
      data-side={side}
    >
      <path d={path} />
    </svg>
  );
}
