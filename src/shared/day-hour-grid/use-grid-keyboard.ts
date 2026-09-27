import { useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { PaintedRectangle } from "./use-paint-stroke";

type GridPosition = { row: number; column: number };

type GridKeyboardOptions = {
  gridRef: RefObject<HTMLElement | null>;
  dates: string[];
  hours: number[];
  onStroke?: (rectangle: PaintedRectangle) => void;
  firstRow: 0 | 1;
  firstColumn: 0 | 1;
};

const steps: Record<string, GridPosition> = {
  ArrowUp: { row: -1, column: 0 },
  ArrowDown: { row: 1, column: 0 },
  ArrowLeft: { row: 0, column: -1 },
  ArrowRight: { row: 0, column: 1 },
};

function isCell({ row, column }: GridPosition) {
  return row > 0 && column > 0;
}

function isSamePosition(a: GridPosition, b: GridPosition) {
  return a.row === b.row && a.column === b.column;
}

function span(from: number, to: number) {
  return [Math.min(from, to), Math.max(from, to) + 1];
}

export function useGridKeyboard({ gridRef, dates, hours, onStroke, firstRow, firstColumn }: GridKeyboardOptions) {
  const [active, setActive] = useState<GridPosition>({ row: 1, column: 1 });
  const extensionRef = useRef<{ anchor: GridPosition; reached: GridPosition } | null>(null);

  function focus(position: GridPosition) {
    setActive(position);
    const slot = gridRef.current?.querySelector(`[data-row="${position.row}"][data-column="${position.column}"]`);
    (slot?.firstElementChild as HTMLElement | null)?.focus();
  }

  return {
    tabIndexOf: (position: GridPosition) => (isSamePosition(position, active) ? 0 : -1),
    onFocus: setActive,
    onKeyDown(event: KeyboardEvent) {
      const step = steps[event.key];
      if (!step) return;
      event.preventDefault();

      const next = { row: active.row + step.row, column: active.column + step.column };
      const inside = next.row >= firstRow && next.row <= hours.length && next.column >= firstColumn && next.column <= dates.length;
      if (!inside || (next.row === 0 && next.column === 0)) return;

      if (!event.shiftKey) {
        extensionRef.current = null;
        focus(next);
        return;
      }

      if (!isCell(active) || !isCell(next)) return;
      const extension = extensionRef.current;
      const anchor = extension && isSamePosition(extension.reached, active) ? extension.anchor : active;
      extensionRef.current = { anchor, reached: next };
      focus(next);
      onStroke?.({
        dates: dates.slice(...span(anchor.column - 1, next.column - 1)),
        hours: hours.slice(...span(anchor.row - 1, next.row - 1)),
        mode: "add",
      });
    },
  };
}
