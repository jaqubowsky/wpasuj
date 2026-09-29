import { useCallback } from "react";
import { useMotion } from "../motion-toggle/use-motion";
import "./tile-burst.css";

const tones = ["2", "3", "4", "5", "ink"];

export function useTileBurst() {
  const { moving } = useMotion();

  return useCallback(
    (from: Element, count = 14) => {
      if (!moving) return;

      const box = from.getBoundingClientRect();

      for (let index = 0; index < count; index++) {
        const tile = document.createElement("i");
        const angle = Math.random() * 2 * Math.PI;
        const distance = 60 + Math.random() * 110;

        tile.dataset.tileBurst = tones[index % tones.length];
        tile.setAttribute("aria-hidden", "true");
        tile.style.setProperty("--burst-left", `${box.left + box.width / 2}px`);
        tile.style.setProperty("--burst-top", `${box.top + box.height / 2}px`);
        tile.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
        tile.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
        tile.style.setProperty("--burst-turn", `${(Math.random() - 0.5) * 360}deg`);
        tile.addEventListener("animationend", () => tile.remove());
        document.body.append(tile);
      }
    },
    [moving],
  );
}
