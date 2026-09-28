import { useRef, useState } from "react";

export type GridCell = { date: string; hour: number };
export type PaintedRectangle = { dates: string[]; hours: number[]; mode: "add" | "remove" };

type Pointer = { pointerId: number; buttons: number; isPrimary: boolean };

type Stroke = { pointerId: number; anchor: GridCell; current: GridCell; mode: PaintedRectangle["mode"]; spread: boolean };

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

  function strokeOf({ pointerId }: Pick<Pointer, "pointerId">) {
    const current = strokeRef.current;
    return current?.pointerId === pointerId ? current : null;
  }

  function rectangleOf({ anchor, current, mode }: Stroke): PaintedRectangle {
    return { dates: between(dates, anchor.date, current.date), hours: between(hours, anchor.hour, current.hour), mode };
  }

  return {
    start(cell: GridCell, filled: boolean, { pointerId, isPrimary }: Pick<Pointer, "pointerId" | "isPrimary">) {
      if (strokeRef.current && !isPrimary) return;
      paintedRef.current = false;
      update({ pointerId, anchor: cell, current: cell, mode: filled ? "remove" : "add", spread: false });
    },
    move(cell: GridCell | undefined, pointer: Pointer) {
      const current = strokeOf(pointer);
      if (!current) return;
      if (pointer.buttons === 0) return update(null);
      if (!cell || isSameCell(current.current, cell)) return;
      update({ ...current, current: cell, spread: current.spread || !isSameCell(current.anchor, cell) });
    },
    end(pointer: Pick<Pointer, "pointerId">) {
      const current = strokeOf(pointer);
      if (!current) return;
      update(null);
      paintedRef.current = current.spread;
      if (current.spread) onStroke?.(rectangleOf(current));
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
