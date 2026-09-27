import { shortWeekday } from "@/shared/dates/format";

type TimeRange = { date: string; firstHour: number; lastHour: number };

const longWeekday = new Intl.DateTimeFormat("pl", { timeZone: "UTC", weekday: "long" });

function dayAndMonth(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(day)}.${month}`;
}

function capitalised(text: string) {
  return text.charAt(0).toLocaleUpperCase("pl") + text.slice(1);
}

function longDay(date: string) {
  return `${capitalised(longWeekday.format(new Date(`${date}T00:00:00Z`)))} ${dayAndMonth(date)}`;
}

export function longRunLabel({ date, firstHour, lastHour }: TimeRange) {
  return `${longDay(date)}, ${firstHour}–${lastHour}`;
}

export function shortRunLabel({ date, firstHour, lastHour }: TimeRange) {
  return `${shortWeekday(date)} ${dayAndMonth(date)}, ${firstHour}–${lastHour}`;
}

export function hourLabel({ date, hour }: { date: string; hour: number }) {
  return `${longDay(date)}, ${hour}:00`;
}
