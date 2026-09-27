import { useRef, useState } from "react";

export type GridCell = { date: string; hour: number };
export type PaintedRectangle = { dates: string[]; hours: number[]; mode: "add" | "remove" };

type Stroke = { anchor: GridCell; current: GridCell; mode: PaintedRectangle["mode"]; spread: boolean };

type PaintStrokeOptions = {
  dates: string[];
  hours: number[];
  onStroke?: (rectangle: PaintedRectangle) => void;
  onTap: (cell: GridCell) => void;
};

function isSameCell(a: GridCell, b: GridCell) {
  return a.date === b.date && a.hour === b.hour;
}

function between<T>(values: T[], from: T, to: T) {
  const [first, last] = [values.indexOf(from), values.indexOf(to)].sort((a, b) => a - b);
  return values.slice(first, last + 1);
}

export function usePaintStroke({ dates, hours, onStroke, onTap }: PaintStrokeOptions) {
  const strokeRef = useRef<Stroke | null>(null);
  const paintedRef = useRef(false);
  const [stroke, setStroke] = useState<Stroke | null>(null);

  function update(next: Stroke | null) {
    strokeRef.current = next;
    setStroke(next);
  }

  function rectangleOf({ anchor, current, mode }: Stroke): PaintedRectangle {
    return { dates: between(dates, anchor.date, current.date), hours: between(hours, anchor.hour, current.hour), mode };
  }

  return {
    start(cell: GridCell, filled: boolean) {
      paintedRef.current = false;
      update({ anchor: cell, current: cell, mode: filled ? "remove" : "add", spread: false });
    },
    move(cell: GridCell) {
      const current = strokeRef.current;
      if (!current || isSameCell(current.current, cell)) return;
      update({ ...current, current: cell, spread: current.spread || !isSameCell(current.anchor, cell) });
    },
    end() {
      const current = strokeRef.current;
      update(null);
      paintedRef.current = Boolean(current?.spread);
      if (current?.spread) onStroke?.(rectangleOf(current));
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
