import { useMotion } from "@/shared/ui/motion-toggle/use-motion";
import { useEffect, useRef } from "react";

export function usePointerFollow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { moving } = useMotion();

  useEffect(() => {
    const field = ref.current!;

    if (!moving) return;

    const follow = (event: PointerEvent) => {
      field.style.setProperty("--pointer-x", (event.clientX / innerWidth - 0.5).toFixed(3));
      field.style.setProperty("--pointer-y", (event.clientY / innerHeight - 0.5).toFixed(3));
    };

    addEventListener("pointermove", follow);

    return () => {
      removeEventListener("pointermove", follow);
      field.style.removeProperty("--pointer-x");
      field.style.removeProperty("--pointer-y");
    };
  }, [moving]);

  return ref;
}
