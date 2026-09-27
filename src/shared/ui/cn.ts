import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      tracking: ["tight", "tighter", "tightest"],
      container: ["narrow", "wide"],
      radius: ["cell", "control", "card", "pill"],
      "font-weight": ["regular"],
      ease: ["pop"],
      animate: ["rise"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
