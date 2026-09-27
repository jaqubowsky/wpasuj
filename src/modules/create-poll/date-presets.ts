import { addDays } from "@/shared/dates/iso-date";

export const maxDates = 10;

export type Preset = "today" | "tomorrow" | "weekend" | "next-week";

type Selection = { dates: string[]; limitReached?: true };

function daysSinceMonday(date: string) {
  return (new Date(date).getUTCDay() + 6) % 7;
}

function run(from: string, length: number) {
  return Array.from({ length }, (_, index) => addDays(from, index));
}

export function presetDates(preset: Preset, today: string) {
  const monday = addDays(today, -daysSinceMonday(today));
  switch (preset) {
    case "today":
      return [today];
    case "tomorrow":
      return [addDays(today, 1)];
    case "weekend":
      return run(addDays(monday, 4), 3).filter((date) => date >= today);
    case "next-week":
      return run(addDays(monday, 7), 7);
  }
}

export function stripDates(today: string, weeks: number) {
  return run(addDays(today, -daysSinceMonday(today)), weeks * 7);
}

export function isLit(selected: string[], preset: Preset, today: string) {
  return presetDates(preset, today).every((date) => selected.includes(date));
}

function limited(dates: string[], previous: string[]): Selection {
  if (dates.length > maxDates) return { dates: previous, limitReached: true };
  return { dates: dates.toSorted() };
}

export function togglePreset(selected: string[], preset: Preset, today: string): Selection {
  const dates = presetDates(preset, today);
  if (isLit(selected, preset, today)) return { dates: selected.filter((date) => !dates.includes(date)) };
  return limited([...new Set([...selected, ...dates])], selected);
}

export function toggleDate(selected: string[], date: string): Selection {
  if (selected.includes(date)) return { dates: selected.filter((each) => each !== date) };
  return limited([...selected, date], selected);
}
