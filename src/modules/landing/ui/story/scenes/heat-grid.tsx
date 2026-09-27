import { Avatar } from "@/shared/ui/avatar/avatar";
import { heatScene } from "../../../domain/heat-scene";
import type { SceneProps } from "../story-steps";

export function HeatGrid({ time }: SceneProps) {
  const scene = heatScene(time);

  return (
    <>
      <span className="text-label font-medium text-muted">Kuba pyta</span>
      <b className="mt-[2px] mb-[10px] font-display text-day font-bold tracking-[-0.03em]">Planszówki u Michała</b>
      <div className="mb-[10px] flex gap-[6px]">
        {scene.people.map(({ name, joined }) => (
          <span
            key={name}
            data-in={joined || undefined}
            className="opacity-0 transition-[opacity,scale] duration-(--duration-pop) ease-pop motion-safe:scale-0 data-in:opacity-100 motion-safe:data-in:scale-100"
          >
            <Avatar name={name} tintKey={name} />
          </span>
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
        {scene.days.map((day) => (
          <span key={day} className="pb-1 text-center font-display text-section font-bold">
            {day}
          </span>
        ))}
        {scene.rows.map(({ hour, cells }) => [
          <span key={hour} className="-translate-y-[7px] pr-[2px] text-right text-mini font-medium text-muted">
            {hour}:00
          </span>,
          ...cells.map(({ count, heat }, index) => (
            <span
              key={`${hour}-${scene.days[index]}`}
              data-heat={heat || undefined}
              className="grid h-target place-items-center rounded-cell bg-surface text-label font-semibold shadow-[inset_0_0_0_1px_var(--color-edge)] data-heat:shadow-none data-[heat=1]:bg-heat-1 data-[heat=2]:bg-heat-2 data-[heat=3]:bg-heat-3 data-[heat=4]:bg-heat-4 data-[heat=5]:bg-heat-5 data-[heat=5]:text-surface"
            >
              {count || ""}
            </span>
          )),
        ])}
      </div>
    </>
  );
}
