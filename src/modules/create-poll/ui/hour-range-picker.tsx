import { clockHour } from "@/shared/dates/format";
import { Button } from "@/shared/ui/button/button";
import { endHours, hoursOf, rangeSummary, startHours } from "../domain/hour-range";
import type { HourRangeState } from "./use-hour-range";
import { openHourSheet, useHourSheet, type HourSheetState } from "./use-hour-sheet";

function Summary({ children }: { children: string }) {
  return <p className="m-0 mt-3 grid h-12 place-items-center rounded-control bg-heat-1 font-display text-lg font-extrabold">{children}</p>;
}

function HourField({
  label,
  hour,
  onOpen,
}: {
  label: "Od" | "Do";
  hour: number;
  onOpen: (button: HTMLElement, column: "Od" | "Do") => void;
}) {
  return (
    <span className="flex flex-col gap-1.5 text-sm text-muted">
      <span aria-hidden="true">{label}</span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${label} ${clockHour(hour)}:00`}
        className="box-border h-13 cursor-pointer rounded-control border-0 bg-surface px-3.5 text-left font-sans text-lg font-semibold text-ink tabular-nums shadow-[inset_0_0_0_1px_var(--color-edge)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        onClick={(event) => onOpen(event.currentTarget, label)}
      >
        {clockHour(hour)}:00
      </button>
    </span>
  );
}

function HourColumn({ label, hours, picked, onPick }: { label: string; hours: number[]; picked: number; onPick: (hour: number) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="mb-1 text-sm font-semibold">{label}</span>
      <div role="group" aria-label={label} className="flex h-59 flex-col gap-1.5 overflow-y-auto">
        {hours.map((hour) => (
          <button
            key={hour}
            type="button"
            aria-pressed={hour === picked}
            className="box-border h-11 shrink-0 cursor-pointer rounded-cell border-0 bg-transparent px-3.5 text-left font-sans text-lg text-muted tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink aria-pressed:bg-ink aria-pressed:font-semibold aria-pressed:text-surface"
            onClick={() => onPick(hour)}
          >
            {clockHour(hour)}:00
          </button>
        ))}
      </div>
    </div>
  );
}

function HourSheet({ hours, sheet }: { hours: HourRangeState; sheet: HourSheetState }) {
  return (
    <dialog
      ref={openHourSheet}
      aria-labelledby="hour-sheet-title"
      data-opened-from={sheet.openedFrom}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
      onKeyDown={sheet.closeOnEscape}
      onCancel={(event) => event.preventDefault()}
    >
      <div className="absolute inset-0 bg-ink/32" data-testid="hour-sheet-scrim" onClick={sheet.close} />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-4 rounded-t-card bg-surface px-5 pt-3 pb-[calc(--spacing(6)+env(safe-area-inset-bottom))] shadow-sheet"
        data-create-hour-sheet
      >
        <span className="h-1 w-10 self-center rounded-pill bg-line" aria-hidden="true" />
        <h2 id="hour-sheet-title" className="m-0 font-display text-2xl font-bold">
          O której?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <HourColumn label="Od" hours={startHours} picked={hours.range.firstHour} onPick={hours.setStart} />
          <HourColumn
            label="Do"
            hours={endHours(hours.range)}
            picked={hours.range.firstHour + hours.range.hourCount}
            onPick={hours.setEnd}
          />
        </div>
        <Summary>{rangeSummary(hours.range)}</Summary>
        <Button variant="primary" block onClick={sheet.close}>
          Gotowe
        </Button>
      </div>
    </dialog>
  );
}

function HourTiles({ hours }: { hours: HourRangeState }) {
  const { firstHour } = hours.range;
  const picked = hoursOf(hours.range).map(clockHour);
  const edges = [picked[0], picked.at(-1)];

  const previewed = hours.preview ? hoursOf(hours.preview).slice(1).map(clockHour) : [];

  return (
    <>
      <div role="group" aria-label="Godziny" className="grid grid-cols-8 gap-1.5" data-picking={hours.pickingEnd || undefined}>
        {startHours.map((hour) => (
          <button
            key={hour}
            type="button"
            aria-label={`${hour}:00`}
            aria-pressed={picked.includes(hour)}
            data-edge={edges.includes(hour) || undefined}
            data-preview={previewed.includes(hour) || undefined}
            data-start={(hours.pickingEnd && hour === firstHour) || undefined}
            className="box-border h-11 cursor-pointer rounded-cell border-0 bg-surface font-sans text-base font-semibold text-ink tabular-nums shadow-[inset_0_0_0_1.5px_var(--color-edge)] transition-[background-color,translate,scale] duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink in-data-picking:shadow-[inset_0_0_0_1.5px_var(--color-heat-4)] in-data-picking:hover:bg-heat-1 aria-pressed:bg-heat-2 aria-pressed:shadow-none data-edge:bg-ink data-edge:text-paper data-edge:shadow-ledge-sm data-edge:shadow-heat-5 data-preview:bg-heat-2 data-preview:shadow-none motion-safe:active:scale-96 motion-safe:data-start:animate-[create-hour-pop_var(--duration-turn)_var(--ease-spring)]"
            onClick={() => hours.pickTile(hour)}
            onPointerEnter={() => hours.hoverTile(hour)}
            onPointerLeave={() => hours.hoverTile(undefined)}
          >
            {hour}
          </button>
        ))}
      </div>
      {hours.pickingEnd ? (
        <p className="m-0 mt-3 box-border flex min-h-12 flex-wrap items-baseline gap-x-2 rounded-control bg-ink px-4 py-3 font-display text-lg font-extrabold text-paper">
          Od {firstHour}:00{" "}
          <span className="font-sans text-base font-semibold text-heat-3">
            kliknij ostatnią godzinę{" "}
            <span
              aria-hidden="true"
              className="inline-block motion-safe:animate-[create-hour-nudge_1s_var(--ease-sway)_infinite]"
              data-idle-motion
            >
              →
            </span>
          </span>
        </p>
      ) : (
        <Summary>{rangeSummary(hours.range)}</Summary>
      )}
    </>
  );
}

export function HourRangePicker({ hours }: { hours: HourRangeState }) {
  const sheet = useHourSheet();
  const { firstHour, hourCount } = hours.range;

  return (
    <>
      <div className="lg:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_--spacing(6)_minmax(0,1fr)] items-end gap-2">
          <HourField label="Od" hour={firstHour} onOpen={sheet.show} />
          <span className="grid h-13 place-items-center text-muted" aria-hidden="true">
            →
          </span>
          <HourField label="Do" hour={firstHour + hourCount} onOpen={sheet.show} />
        </div>
        <Summary>{rangeSummary(hours.range)}</Summary>
        {sheet.openedFrom && <HourSheet hours={hours} sheet={sheet} />}
      </div>
      <div className="hidden lg:block">
        <HourTiles hours={hours} />
      </div>
    </>
  );
}
