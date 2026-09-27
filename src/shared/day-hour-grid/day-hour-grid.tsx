"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Text } from "@/shared/ui/text/text";
import { dateMorph } from "@/shared/morph";
import { useGridKeyboard } from "./use-grid-keyboard";
import { usePaintStroke, type GridCell, type PaintedRectangle } from "./use-paint-stroke";

export type { GridCell };

type RenderedCell = GridCell & { selected: boolean; label: string; tabIndex: 0 | -1; preview?: "adding" | "removing" };

type DayHourGridProps = {
  label: string;
  dates: string[];
  hours: number[];
  isSelected: (cell: GridCell) => boolean;
  renderCell: (cell: RenderedCell) => ReactNode;
  onCellTap: (cell: GridCell) => void;
  onDateTap?: (date: string) => void;
  onHourTap?: (hour: number) => void;
  onStroke?: (rectangle: PaintedRectangle) => void;
  morphDates?: boolean;
};

const weekdays = ["nd", "pn", "wt", "śr", "cz", "pt", "sb"];
const longWeekdays = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

function dayOf(date: string) {
  const day = new Date(`${date}T00:00:00Z`);
  return { weekday: weekdays[day.getUTCDay()], longWeekday: longWeekdays[day.getUTCDay()], number: day.getUTCDate() };
}

function cellUnder(event: PointerEvent): GridCell | undefined {
  const slot = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-date]");
  if (!slot?.dataset.date) return undefined;
  return { date: slot.dataset.date, hour: Number(slot.dataset.hour) };
}

export function DayHourGrid({ label, dates, hours, isSelected, renderCell, onCellTap, onDateTap, onHourTap, onStroke, morphDates }: DayHourGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const stroke = usePaintStroke({ dates, hours, onStroke, onTap: onCellTap });
  const keyboard = useGridKeyboard({ gridRef, dates, hours, onStroke, firstRow: onDateTap ? 0 : 1, firstColumn: onHourTap ? 0 : 1 });

  return (
    <div className="@container">
      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-multiselectable={onStroke && true}
        className="grid [scrollbar-width:none] grid-cols-[var(--hour-column)_repeat(var(--date-count),minmax(56px,1fr))] grid-rows-[auto] auto-rows-(--spacing-cell) gap-cell-gap overflow-x-auto overscroll-x-contain scroll-pl-[calc(var(--hour-column)+var(--spacing-cell-gap))] [--hour-column:48px] snap-x snap-mandatory @max-[600px]:data-scrolls:grid-cols-[var(--hour-column)_repeat(var(--date-count),max(56px,calc((100cqi_-_var(--hour-column)_-_5_*_var(--spacing-cell-gap))_/_4.4)))] [&::-webkit-scrollbar]:hidden"
        style={{ "--date-count": dates.length } as CSSProperties}
        data-scrolls={dates.length > 4 || undefined}
        data-paints={onStroke && true}
        onKeyDown={keyboard.onKeyDown}
        onPointerMove={onStroke && ((event) => stroke.move(cellUnder(event), event))}
        onPointerUp={stroke.end}
        onPointerCancel={stroke.cancel}
        onLostPointerCapture={stroke.cancel}
      >
        <div role="row" className="contents">
          <div className="sticky left-[0] z-1 touch-pan-y bg-paper shadow-[var(--spacing-cell-gap)_0_0_var(--color-paper)]" aria-hidden />
          {dates.map((date, index) => {
            const day = dayOf(date);
            const position = { row: 0, column: index + 1 };
            const label = (
              <>
                <Text variant="meta">
                  <span className="@min-[600px]:[font-size:0] @min-[600px]:after:text-label @min-[600px]:after:content-[attr(data-long)]" data-long={day.longWeekday}>{day.weekday}</span>
                </Text>
                <Text variant="day-number">{day.number}</Text>
              </>
            );
            return (
              <div
                key={date}
                role="columnheader"
                aria-colindex={position.column + 1}
                className="snap-start touch-pan-x"
                style={morphDates ? dateMorph(date) : undefined}
                data-row={position.row}
                data-column={position.column}
              >
                {onDateTap ? (
                  <button
                    type="button"
                    className="box-border min-h-target w-full cursor-pointer rounded-cell border-0 bg-track font-sans text-ink tabular-nums transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-96 grid h-full justify-items-center px-[0] pt-1 pb-2"
                    aria-label={`${day.weekday} ${day.number}`}
                    tabIndex={keyboard.tabIndexOf(position)}
                    onFocus={() => keyboard.onFocus(position)}
                    onClick={() => onDateTap(date)}
                  >
                    {label}
                  </button>
                ) : (
                  <span className="grid justify-items-center pt-1 pb-2">{label}</span>
                )}
              </div>
            );
          })}
        </div>
        {hours.map((hour, rowIndex) => {
          const header = { row: rowIndex + 1, column: 0 };
          return (
            <div key={hour} role="row" className="contents">
              <div role="rowheader" aria-colindex={header.column + 1} className="sticky left-[0] z-1 touch-pan-y bg-paper shadow-[var(--spacing-cell-gap)_0_0_var(--color-paper)]" data-row={header.row} data-column={header.column}>
                {onHourTap ? (
                  <button type="button" className="box-border min-h-target w-full cursor-pointer rounded-cell border-0 bg-track font-sans text-ink tabular-nums transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-96 h-full p-[0]" tabIndex={keyboard.tabIndexOf(header)} onFocus={() => keyboard.onFocus(header)} onClick={() => onHourTap(hour)}>
                    <Text variant="meta">{hour}:00</Text>
                  </button>
                ) : (
                  <span className="grid h-full items-start justify-items-end pr-2">
                    <Text variant="meta">{hour}:00</Text>
                  </span>
                )}
              </div>
              {dates.map((date, columnIndex) => {
                const cell = { date, hour };
                const selected = isSelected(cell);
                const position = { row: rowIndex + 1, column: columnIndex + 1 };
                const day = dayOf(date);
                return (
                  <div
                    key={date}
                    role="gridcell"
                    aria-colindex={position.column + 1}
                    aria-selected={selected}
                    className="grid in-data-paints:touch-none [&>:first-child]:w-full"
                    data-row={position.row}
                    data-column={position.column}
                    data-date={date}
                    data-hour={hour}
                    onFocus={() => keyboard.onFocus(position)}
                    onPointerDown={(event) => {
                      if (!onStroke || event.button !== 0) return;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      stroke.start(cell, selected, event);
                    }}
                    onClick={(event) => stroke.tap(cell, event.detail === 0 ? "keyboard" : "pointer")}
                  >
                    {renderCell({
                      ...cell,
                      selected,
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
