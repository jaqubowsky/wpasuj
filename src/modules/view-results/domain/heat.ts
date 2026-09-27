import { freeAt } from "./best-time";

type Heat = 0 | 1 | 2 | 3 | 4 | 5;

const buckets = 5;

export function heatOf(free: number, respondents: number): Heat {
  if (free === 0) return 0;
  return Math.ceil((free * buckets) / respondents) as Heat;
}

type TimeRange = { date: string; firstHour: number; lastHour: number };

export function heatCellOf(respondents: Parameters<typeof freeAt>[0], cell: { date: string; hour: number }, best?: TimeRange) {
  const count = freeAt(respondents, cell).length;
  return {
    count,
    heat: heatOf(count, respondents.length),
    everyone: count > 0 && count === respondents.length,
    best: best?.date === cell.date && cell.hour >= best.firstHour && cell.hour < best.lastHour,
  };
}
