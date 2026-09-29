"use client";

import { PosterCard } from "@/shared/ui/poster-card/poster-card";
import type { CSSProperties } from "react";
import { posters } from "../../domain/posters";
import { usePointerFollow } from "./use-pointer-follow";

const spots = [
  { phone: ["-4%", "3%"], desktop: ["2%", "8%"], turn: -7 },
  { phone: ["-5%", "87%"], desktop: ["3%", "52%"], turn: 5 },
  { phone: ["76%", "2%"], desktop: ["82%", "6%"], turn: 6 },
  { phone: ["76%", "86%"], desktop: ["83%", "50%"], turn: -5 },
  { phone: ["16%", "70%"], desktop: ["16%", "70%"], turn: 4, size: "small" },
  { phone: ["68%", "70%"], desktop: ["68%", "70%"], turn: -4, size: "small" },
] as const;

export function HeroPosters() {
  const field = usePointerFollow<HTMLDivElement>();

  return (
    <div ref={field} className="absolute inset-0">
      {spots.map((spot, index) => (
        <div
          key={index}
          data-hero-poster={"size" in spot ? "edge" : ""}
          style={
            {
              "--poster-left": spot.phone[0],
              "--poster-top": spot.phone[1],
              "--poster-left-lg": spot.desktop[0],
              "--poster-top-lg": spot.desktop[1],
              "--poster-turn": `${spot.turn}deg`,
              "--poster-depth": 0.6 + (index % 4) * 0.35,
            } as CSSProperties
          }
        >
          <div data-idle-motion>
            <PosterCard {...posters[index]} size={"size" in spot ? spot.size : undefined} />
          </div>
        </div>
      ))}
    </div>
  );
}
