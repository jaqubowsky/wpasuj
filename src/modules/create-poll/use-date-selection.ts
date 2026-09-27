import { useDeviceToday } from "@/shared/dates/use-device-today";
import { useState } from "react";
import { isLit, stripDates, toggleDate, togglePreset, type Preset } from "./date-presets";

export function useDateSelection() {
  const today = useDeviceToday();
  const [dates, setDates] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  function apply(selection: { dates: string[]; limitReached?: true }) {
    setDates(selection.dates);
    setLimitReached(selection.limitReached ?? false);
  }

  const picker = today === undefined ? undefined : {
    today,
    strip: stripDates(today, monthOpen ? 6 : 2),
    monthOpen,
    limitReached,
    toggleMonth: () => setMonthOpen((open) => !open),
    isLit: (preset: Preset) => isLit(dates, preset, today),
    tapPreset: (preset: Preset) => apply(togglePreset(dates, preset, today)),
    tapDate: (date: string) => apply(toggleDate(dates, date)),
  };

  return { dates, picker };
}

export type DatePickerState = NonNullable<ReturnType<typeof useDateSelection>["picker"]>;
