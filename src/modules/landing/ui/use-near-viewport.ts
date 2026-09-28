import { useEffect, useRef, useState } from "react";

export function useNearViewport(rootMargin: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setNear(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(ref.current!);

    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, near };
}
