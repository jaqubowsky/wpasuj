import { useEffect, useState } from "react";
import { useSeenOnce } from "../use-seen-once";

const tickMs = 34;

export function useCountUp(target: number) {
  const { ref, seen, moving } = useSeenOnce<HTMLElement>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!seen || !moving) return;

    let shown = 0;

    const timer = setInterval(() => {
      shown += 1;
      setCount(shown);
      if (shown === target) clearInterval(timer);
    }, tickMs);

    return () => clearInterval(timer);
  }, [seen, moving, target]);

  return { ref, count: moving ? count : target };
}
