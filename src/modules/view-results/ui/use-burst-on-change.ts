import { useTileBurst } from "@/shared/ui/tile-burst/tile-burst";
import { useEffect, useRef } from "react";

export function useBurstOnChange<Element extends HTMLElement>(value: string | undefined) {
  const ref = useRef<Element>(null);
  const shown = useRef(value);
  const burst = useTileBurst();

  useEffect(() => {
    const changed = shown.current !== undefined && value !== undefined && value !== shown.current;

    shown.current = value;

    if (changed && ref.current) burst(ref.current, 10);
  }, [value, burst]);

  return ref;
}
