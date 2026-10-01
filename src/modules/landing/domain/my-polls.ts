import { clockEndHour, clockHour, dayAndMonth, longWeekday, shortWeekday } from "@/shared/dates/format";
import { addDays } from "@/shared/dates/iso-date";

type Role = "organiser" | "participant";
export type FinalTime = { date: string; firstHour: number; lastHour: number };

const daysKeptAfterLastDate = 60;
const hoursInDay = 24;

const roles: Record<Role, string> = { organiser: "Twoja ankieta", participant: "Odpowiadasz" };

const answered: Record<Intl.LDMLPluralRule, string> = {
  zero: "osób odpowiedziało",
  one: "osoba odpowiedziała",
  two: "osoby odpowiedziały",
  few: "osoby odpowiedziały",
  many: "osób odpowiedziało",
  other: "osób odpowiedziało",
};

const plural = new Intl.PluralRules("pl");

function shortDay(date: string) {
  return `${shortWeekday(date)} ${dayAndMonth(date)}`;
}

export function livePolls<Poll extends { lastDate: string }>(polls: Poll[], today: string) {
  const cutoff = addDays(today, -daysKeptAfterLastDate);

  return polls.filter(({ lastDate }) => lastDate >= cutoff);
}

export function roleLine(role: Role, dates: string[]) {
  const [first, last] = [dates[0], dates.at(-1)!];
  const span = first === last ? shortDay(first) : `${shortDay(first)} – ${shortDay(last)}`;

  return `${roles[role]} · ${span}`;
}

export function answersLine(count: number) {
  if (count === 0) return "Nikt jeszcze nie odpowiedział";

  return `${count} ${answered[plural.select(count)]}`;
}

export function settledLine({ date, firstHour, lastHour }: FinalTime) {
  const day = firstHour >= hoursInDay ? addDays(date, 1) : date;

  return `Ustalone: ${longWeekday(day).toLocaleLowerCase("pl")} ${dayAndMonth(day)}, ${clockHour(firstHour)}–${clockEndHour(lastHour)}`;
}
