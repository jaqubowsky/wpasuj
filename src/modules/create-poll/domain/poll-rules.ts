import { addDays, todayIn } from "@/shared/dates/iso-date";
import type { HourRange } from "./hour-range";

const daysKeptAfterLastDate = 60;

const lastZoneToReachToday = "Etc/GMT+12";

export function isPastDate(date: string, today: string) {
  return date < today;
}

export function hasPastDate(dates: string[], today: string) {
  return dates.some((date) => isPastDate(date, today));
}

function expiryCutoff(today: string) {
  return addDays(today, -daysKeptAfterLastDate);
}

export function cleanupCutoff(now: Date) {
  return expiryCutoff(todayIn(lastZoneToReachToday, now));
}

export function isExpired(dates: string[], today: string) {
  return dates.every((date) => date < expiryCutoff(today));
}

export function fitsPoll(poll: HourRange & { dates: string[] }, final: { date: string; firstHour: number; lastHour: number }) {
  return poll.dates.includes(final.date) && final.firstHour >= poll.firstHour && final.lastHour <= poll.firstHour + poll.hourCount;
}
