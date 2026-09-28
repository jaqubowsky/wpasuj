import type { GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { useState } from "react";

export function useSelectedCell() {
  const [selected, setSelected] = useState<GridCell>();

  return {
    selected,
    isSelected: (cell: GridCell) => selected?.date === cell.date && selected.hour === cell.hour,
    toggle: (cell: GridCell) => setSelected((current) => (current?.date === cell.date && current.hour === cell.hour ? undefined : cell)),
    close: () => setSelected(undefined),
  };
}
