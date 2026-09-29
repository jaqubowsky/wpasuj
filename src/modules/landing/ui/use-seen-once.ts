import { useMotion } from "@/shared/ui/motion-toggle/use-motion";
import { useEffect, useRef, useState } from "react";

export function useSeenOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { moving } = useMotion();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!moving) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(ref.current!);

    return () => observer.disconnect();
  }, [moving]);

  return { ref, seen, moving };
}
