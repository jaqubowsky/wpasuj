import { paintDays, paintHours, paintPollAt } from "../../../domain/paint-poll";
import type { SceneProps } from "../story-steps";

export function PaintPoll({ time }: SceneProps) {
  const poll = paintPollAt(time);
  const isPainted = (column: number, row: number) => poll.painted.some((cell) => cell.column === column && cell.row === row);

  return (
    <>
      <span className="text-label font-medium text-muted">Kuba pyta</span>
      <p className="m-[0] mt-[2px] mb-[10px] font-display text-day font-bold tracking-[-0.03em]">Planszówki u Michała</p>
      <span aria-hidden className="mb-[10px] ml-[108px] grid size-[30px] place-items-center rounded-pill bg-tint-butter text-mini font-semibold">
        Z
      </span>
      <div className="mb-3 flex rounded-[12px] bg-track p-1">
        <span className="grid h-[34px] flex-1 place-items-center rounded-[9px] bg-surface text-caption font-semibold shadow-lift">Moje</span>
        <span className="grid h-[34px] flex-1 place-items-center text-caption font-semibold text-muted">Wszyscy</span>
      </div>
      <div className="relative grid grid-cols-[40px_repeat(3,minmax(0,1fr))] gap-cell-gap">
        <span />
        {paintDays.map((day) => (
          <span key={day} className="pb-1 text-center font-display text-section font-bold">
            {day}
          </span>
        ))}
        {paintHours.map((hour, row) => [
          <span key={hour} className="-mt-[7px] pr-[2px] text-right text-mini font-medium text-muted">
            {hour}:00
          </span>,
          ...paintDays.map((day, column) => (
            <span key={`${day}-${hour}`} className="relative h-target rounded-cell bg-surface shadow-[inset_0_0_0_1px_var(--color-edge)]">
              <span
                aria-hidden
                data-painted={isPainted(column, row) || undefined}
                className="absolute inset-[0] rounded-cell bg-accent opacity-0 transition-opacity duration-(--duration-fill) ease-out data-painted:opacity-100"
              />
            </span>
          )),
        ])}
        <span
          aria-hidden
          data-touching={poll.finger ? true : undefined}
          className="absolute inset-[0] col-start-2 col-end-3 row-start-2 row-end-3 grid place-items-center opacity-0 transition-[opacity,transform] duration-(--duration-sheet) ease-out data-touching:opacity-100"
          style={poll.finger && { transform: `translate(calc(${poll.finger.column} * (100% + var(--spacing-cell-gap))), calc(${poll.finger.row} * (100% + var(--spacing-cell-gap))))` }}
        >
          <span className="size-[34px] rounded-pill bg-ink/18 ring-6 ring-ink/6" />
        </span>
      </div>
    </>
  );
}
