import type { CSSProperties } from "react";
import { paintDays, paintHours, paintPollAt } from "../../../domain/paint-poll";
import type { SceneProps } from "../story-steps";

export function PaintPoll({ time }: SceneProps) {
  const poll = paintPollAt(time);
  const isPainted = (column: number, row: number) => poll.painted.some((cell) => cell.column === column && cell.row === row);

  return (
    <>
      <span className="text-sm font-medium text-muted">Kuba pyta</span>
      <p className="m-0 mt-0.5 mb-2.5 font-display text-xl font-bold tracking-tightest">Planszówki u Michała</p>
      <span aria-hidden className="mb-2.5 ml-27 grid size-7.5 place-items-center rounded-pill bg-tint-butter text-xs font-semibold">
        Z
      </span>
      <div className="mb-3 flex rounded-[12px] bg-track p-1">
        <span className="grid h-8.5 flex-1 place-items-center rounded-[9px] bg-surface text-sm font-semibold shadow-lift">Moje</span>
        <span className="grid h-8.5 flex-1 place-items-center text-sm font-semibold text-muted">Wszyscy</span>
      </div>
      <div className="relative grid grid-cols-[40px_repeat(3,minmax(0,1fr))] gap-1.5">
        <span />
        {paintDays.map((day) => (
          <span key={day} className="pb-1 text-center font-display text-lg font-bold">
            {day}
          </span>
        ))}
        {paintHours.map((hour, row) => [
          <span key={hour} className="-mt-2 pr-0.5 text-right text-xs font-medium text-muted">
            {hour}:00
          </span>,
          ...paintDays.map((day, column) => (
            <span key={`${day}-${hour}`} className="relative h-11 rounded-cell bg-surface shadow-[inset_0_0_0_1px_var(--color-edge)]">
              <span
                aria-hidden
                data-painted={isPainted(column, row) || undefined}
                className="absolute inset-0 rounded-cell bg-accent opacity-0 transition-opacity duration-(--duration-fill) ease-out data-painted:opacity-100"
              />
            </span>
          )),
        ])}
        <span
          aria-hidden
          data-touching={poll.finger ? true : undefined}
          className="absolute inset-0 col-start-2 col-end-3 row-start-2 row-end-3 grid place-items-center opacity-0 translate-x-[calc(var(--finger-column)*(100%+--spacing(1.5)))] translate-y-[calc(var(--finger-row)*(100%+--spacing(1.5)))] transition-[opacity,translate] duration-(--duration-sheet) ease-out data-touching:opacity-100"
          style={poll.finger && ({ "--finger-column": poll.finger.column, "--finger-row": poll.finger.row } as CSSProperties)}
        >
          <span className="size-8.5 rounded-pill bg-ink/18 ring-6 ring-ink/6" />
        </span>
      </div>
    </>
  );
}
