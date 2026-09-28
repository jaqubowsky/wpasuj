import { clockHour } from "@/shared/dates/format";
import type { z } from "zod";
import type { createPollSchema } from "../server/poll-schema";

export type HourRange = Pick<z.output<typeof createPollSchema>, "firstHour" | "hourCount">;

const hoursInDay = 24;
const firstTileHour = 6;

const hourWord = { one: "godzina", few: "godziny", many: "godzin" };
const plural = new Intl.PluralRules("pl");

export const defaultRange: HourRange = { firstHour: 17, hourCount: 6 };

export const startHours = Array.from({ length: hoursInDay }, (_, index) => (firstTileHour + index) % hoursInDay);

export function endHours(range: HourRange) {
  return Array.from({ length: hoursInDay }, (_, index) => range.firstHour + index + 1);
}

export function hoursOf(range: HourRange) {
  return Array.from({ length: range.hourCount }, (_, index) => range.firstHour + index);
}

export function withStart(range: HourRange, firstHour: number): HourRange {
  return { firstHour, hourCount: range.hourCount };
}

export function withEnd(range: HourRange, endHour: number): HourRange {
  return { firstHour: range.firstHour, hourCount: endHour - range.firstHour };
}

export function withTiles(firstHour: number, lastHour: number): HourRange {
  return { firstHour, hourCount: ((lastHour - firstHour + hoursInDay) % hoursInDay) + 1 };
}

export function rangeSummary({ firstHour, hourCount }: HourRange) {
  const word = hourWord[plural.select(hourCount) as keyof typeof hourWord];
  return `${firstHour}:00 → ${clockHour(firstHour + hourCount)}:00 · ${hourCount} ${word}`;
}
