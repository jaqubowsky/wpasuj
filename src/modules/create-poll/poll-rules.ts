import { addDays } from "@/shared/dates/iso-date";
import type { HourRange } from "./hour-range";

export const daysKeptAfterLastDate = 60;

export function hasPastDate(dates: string[], today: string) {
  return dates.some((date) => date < today);
}

export function expiryCutoff(today: string) {
  return addDays(today, -daysKeptAfterLastDate);
}

export function isExpired(dates: string[], today: string) {
  return dates.every((date) => date < expiryCutoff(today));
}

export function fitsPoll(poll: HourRange & { dates: string[] }, final: HourRange & { date: string }) {
  return poll.dates.includes(final.date) && final.firstHour >= poll.firstHour && final.lastHour <= poll.lastHour;
}
