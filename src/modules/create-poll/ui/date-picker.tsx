import { dayNumber, fullDate, monthOnFirstDay, shortWeekday, summaryOfDates } from "@/shared/dates/format";
import { Button } from "@/shared/ui/button/button";
import { Chip } from "@/shared/ui/chip/chip";
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
      <div className="-mx-3 mt-4 grid grid-cols-[repeat(7,minmax(var(--spacing-target),1fr))] gap-cell-gap rounded-card bg-surface p-3" role="group" aria-label="Dni">
        {picker.strip.slice(0, 7).map((date) => (
          <span key={date} className="text-center text-label font-medium text-muted" aria-hidden="true">
            {shortWeekday(date)}
          </span>
        ))}
        {picker.strip.map((date) => (
          <button
            key={date}
            type="button"
            className="flex h-target cursor-pointer flex-col items-center justify-center rounded-cell border-0 bg-surface font-sans text-body font-medium text-ink tabular-nums shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-today:not-aria-pressed:shadow-[inset_0_0_0_2px_var(--color-ink)] aria-pressed:font-semibold aria-pressed:shadow-none aria-pressed:enabled:bg-accent disabled:cursor-default disabled:bg-transparent disabled:text-muted disabled:shadow-none motion-safe:active:scale-96"
            aria-label={fullDate(date)}
            aria-pressed={dates.includes(date)}
            data-today={date === picker.today || undefined}
            disabled={picker.isPast(date)}
            onClick={() => picker.tapDate(date)}
          >
            {dayNumber(date)}
            {monthOnFirstDay(date) && (
              <span className="text-label leading-[14px] font-medium" aria-hidden="true">
                {monthOnFirstDay(date)}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <Button variant="text" onClick={picker.toggleMonth}>
          {picker.monthOpen ? "Pokaż dwa tygodnie" : "Pokaż cały miesiąc"}
        </Button>
      </div>
      {dates.length > 0 && (
        <p className="mt-2 mb-[0] text-note">
          <b>{summaryOfDates(dates)}</b>
        </p>
      )}
      {picker.limitReached && (
        <p className="mt-2 mb-[0] text-label font-medium text-accent-ink" role="status">
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
      <div className="-mx-3 mt-4 grid grid-cols-[repeat(7,minmax(var(--spacing-target),1fr))] gap-cell-gap rounded-card bg-surface p-3" aria-hidden="true">
        {Array.from({ length: pendingStripCells }, (_, index) => (
          <span key={index} className={index < 7 ? "text-center text-label font-medium text-muted" : "h-target rounded-cell shadow-[inset_0_0_0_1px_var(--color-line)]"}>
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
