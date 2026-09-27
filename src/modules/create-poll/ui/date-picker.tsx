import { dayNumber, fullDate, monthOnFirstDay, shortWeekday, summaryOfDates } from "@/shared/dates/format";
import { Button } from "@/shared/ui/button/button";
import { Chip } from "@/shared/ui/chip/chip";
import type { Preset } from "../domain/date-presets";
import styles from "./create-poll-form.module.css";
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
      <div className={styles.chips}>
        {presets.map(({ preset, label }) => (
          <Chip key={preset} pressed={picker.isLit(preset)} onClick={() => picker.tapPreset(preset)}>
            {label}
          </Chip>
        ))}
      </div>
      <div className={styles.strip} role="group" aria-label="Dni">
        {picker.strip.slice(0, 7).map((date) => (
          <span key={date} className={styles.weekday} aria-hidden="true">
            {shortWeekday(date)}
          </span>
        ))}
        {picker.strip.map((date) => (
          <button
            key={date}
            type="button"
            className={styles.date}
            aria-label={fullDate(date)}
            aria-pressed={dates.includes(date)}
            data-today={date === picker.today || undefined}
            disabled={picker.isPast(date)}
            onClick={() => picker.tapDate(date)}
          >
            {dayNumber(date)}
            {monthOnFirstDay(date) && (
              <span className={styles.month} aria-hidden="true">
                {monthOnFirstDay(date)}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.more}>
        <Button variant="text" onClick={picker.toggleMonth}>
          {picker.monthOpen ? "Pokaż dwa tygodnie" : "Pokaż cały miesiąc"}
        </Button>
      </div>
      {dates.length > 0 && (
        <p className={styles.summary}>
          <b>{summaryOfDates(dates)}</b>
        </p>
      )}
      {picker.limitReached && (
        <p className={styles.notice} role="status">
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
      <div className={styles.chips}>
        {presets.map(({ preset, label }) => (
          <Chip key={preset} pressed={false}>
            {label}
          </Chip>
        ))}
      </div>
      <div className={styles.strip} aria-hidden="true">
        {Array.from({ length: pendingStripCells }, (_, index) => (
          <span key={index} className={index < 7 ? styles.weekday : styles.pending}>
            {"\u00a0"}
          </span>
        ))}
      </div>
      <div className={styles.more}>
        <Button variant="text">Pokaż cały miesiąc</Button>
      </div>
    </>
  );
}
