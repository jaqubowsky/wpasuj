import { dayNumber, fullDate, monthOnFirstDay, shortWeekday, summaryOfDates } from "@/shared/dates/format";
import { Button } from "@/shared/ui/button/button";
import { Chip } from "@/shared/ui/chip/chip";
import { dateMorph, Morph } from "@/shared/morph";
import type { Preset } from "../domain/date-presets";
import type { DatePickerState } from "./use-date-selection";

const presets: { preset: Preset; label: string }[] = [
  { preset: "today", label: "Dziś" },
  { preset: "tomorrow", label: "Jutro" },
  { preset: "weekend", label: "Ten weekend" },
  { preset: "next-week", label: "Przyszły tydzień" },
];

type DatePickerProps = {
  dates: string[];
  picker: DatePickerState;
};

export function DatePicker({ dates, picker }: DatePickerProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {presets.map(({ preset, label }) => (
          <Chip key={preset} pressed={picker.isLit(preset)} onClick={() => picker.tapPreset(preset)}>
            {label}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[repeat(7,minmax(--spacing(11),1fr))] gap-1.5" role="group" aria-label="Dni">
        {picker.strip.slice(0, 7).map((date) => (
          <span key={date} className="text-center text-sm font-medium text-muted" aria-hidden="true">
            {shortWeekday(date)}
          </span>
        ))}
        {picker.strip.map((date) => (
          <Morph key={date} name={dates.includes(date) ? dateMorph(date) : undefined}>
            <button
              type="button"
              className="flex h-11 cursor-pointer flex-col items-center justify-center rounded-cell border-0 bg-surface font-sans text-base font-extrabold text-ink tabular-nums shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default disabled:bg-transparent disabled:text-muted disabled:shadow-none aria-pressed:shadow-none aria-pressed:enabled:bg-accent aria-pressed:enabled:shadow-ledge-sm aria-pressed:enabled:shadow-heat-5 data-today:not-aria-pressed:shadow-[inset_0_0_0_2px_var(--color-ink)] motion-safe:active:scale-96"
              aria-label={fullDate(date)}
              aria-pressed={dates.includes(date)}
              data-today={date === picker.today || undefined}
              disabled={picker.isPast(date)}
              onClick={() => picker.tapDate(date)}
            >
              {dayNumber(date)}
              {monthOnFirstDay(date) && (
                <span className="text-sm leading-3.5 font-medium" aria-hidden="true">
                  {monthOnFirstDay(date)}
                </span>
              )}
            </button>
          </Morph>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <Button variant="text" onClick={picker.toggleMonth}>
          {picker.monthOpen ? "Pokaż dwa tygodnie" : "Pokaż cały miesiąc"}
        </Button>
      </div>
      {dates.length > 0 && (
        <p className="mt-2 mb-0 text-sm">
          <b>{summaryOfDates(dates)}</b>
        </p>
      )}
      {picker.limitReached && (
        <p className="mt-2 mb-0 text-sm font-medium text-accent-ink" role="status">
          Maksymalnie 10 dni
        </p>
      )}
    </>
  );
}

const pendingStripCells = 21;

export function PendingDatePicker() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {presets.map(({ preset, label }) => (
          <Chip key={preset} pressed={false}>
            {label}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[repeat(7,minmax(--spacing(11),1fr))] gap-1.5" aria-hidden="true">
        {Array.from({ length: pendingStripCells }, (_, index) => (
          <span
            key={index}
            className={
              index < 7 ? "text-center text-sm font-medium text-muted" : "h-11 rounded-cell shadow-[inset_0_0_0_1px_var(--color-line)]"
            }
          >
            {"\u00a0"}
          </span>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <Button variant="text">Pokaż cały miesiąc</Button>
      </div>
    </>
  );
}
