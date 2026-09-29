import { useMotion } from "@/shared/ui/motion-toggle/use-motion";
import { useTileBurst } from "@/shared/ui/tile-burst/tile-burst";
import { useState } from "react";

type Tile = { letter: number; tile: number };

const tileStep = 45;

const place = ({ letter, tile }: Tile) => ({ x: letter * 6 + (tile % 5), y: Math.floor(tile / 5) });

const distance = (from: Tile, to: Tile) => {
  const a = place(from);
  const b = place(to);

  return Math.hypot(a.x - b.x, a.y - b.y);
};

export function useLetterWave(letters: string[]) {
  const { moving } = useMotion();
  const burst = useTileBurst();
  const [heats, setHeats] = useState(() => letters.map((bits, letter) => [...bits].map((_, tile) => 2 + ((tile * 3 + letter) % 4))));
  const [origin, setOrigin] = useState<Tile>();

  function send(from: Tile, source: Element, word: Element) {
    if (!moving) return;

    burst(source, 12);
    setOrigin(from);
    setHeats((current) => current.map((row) => row.map((heat) => 2 + ((heat - 1 + Math.floor(Math.random() * 3)) % 4))));

    [...word.children].forEach((letterTiles, letter) =>
      [...letterTiles.children].forEach((element, tile) => {
        if (letters[letter][tile] !== "1") return;

        const away = distance(from, { letter, tile });

        element.animate(
          [
            { transform: "translateY(0) scale(1)" },
            {
              transform: `translateY(-${Math.max(6, 26 - away * 1.2)}px) scale(1.15) rotate(${place({ letter, tile }).x % 2 ? 8 : -8}deg)`,
            },
            { transform: "translateY(0) scale(1)" },
          ],
          { duration: 520, delay: away * tileStep, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)" },
        );
      }),
    );
  }

  const delay = (at: Tile) => (origin ? distance(origin, at) * tileStep + 200 : at.letter * 90 + at.tile * 25);

  return { heats, send, delay };
}
