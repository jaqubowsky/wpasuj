import type { GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { useState } from "react";

type Rectangle = { dates: string[]; hours: number[]; mode: "add" | "remove" };

function sameSlot(a: GridCell, b: GridCell) {
  return a.date === b.date && a.hour === b.hour;
}

export function useDemoSlots() {
  const [mine, setMine] = useState<GridCell[]>([]);
  const isMine = (cell: GridCell) => mine.some((slot) => sameSlot(slot, cell));

  return {
    mine,
    isMine,
    tap: (cell: GridCell) => setMine(isMine(cell) ? mine.filter((slot) => !sameSlot(slot, cell)) : [...mine, cell]),
    stroke: ({ dates, hours, mode }: Rectangle) => {
      const painted = dates.flatMap((date) => hours.map((hour) => ({ date, hour })));
      const rest = mine.filter((slot) => !painted.some((cell) => sameSlot(cell, slot)));

      setMine(mode === "add" ? [...rest, ...painted] : rest);
    },
    clear: () => setMine([]),
  };
}
