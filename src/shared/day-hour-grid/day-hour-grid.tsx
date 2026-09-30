"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { clockHour } from "@/shared/dates/format";
import { Text } from "@/shared/ui/text/text";
import { dateMorph, Morph } from "@/shared/morph";
import { useGridKeyboard } from "./use-grid-keyboard";
import { usePaintStroke, type GridCell, type PaintedRectangle } from "./use-paint-stroke";
import { useStrokeRipple } from "./use-stroke-ripple";

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

function dayOf(date: string) {
  const day = new Date(`${date}T00:00:00Z`);

  return { weekday: weekdays[day.getUTCDay()], number: day.getUTCDate() };
}

function cellUnder(event: PointerEvent<HTMLElement>): GridCell | undefined {
  const slot = document
    .elementsFromPoint(event.clientX, event.clientY)
    .find((element) => event.currentTarget.contains(element))
    ?.closest<HTMLElement>("[data-date]");

  if (!slot?.dataset.date) return undefined;

  return { date: slot.dataset.date, hour: Number(slot.dataset.hour) };
}

export function DayHourGrid({
  label,
  dates,
  hours,
  isSelected,
  renderCell,
  onCellTap,
  onDateTap,
  onHourTap,
  onStroke,
  morphDates,
}: DayHourGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const ripple = useStrokeRipple(gridRef);

  const stroke = usePaintStroke({
    gridRef,
    dates,
    hours,
    onStroke:
      onStroke &&
      ((rectangle, from) => {
        onStroke(rectangle);
        ripple(rectangle, from);
      }),
    onTap: onCellTap,
  });

  const keyboard = useGridKeyboard({ gridRef, dates, hours, onStroke, firstRow: onDateTap ? 0 : 1, firstColumn: onHourTap ? 0 : 1 });

  return (
    <div className="@container">
      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-multiselectable={onStroke && true}
        className="grid snap-x snap-mandatory scroll-pl-[calc(var(--hour-column)+--spacing(1.5))] [scrollbar-width:none] auto-rows-12 grid-cols-[var(--hour-column)_repeat(var(--date-count),minmax(56px,1fr))] grid-rows-[auto] gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [--hour-column:--spacing(12)] @max-grid-fit:data-scrolls:grid-cols-[var(--hour-column)_repeat(var(--date-count),max(56px,calc((100cqi_-_var(--hour-column)_-_5_*_--spacing(1.5))_/_4.4)))] [&::-webkit-scrollbar]:hidden"
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
          <div className="sticky left-0 z-1 -mr-1.5 box-border touch-pan-y bg-surface pr-1.5" aria-hidden />
          {dates.map((date, index) => {
            const day = dayOf(date);
            const position = { row: 0, column: index + 1 };
            const label = `${day.weekday} ${day.number}`;

            return (
              <div
                key={date}
                role="columnheader"
                aria-colindex={position.column + 1}
                className="touch-pan-x snap-start"
                data-row={position.row}
                data-column={position.column}
              >
                <Morph name={morphDates ? dateMorph(date) : undefined}>
                  {onDateTap ? (
                    <button
                      type="button"
                      className="box-border h-11 w-full cursor-pointer rounded-cell border-0 bg-transparent p-0 font-sans text-sm font-semibold text-ink tabular-nums transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-96"
                      tabIndex={keyboard.tabIndexOf(position)}
                      onFocus={() => keyboard.onFocus(position)}
                      onClick={() => onDateTap(date)}
                    >
                      {label}
                    </button>
                  ) : (
                    <span className="grid h-11 place-items-center text-sm font-semibold tabular-nums">{label}</span>
                  )}
                </Morph>
              </div>
            );
          })}
        </div>
        {hours.map((hour, rowIndex) => {
          const header = { row: rowIndex + 1, column: 0 };

          return (
            <div key={hour} role="row" className="contents">
              <div
                role="rowheader"
                aria-colindex={header.column + 1}
                className="sticky left-0 z-1 -mr-1.5 box-border touch-pan-y bg-surface pr-1.5"
                data-row={header.row}
                data-column={header.column}
              >
                {onHourTap ? (
                  <button
                    type="button"
                    className="box-border h-full min-h-11 w-full cursor-pointer rounded-cell border-0 bg-transparent p-0 text-left font-sans tabular-nums transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-96"
                    tabIndex={keyboard.tabIndexOf(header)}
                    onFocus={() => keyboard.onFocus(header)}
                    onClick={() => onHourTap(hour)}
                  >
                    <Text variant="meta">{clockHour(hour)}:00</Text>
                  </button>
                ) : (
                  <span className="grid h-full items-center">
                    <Text variant="meta">{clockHour(hour)}:00</Text>
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
                    className="grid in-data-paints:touch-manipulation data-ripple:animate-pop data-ripple:[animation-delay:calc(var(--ripple-step)*var(--duration-ripple))] [&>:first-child]:w-full"
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
                      label: `${day.weekday} ${day.number}, ${clockHour(hour)}:00`,
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
