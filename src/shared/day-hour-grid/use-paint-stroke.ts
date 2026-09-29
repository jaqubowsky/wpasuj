import { useEffect, useRef, useState, type RefObject } from "react";

export type GridCell = { date: string; hour: number };
export type PaintedRectangle = { dates: string[]; hours: number[]; mode: "add" | "remove" };

type Pointer = { pointerId: number; buttons: number; isPrimary: boolean; pointerType: string; clientX: number; clientY: number };

type Stroke = {
  pointerId: number;
  anchor: GridCell;
  current: GridCell;
  mode: PaintedRectangle["mode"];
  spread: boolean;
  painting: boolean;
  origin: { x: number; y: number };
};

const holdMs = 300;
const slopPx = 8;

type PaintStrokeOptions = {
  gridRef: RefObject<HTMLElement | null>;
  dates: string[];
  hours: number[];
  onStroke?: (rectangle: PaintedRectangle, from: GridCell) => void;
  onTap: (cell: GridCell) => void;
};

function isSameCell(a: GridCell, b: GridCell) {
  return a.date === b.date && a.hour === b.hour;
}

function between<T>(values: T[], from: T, to: T) {
  const [first, last] = [values.indexOf(from), values.indexOf(to)].sort((a, b) => a - b);

  return values.slice(first, last + 1);
}

export function usePaintStroke({ gridRef, dates, hours, onStroke, onTap }: PaintStrokeOptions) {
  const strokeRef = useRef<Stroke | null>(null);
  const paintedRef = useRef(false);
  const holdRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [stroke, setStroke] = useState<Stroke | null>(null);

  const paints = Boolean(onStroke);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid || !paints) return;

    const keepPageStill = (event: TouchEvent) => {
      if (strokeRef.current?.painting) event.preventDefault();
    };

    grid.addEventListener("touchmove", keepPageStill, { passive: false });

    return () => grid.removeEventListener("touchmove", keepPageStill);
  }, [gridRef, paints]);

  function update(next: Stroke | null) {
    if (!next?.painting) clearTimeout(holdRef.current);

    strokeRef.current = next;
    setStroke(next);
  }

  function strokeOf({ pointerId }: Pick<Pointer, "pointerId">) {
    const current = strokeRef.current;

    return current?.pointerId === pointerId ? current : null;
  }

  function rectangleOf({ anchor, current, mode }: Stroke): PaintedRectangle {
    return { dates: between(dates, anchor.date, current.date), hours: between(hours, anchor.hour, current.hour), mode };
  }

  return {
    start(cell: GridCell, filled: boolean, pointer: Omit<Pointer, "buttons">) {
      if (strokeRef.current && !pointer.isPrimary) return;

      const waitsForHold = pointer.pointerType === "touch";

      paintedRef.current = false;

      update({
        pointerId: pointer.pointerId,
        anchor: cell,
        current: cell,
        mode: filled ? "remove" : "add",
        spread: false,
        painting: !waitsForHold,
        origin: { x: pointer.clientX, y: pointer.clientY },
      });

      if (!waitsForHold) return;

      holdRef.current = setTimeout(() => {
        const held = strokeOf(pointer);

        if (held) update({ ...held, painting: true, spread: true });
      }, holdMs);
    },
    move(cell: GridCell | undefined, pointer: Pointer) {
      const current = strokeOf(pointer);

      if (!current) return;
      if (pointer.buttons === 0) return update(null);

      if (!current.painting) {
        if (Math.hypot(pointer.clientX - current.origin.x, pointer.clientY - current.origin.y) > slopPx) update(null);

        return;
      }

      if (!cell || isSameCell(current.current, cell)) return;

      update({ ...current, current: cell, spread: current.spread || !isSameCell(current.anchor, cell) });
    },
    end(pointer: Pick<Pointer, "pointerId">) {
      const current = strokeOf(pointer);

      if (!current) return;

      update(null);
      paintedRef.current = current.spread;
      if (current.spread) onStroke?.(rectangleOf(current), current.anchor);
    },
    cancel(pointer: Pick<Pointer, "pointerId">) {
      if (strokeOf(pointer)) update(null);
    },
    tap(cell: GridCell, source: "pointer" | "keyboard") {
      if (source === "pointer" && paintedRef.current) return;

      onTap(cell);
    },
    preview(cell: GridCell): "adding" | "removing" | undefined {
      if (!stroke?.spread) return undefined;

      const rectangle = rectangleOf(stroke);

      if (!rectangle.dates.includes(cell.date) || !rectangle.hours.includes(cell.hour)) return undefined;

      return stroke.mode === "add" ? "adding" : "removing";
    },
  };
}
