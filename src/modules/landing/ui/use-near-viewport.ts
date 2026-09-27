import { useEffect, useRef, useState } from "react";

export function useNearViewport() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return { ref, near };
}
