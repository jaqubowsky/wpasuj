import { shortWeekday } from "@/shared/dates/format";

type TimeRange = { date: string; firstHour: number; lastHour: number };

const longWeekday = new Intl.DateTimeFormat("pl", { timeZone: "UTC", weekday: "long" });

function dayAndMonth(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(day)}.${month}`;
}

const dayAndMonthLong = new Intl.DateTimeFormat("pl", { timeZone: "UTC", day: "numeric", month: "long" });

function capitalised(text: string) {
  return text.charAt(0).toLocaleUpperCase("pl") + text.slice(1);
}

export function longRunLabel({ date, firstHour, lastHour }: TimeRange) {
  return `${capitalised(longWeekday.format(new Date(`${date}T00:00:00Z`)))} ${dayAndMonth(date)}, ${firstHour}–${lastHour}`;
}

export function shortRunLabel({ date, firstHour, lastHour }: TimeRange) {
  return `${shortWeekday(date)} ${dayAndMonth(date)}, ${firstHour}–${lastHour}`;
}

export function setTimeLabel({ date, firstHour, lastHour }: TimeRange) {
  const day = new Date(`${date}T00:00:00Z`);
  return {
    weekday: capitalised(longWeekday.format(day)),
    day: dayAndMonthLong.format(day),
    hours: `${firstHour}:00–${lastHour}:00`,
  };
}
