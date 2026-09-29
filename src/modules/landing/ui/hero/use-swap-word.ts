import { useMotion } from "@/shared/ui/motion-toggle/use-motion";
import { useEffect, useState } from "react";

const words = ["grillu", "planszówkach", "urodzinach", "kinie", "Orliku", "grillu"];
const last = words.length - 1;
const holdMs = 3200;

export function useSwapWord() {
  const { moving } = useMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!moving || index === last) return;

    const timer = setTimeout(() => setIndex(index + 1), holdMs);

    return () => clearTimeout(timer);
  }, [moving, index]);

  const step = moving ? index : last;

  return { step, word: words[step], finalWord: words[last] };
}
