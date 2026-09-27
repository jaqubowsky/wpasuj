const weekdays = ["nd", "pn", "wt", "śr", "cz", "pt", "sb"];

const inUtc = { timeZone: "UTC" } as const;
const monthGenitive = new Intl.DateTimeFormat("pl", { ...inUtc, day: "numeric", month: "long" });
const monthShort = new Intl.DateTimeFormat("pl", { ...inUtc, month: "short" });
const weekdayLong = new Intl.DateTimeFormat("pl", { ...inUtc, weekday: "long" });

function asDate(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

export function shortWeekday(date: string) {
  return weekdays[asDate(date).getUTCDay()];
}

export function dayNumber(date: string) {
  return String(asDate(date).getUTCDate());
}

export function fullDate(date: string) {
  return `${weekdayLong.format(asDate(date))}, ${monthGenitive.format(asDate(date))}`;
}

export function summaryOfDates(dates: string[]) {
  return dates
    .map((date, index) => {
      const closesMonth = dates[index + 1]?.slice(0, 7) !== date.slice(0, 7);
      const day = closesMonth ? monthGenitive.format(asDate(date)) : dayNumber(date);
      return `${shortWeekday(date)} ${day}`;
    })
    .join(", ");
}

export function monthOnFirstDay(date: string) {
  return asDate(date).getUTCDate() === 1 ? monthShort.format(asDate(date)) : undefined;
}
