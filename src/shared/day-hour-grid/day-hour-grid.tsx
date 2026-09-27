"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Text } from "@/shared/ui/text/text";
import styles from "./day-hour-grid.module.css";
import { useGridKeyboard } from "./use-grid-keyboard";
import { usePaintStroke, type GridCell, type PaintedRectangle } from "./use-paint-stroke";

export type { GridCell };

type RenderedCell = GridCell & { label: string; tabIndex: 0 | -1; preview?: "adding" | "removing" };

type DayHourGridProps = {
  label: string;
  dates: string[];
  hours: number[];
  isSelected: (cell: GridCell) => boolean;
  renderCell: (cell: RenderedCell) => ReactNode;
  onCellTap: (cell: GridCell) => void;
  onDateTap: (date: string) => void;
  onHourTap: (hour: number) => void;
  onStroke: (rectangle: PaintedRectangle) => void;
};

const weekdays = ["nd", "pn", "wt", "śr", "cz", "pt", "sb"];

function dayOf(date: string) {
  const day = new Date(`${date}T00:00:00Z`);
  return { weekday: weekdays[day.getUTCDay()], number: day.getUTCDate() };
}

function cellUnder(event: PointerEvent): GridCell | undefined {
  const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-date]");
  if (!slot?.dataset.date) return undefined;
  return { date: slot.dataset.date, hour: Number(slot.dataset.hour) };
}

export function DayHourGrid({ label, dates, hours, isSelected, renderCell, onCellTap, onDateTap, onHourTap, onStroke }: DayHourGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const stroke = usePaintStroke({ dates, hours, onStroke, onTap: onCellTap });
  const keyboard = useGridKeyboard({ gridRef, dates, hours, onStroke });

  return (
    <div className={styles.frame}>
      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-multiselectable
        className={styles.grid}
        style={{ "--date-count": dates.length } as CSSProperties}
        data-scrolls={dates.length > 4 || undefined}
        onKeyDown={keyboard.onKeyDown}
        onPointerMove={(event) => {
          const cell = cellUnder(event);
          if (cell) stroke.move(cell);
        }}
        onPointerUp={stroke.end}
      >
        <div role="row" className={styles.row}>
          <div className={styles.corner} aria-hidden />
          {dates.map((date, index) => {
            const day = dayOf(date);
            const position = { row: 0, column: index + 1 };
            return (
              <div key={date} role="columnheader" className={styles.date} data-row={position.row} data-column={position.column}>
                <button
                  type="button"
                  aria-label={`${day.weekday} ${day.number}`}
                  tabIndex={keyboard.tabIndexOf(position)}
                  onFocus={() => keyboard.onFocus(position)}
                  onClick={() => onDateTap(date)}
                >
                  <Text variant="meta">{day.weekday}</Text>
                  <Text variant="day-number">{day.number}</Text>
                </button>
              </div>
            );
          })}
        </div>
        {hours.map((hour, rowIndex) => {
          const header = { row: rowIndex + 1, column: 0 };
          return (
            <div key={hour} role="row" className={styles.row}>
              <div role="rowheader" className={styles.hour} data-row={header.row} data-column={header.column}>
                <button type="button" tabIndex={keyboard.tabIndexOf(header)} onFocus={() => keyboard.onFocus(header)} onClick={() => onHourTap(hour)}>
                  <Text variant="meta">{hour}:00</Text>
                </button>
              </div>
              {dates.map((date, columnIndex) => {
                const cell = { date, hour };
                const position = { row: rowIndex + 1, column: columnIndex + 1 };
                const day = dayOf(date);
                return (
                  <div
                    key={date}
                    role="gridcell"
                    aria-selected={isSelected(cell)}
                    className={styles.cell}
                    data-row={position.row}
                    data-column={position.column}
                    data-date={date}
                    data-hour={hour}
                    onFocus={() => keyboard.onFocus(position)}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      stroke.start(cell, isSelected(cell));
                    }}
                    onClick={(event) => stroke.tap(cell, event.detail === 0 ? "keyboard" : "pointer")}
                  >
                    {renderCell({
                      ...cell,
                      label: `${day.weekday} ${day.number}, ${hour}:00`,
                      tabIndex: keyboard.tabIndexOf(position),
                      preview: stroke.preview(cell),
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
