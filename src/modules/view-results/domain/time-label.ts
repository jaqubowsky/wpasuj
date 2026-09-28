import { clockEndHour, clockHour } from "@/shared/dates/format";
import { addDays } from "@/shared/dates/iso-date";

type TimeRange = { date: string; firstHour: number; lastHour: number };

const longWeekday = new Intl.DateTimeFormat("pl", { timeZone: "UTC", weekday: "long" });
const dayAndMonthLong = new Intl.DateTimeFormat("pl", { timeZone: "UTC", day: "numeric", month: "long" });
const hoursInDay = 24;

function dayAndMonth(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(day)}.${month}`;
}

function capitalised(text: string) {
  return text.charAt(0).toLocaleUpperCase("pl") + text.slice(1);
}

function calendarDate(date: string, hour: number) {
  return hour >= hoursInDay ? addDays(date, 1) : date;
}

function longDay(date: string) {
  return `${capitalised(longWeekday.format(new Date(`${date}T00:00:00Z`)))} ${dayAndMonth(date)}`;
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
  const day = new Date(`${calendarDate(date, firstHour)}T00:00:00Z`);
  return {
    weekday: capitalised(longWeekday.format(day)),
    day: dayAndMonthLong.format(day),
    hours: `${clockHour(firstHour)}:00–${clockEndHour(lastHour)}:00`,
  };
}
