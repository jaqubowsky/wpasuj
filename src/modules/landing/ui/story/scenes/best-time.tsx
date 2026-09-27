import { Avatar } from "@/shared/ui/avatar/avatar";
import { bestPoll, bestTimeAt } from "../../../domain/best-scene";
import type { SceneProps } from "../story-steps";

type BestTimePollProps = { risen: boolean; settled: boolean };

export function BestTimePoll({ risen, settled }: BestTimePollProps) {
  return (
    <>
      <span className="text-label font-medium text-muted">Kuba pyta</span>
      <p className="m-[0] mt-[2px] mb-[10px] font-display text-day font-bold tracking-[-0.03em]">Planszówki u Michała</p>
      <div className="mb-[10px] flex gap-[6px]">
        {bestPoll.people.map((name) => (
          <Avatar key={name} name={name} tintKey={name} />
        ))}
      </div>
      <div className="mb-3 flex rounded-[12px] bg-track p-1">
        <span className="grid h-[34px] flex-1 place-items-center text-caption font-semibold text-muted">Moje</span>
        <span className="grid h-[34px] flex-1 place-items-center rounded-[9px] bg-surface text-caption font-semibold shadow-lift">
          Wszyscy
        </span>
      </div>
      <div className="grid grid-cols-[40px_repeat(3,minmax(0,1fr))] gap-cell-gap">
        <span />
        {bestPoll.days.map((day) => (
          <span key={day} className="pb-1 text-center font-display text-section font-bold">
            {day}
          </span>
        ))}
        {bestPoll.rows.map(({ hour, cells }) => [
          <span key={hour} className="-mt-[7px] pr-[2px] text-right text-mini font-medium text-muted">
            {hour}:00
          </span>,
          ...cells.map(({ count, heat, best }, index) => (
            <span
              key={`${hour}-${bestPoll.days[index]}`}
              data-heat={heat || undefined}
              className="relative grid h-target place-items-center rounded-cell bg-surface text-label font-semibold shadow-[inset_0_0_0_1px_var(--color-edge)] data-heat:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface"
            >
              {count || ""}
              {best && (
                <span
                  aria-hidden
                  data-chosen={settled || undefined}
                  className="absolute -inset-1 rounded-[14px] opacity-0 shadow-[inset_0_0_0_2px_var(--color-ink)] transition-opacity duration-(--duration-pop) ease-out data-chosen:opacity-100"
                />
              )}
            </span>
          )),
        ])}
      </div>
      <div
        data-risen={risen || undefined}
        className="absolute right-3 bottom-3 left-3 translate-y-[130%] rounded-[22px] bg-ink p-[18px] text-surface transition-[translate] duration-(--duration-pop) ease-out data-risen:translate-y-[0]"
      >
        <span className="text-mini font-medium text-on-dark-muted">{settled ? "Ustalone" : "Najlepiej"}</span>
        <p className="m-[0] mt-1 mb-2 font-display text-day font-extrabold tracking-[-0.03em]">{bestPoll.best.label}</p>
        <div className="flex justify-between text-label">
          <span className="font-semibold text-heat-3">{bestPoll.best.share}</span>
          <span>{bestPoll.best.cannot}</span>
        </div>
        <span className="relative mt-3 grid h-[42px] place-items-center overflow-hidden rounded-[12px] bg-surface text-caption font-semibold text-ink">
          <span
            aria-hidden
            data-settled={settled || undefined}
            className="absolute inset-[0] bg-accent opacity-0 transition-opacity duration-(--duration-pop) ease-out data-settled:opacity-100"
          />
          <span className="relative">{settled ? "Dodaj do kalendarza" : "Ustal ten termin"}</span>
        </span>
      </div>
    </>
  );
}

export function BestTime({ time }: SceneProps) {
  return <BestTimePoll {...bestTimeAt(time)} />;
}
