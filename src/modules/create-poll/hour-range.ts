export type HourRange = { firstHour: number; lastHour: number };

export const hourRanges = {
  evening: { firstHour: 17, lastHour: 23 },
  "all-day": { firstHour: 10, lastHour: 23 },
} satisfies Record<string, HourRange>;

export const startBounds = { min: 0, max: 23 };

export function endBounds(range: HourRange) {
  return { min: range.firstHour + 1, max: 24 };
}

function clamp(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(Math.max(value, min), max);
}

export function withStart(range: HourRange, start: number): HourRange {
  const firstHour = clamp(start, startBounds);
  return { firstHour, lastHour: Math.max(range.lastHour, firstHour + 1) };
}

export function withEnd(range: HourRange, end: number): HourRange {
  return { firstHour: range.firstHour, lastHour: clamp(end, endBounds(range)) };
}
