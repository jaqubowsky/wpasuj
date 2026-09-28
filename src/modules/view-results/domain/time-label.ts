import { clockEndHour, clockHour, dayAndMonth, dayAndMonthLong, longWeekday } from "@/shared/dates/format";
import { addDays } from "@/shared/dates/iso-date";

type TimeRange = { date: string; firstHour: number; lastHour: number };

const hoursInDay = 24;

function calendarDate(date: string, hour: number) {
  return hour >= hoursInDay ? addDays(date, 1) : date;
}

function longDay(date: string) {
  return `${longWeekday(date)} ${dayAndMonth(date)}`;
}

export function runParts({ date, firstHour, lastHour }: TimeRange) {
  return { day: longDay(calendarDate(date, firstHour)), hours: `${clockHour(firstHour)}–${clockEndHour(lastHour)}` };
}

export function longRunLabel(run: TimeRange) {
  const { day, hours } = runParts(run);
  return `${day}, ${hours}`;
}

export function hourLabel({ date, hour }: { date: string; hour: number }) {
  return `${longDay(calendarDate(date, hour))}, ${clockHour(hour)}:00`;
}

export function setTimeShown({ date, firstHour, lastHour }: TimeRange) {
  const day = calendarDate(date, firstHour);
  return {
    weekday: longWeekday(day),
    day: dayAndMonthLong(day),
    hours: `${clockHour(firstHour)}:00–${clockEndHour(lastHour)}:00`,
  };
}
