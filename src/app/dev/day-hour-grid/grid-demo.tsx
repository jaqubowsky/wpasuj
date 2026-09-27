"use client";

import { useState } from "react";
import { DayHourGrid, type GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { Cell } from "@/shared/ui/cell/cell";

type GridDemoProps = { dates: string[]; hours: number[] };

const keyOf = ({ date, hour }: GridCell) => `${date} ${hour}`;

export function GridDemo({ dates, hours }: GridDemoProps) {
  const [mine, setMine] = useState<Set<string>>(new Set());

  function paint(cells: GridCell[], add: boolean) {
    setMine((current) => {
      const next = new Set(current);
      for (const cell of cells) {
        if (add) next.add(keyOf(cell));
        else next.delete(keyOf(cell));
      }
      return next;
    });
  }

  function toggleAll(cells: GridCell[]) {
    paint(cells, !cells.every((cell) => mine.has(keyOf(cell))));
  }

  return (
    <DayHourGrid
      label="Kiedy możesz?"
      dates={dates}
      hours={hours}
      isSelected={(cell) => mine.has(keyOf(cell))}
      renderCell={({ label, tabIndex, preview, ...cell }) => {
        const selected = mine.has(keyOf(cell));
        return <Cell pressed={selected} state={preview ?? (selected ? "mine" : undefined)} aria-label={label} tabIndex={tabIndex} />;
      }}
      onCellTap={(cell) => toggleAll([cell])}
      onDateTap={(date) => toggleAll(hours.map((hour) => ({ date, hour })))}
      onHourTap={(hour) => toggleAll(dates.map((date) => ({ date, hour })))}
      onStroke={({ dates: strokeDates, hours: strokeHours, mode }) =>
        paint(
          strokeDates.flatMap((date) => strokeHours.map((hour) => ({ date, hour }))),
          mode === "add",
        )
      }
    />
  );
}
