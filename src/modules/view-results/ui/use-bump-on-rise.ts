import { useEffect, useRef } from "react";

const bump = [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }];

export function useBumpOnRise<Element extends HTMLElement>(count: number) {
  const ref = useRef<Element>(null);
  const shown = useRef(count);

  useEffect(() => {
    const rose = count > shown.current;
    shown.current = count;
    if (rose && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current?.animate(bump, { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    }
  }, [count]);

  return ref;
}
