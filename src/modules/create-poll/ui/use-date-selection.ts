import { useDeviceToday } from "@/shared/dates/use-device-today";
import { useState } from "react";
import { isLit, stripDates, toggleDate, togglePreset, type Preset, type Selection } from "../domain/date-presets";
import { isPastDate } from "../domain/poll-rules";

export function useDateSelection() {
  const today = useDeviceToday();
  const [dates, setDates] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  function apply(selection: Selection) {
    setDates(selection.dates);
    setLimitReached(selection.limitReached ?? false);
  }

  const picker =
    today === undefined
      ? undefined
      : {
          today,
          strip: stripDates(today, monthOpen ? 6 : 2),
          monthOpen,
          limitReached,
          toggleMonth: () => setMonthOpen((open) => !open),
          isPast: (date: string) => isPastDate(date, today),
          isLit: (preset: Preset) => isLit(dates, preset, today),
          tapPreset: (preset: Preset) => apply(togglePreset(dates, preset, today)),
          tapDate: (date: string) => apply(toggleDate(dates, date)),
        };

  return { dates, picker };
}

export type DatePickerState = NonNullable<ReturnType<typeof useDateSelection>["picker"]>;
