import { useEffect, useRef, type RefObject } from "react";

const fillIn = [
  { transform: "scale(0.9)", opacity: 0.6 },
  { transform: "scale(1.08)", opacity: 1 },
  { transform: "scale(1)", opacity: 1 },
];

const stepMs = 90;

export function useFillIn(ref: RefObject<HTMLElement | null>, chosen: string | undefined, order: number | undefined) {
  const shown = useRef(chosen);

  useEffect(() => {
    const changed = chosen !== shown.current;
    shown.current = chosen;
    if (changed && order !== undefined && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current?.animate(fillIn, { duration: 320, delay: order * stepMs, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)", fill: "backwards" });
    }
  }, [chosen, order, ref]);
}
