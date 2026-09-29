import type { RefObject } from "react";
import { useMotion } from "@/shared/ui/motion-toggle/use-motion";
import type { GridCell, PaintedRectangle } from "./use-paint-stroke";

export function useStrokeRipple(gridRef: RefObject<HTMLDivElement | null>) {
  const { moving } = useMotion();

  return (rectangle: PaintedRectangle, from: GridCell) => {
    if (!moving) return;

    const fromColumn = rectangle.dates.indexOf(from.date);
    const fromRow = rectangle.hours.indexOf(from.hour);

    gridRef.current?.querySelectorAll<HTMLElement>("[data-date]").forEach((slot) => {
      const column = rectangle.dates.indexOf(slot.dataset.date ?? "");
      const row = rectangle.hours.indexOf(Number(slot.dataset.hour));

      if (column < 0 || row < 0) return;

      slot.style.setProperty("--ripple-step", String(Math.abs(column - fromColumn) + Math.abs(row - fromRow)));
      slot.dataset.ripple = "";

      for (const done of ["animationend", "animationcancel"]) {
        slot.addEventListener(done, () => delete slot.dataset.ripple, { once: true });
      }
    });
  };
}
