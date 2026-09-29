"use client";

import { productName } from "@/shared/brand";
import type { CSSProperties } from "react";
import { useSeenOnce } from "../use-seen-once";
import { useLetterWave } from "./use-letter-wave";

const letters = [
  "1000110001101011101110001",
  "1111010001111101000010000",
  "0111010001111111000110001",
  "0111110000011100000111110",
  "1000110001100011000101110",
  "0011100010000101001001100",
];

export function TileWord() {
  const { ref, seen, moving } = useSeenOnce<HTMLDivElement>();
  const { heats, send, delay } = useLetterWave(letters);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={productName}
      className="group mt-22.5 flex justify-center gap-1.5 lg:gap-4.5"
      data-lit={seen || !moving || undefined}
    >
      {letters.map((bits, letter) => (
        <div
          key={letter}
          className="grid w-12 cursor-pointer grid-cols-5 gap-0.5 lg:w-42 lg:gap-1"
          onClick={(event) => {
            const clicked = [...event.currentTarget.children].indexOf(event.target as Element);
            const tile = bits[clicked] === "1" ? clicked : bits.indexOf("1");

            send({ letter, tile }, event.currentTarget.children[tile], ref.current!);
          }}
        >
          {[...bits].map((bit, tile) => (
            <i
              key={tile}
              className="aspect-square rounded-[24%] data-on:bg-paper/10 data-on:transition-colors data-on:delay-(--tile-delay) data-on:duration-(--duration-swing) data-on:ease-out group-data-lit:data-[heat=2]:bg-heat-2 group-data-lit:data-[heat=3]:bg-heat-3 group-data-lit:data-[heat=4]:bg-heat-4 group-data-lit:data-[heat=5]:bg-heat-5"
              data-on={bit === "1" || undefined}
              data-heat={bit === "1" ? heats[letter][tile] : undefined}
              style={{ "--tile-delay": `${delay({ letter, tile })}ms` } as CSSProperties}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
