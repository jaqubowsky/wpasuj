import { dayAndMonth, dayAndMonthLong, longWeekday, shortWeekday } from "@/shared/dates/format";

type TimeRange = { date: string; firstHour: number; lastHour: number };

export function longRunLabel({ date, firstHour, lastHour }: TimeRange) {
  return `${longWeekday(date)} ${dayAndMonth(date)}, ${firstHour}–${lastHour}`;
}

export function shortRunLabel({ date, firstHour, lastHour }: TimeRange) {
  return `${shortWeekday(date)} ${dayAndMonth(date)}, ${firstHour}–${lastHour}`;
}

export function setTimeLabel({ date, firstHour, lastHour }: TimeRange) {
  return {
    weekday: longWeekday(date),
    day: dayAndMonthLong(date),
    hours: `${firstHour}:00–${lastHour}:00`,
  };
}
