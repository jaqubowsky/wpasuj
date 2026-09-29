"use client";

import { useState } from "react";
import { useTileBurst } from "../tile-burst/tile-burst";

type PosterCardProps = {
  title: string;
  when: string;
  people: string;
  tone: "coral" | "ink" | "peach" | "deep" | "paper" | "pink";
  heat: readonly number[];
  size?: "small" | "large";
};

export function PosterCard({ title, when, people, tone, heat, size }: PosterCardProps) {
  const [flipped, setFlipped] = useState(false);
  const burst = useTileBurst();

  return (
    <button
      type="button"
      className="group relative box-border flex aspect-4/5 w-27 cursor-pointer flex-col justify-between rounded-card border-0 p-3.5 text-left font-sans text-ink shadow-poster focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-[size=large]:w-55 data-[size=small]:w-35 data-[tone=coral]:bg-accent data-[tone=deep]:bg-heat-5 data-[tone=deep]:text-surface data-[tone=ink]:bg-ink data-[tone=ink]:text-paper data-[tone=paper]:bg-surface data-[tone=peach]:bg-heat-2 data-[tone=pink]:bg-heat-1 lg:w-47"
      aria-label={`${title}, ${when}`}
      aria-pressed={flipped}
      data-tone={tone}
      data-size={size}
      data-poster-card
      onClick={(event) => {
        if (!flipped) burst(event.currentTarget);

        setFlipped(!flipped);
      }}
    >
      <span className="font-display text-sm font-extrabold tracking-tight group-data-[size=large]:text-3xl group-data-[size=small]:text-lg lg:text-2xl">
        {title}
      </span>
      <span className="my-2 grid grid-cols-5 gap-0.5">
        {heat.map((level, index) => (
          <i
            key={index}
            className="aspect-square rounded-[4px] bg-surface opacity-25 group-data-[tone=paper]:opacity-100 group-data-[tone=paper]:shadow-[inset_0_0_0_1px_var(--color-line)] data-heat:opacity-100 data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5"
            data-heat={level || undefined}
          />
        ))}
      </span>
      <span className="flex flex-col items-start gap-1.5 text-xs font-semibold">
        <span className="whitespace-nowrap">{people}</span>
        <b className="max-w-full truncate rounded-pill bg-surface px-2 py-1 font-semibold text-ink group-data-[tone=paper]:bg-ink group-data-[tone=paper]:text-paper group-data-[tone=pink]:bg-ink group-data-[tone=pink]:text-paper">
          {when}
        </b>
      </span>
      <span className="absolute inset-0 box-border grid rotate-y-90 content-center justify-items-start gap-2 rounded-[inherit] bg-ink p-3.5 text-paper opacity-0 transition-[transform,opacity] duration-(--duration-turn) ease-out group-aria-pressed:rotate-y-0 group-aria-pressed:opacity-100">
        <small className="text-xs text-on-dark-muted">Najlepiej</small>
        <strong className="font-display text-xl font-extrabold">{when}</strong>
        <span className="rounded-pill bg-accent px-2.5 py-1 text-xs font-semibold text-ink">Ustalone</span>
      </span>
    </button>
  );
}
