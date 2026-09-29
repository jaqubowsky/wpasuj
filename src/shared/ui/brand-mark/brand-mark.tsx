"use client";

import { productName } from "@/shared/brand";
import { useState } from "react";
import { useMotion } from "../motion-toggle/use-motion";
import { Text } from "../text/text";
import { useTileBurst } from "../tile-burst/tile-burst";

const heats = [2, 4, 1, 3, 0, 5, 1, 3, 2];

function shuffled(tiles: number[]) {
  const next = [...tiles];

  for (let index = next.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));

    [next[index], next[other]] = [next[other], next[index]];
  }

  return next;
}

export function BrandMark() {
  const [tiles, setTiles] = useState(heats);
  const { moving } = useMotion();
  const burst = useTileBurst();

  return (
    <button
      type="button"
      aria-label={`${productName}, na górę strony`}
      className="group m-0 flex min-h-11 cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      onClick={(event) => {
        window.scrollTo({ top: 0, behavior: moving ? "smooth" : "auto" });
        setTiles(shuffled);
        burst(event.currentTarget, 8);
      }}
    >
      <span aria-hidden className="grid grid-cols-[repeat(3,--spacing(2))] gap-0.5">
        {tiles.map((heat, index) => (
          <i
            key={index}
            className="h-2 rounded-[2.5px] transition duration-(--duration-turn) ease-out data-[brand-tile=0]:bg-surface data-[brand-tile=0]:shadow-[inset_0_0_0_1.5px_var(--color-edge)] data-[brand-tile=1]:bg-heat-1 data-[brand-tile=2]:bg-heat-2 data-[brand-tile=3]:bg-heat-3 data-[brand-tile=4]:bg-heat-4 data-[brand-tile=5]:bg-heat-5 motion-safe:group-hover:odd:scale-75"
            data-brand-tile={heat}
          />
        ))}
      </span>
      <Text variant="wordmark">{productName}</Text>
    </button>
  );
}
